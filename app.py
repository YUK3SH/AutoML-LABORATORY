"""
app.py  —  AutoML Laboratory (Extended)
Routes: auth, about, contact, download model, Gemini AI analysis
"""

import os, json, math, zipfile, io, warnings
from flask import (Flask, render_template, request, redirect,
                   url_for, jsonify, session, send_file, send_from_directory)
from werkzeug.utils import secure_filename

warnings.filterwarnings("ignore", message="X does not have valid feature names")
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

from config import (UPLOAD_FOLDER, RESULTS_FOLDER, CONFUSION_MATRIX_FOLDER,
                    ALLOWED_EXTENSIONS, MAX_CONTENT_LENGTH, MODELS_FOLDER, BASE_DIR)
from backend.database import (init_db, create_user, authenticate_user,
                               save_experiment, get_user_experiments,
                               get_experiment_by_id, save_contact_message)
from backend.auth import login_required, get_current_user
from backend.data_handler import load_csv, validate_data, stratified_split, get_class_labels
from backend.task_detector import detect_task, get_task_config
from backend.preprocessor import get_preprocessed_splits
from backend.runner import run_in_background, get_execution_state
import numpy as np
app = Flask(__name__, template_folder="frontend/templates", static_folder="frontend/static")
app.config["UPLOAD_FOLDER"]      = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
app.secret_key                   = "automl-lab-secret-key-2024"
from dotenv import load_dotenv
load_dotenv()
init_db()


def allowed_file(fn): return "." in fn and fn.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def sanitize_json(obj):
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)): return None
    if isinstance(obj, dict):  return {k: sanitize_json(v) for k, v in obj.items()}
    if isinstance(obj, list):  return [sanitize_json(i) for i in obj]
    return obj


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("signup.html")
    d = request.get_json()
    result = create_user(d["name"], d["email"], d["password"], d.get("college", ""))
    if result["success"]:
        user = authenticate_user(d["email"], d["password"])
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        return jsonify({"success": True})
    return jsonify(result), 400


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    d = request.get_json()
    user = authenticate_user(d["email"], d["password"])
    if user:
        session["user_id"]   = user["id"]
        session["user_name"] = user["name"]
        return jsonify({"success": True})
    return jsonify({"error": "Invalid email or password."}), 401


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("landing"))


# ── Pages ─────────────────────────────────────────────────────────────────────

@app.route("/")
def landing():
    user = get_current_user()
    return render_template("landing.html", user=user)


@app.route("/app")
@login_required
def index():
    user = get_current_user()
    return render_template("index.html", user=user)


@app.route("/about")
def about():
    user = get_current_user()
    return render_template("about.html", user=user)


@app.route("/contact", methods=["GET", "POST"])
def contact():
    user = get_current_user()
    if request.method == "POST":
        d = request.get_json()
        save_contact_message(d["name"], d["email"], d.get("subject", ""), d["message"])
        return jsonify({"success": True})
    return render_template("contact.html", user=user)


@app.route("/dashboard")
@login_required
def dashboard():
    user = get_current_user()
    experiments = get_user_experiments(user["id"])
    for e in experiments:
        if e.get("frameworks_used"):
            try: e["frameworks_used"] = json.loads(e["frameworks_used"])
            except: pass
    return render_template("dashboard.html", user=user, experiments=experiments)


# ── Upload & Run ──────────────────────────────────────────────────────────────

@app.route("/upload", methods=["POST"])
@login_required
def upload():
    import traceback
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV files allowed"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Load CSV
        df = load_csv(filepath)

        # Ensure preview doesn't break JSON
        preview = df.head(5).replace({np.nan: None}).to_dict(orient="records")

        return jsonify({
            "success": True,
            "columns": list(df.columns),
            "preview": preview,
            "filename": filename
        })

    except Exception as e:
        print("UPLOAD ERROR:")
        print(traceback.format_exc())

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/run", methods=["POST"])
@login_required
def run():
    d = request.get_json()
    filename, target_column = d.get("filename"), d.get("target_column")
    selected_frameworks = d.get("frameworks", [])
    if not all([filename, target_column, selected_frameworks]):
        return jsonify({"error": "Missing parameters."}), 400
    filepath = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found."}), 400
    try:
        df = load_csv(filepath)

        # remove rows where target is missing (generic ML rule)
        df = df.dropna(subset=[target_column])

        v = validate_data(df, target_column)
        if not v["valid"]: return jsonify({"error": " | ".join(v["issues"])}), 400
        # Auto-detect task type: binary / multiclass / regression
        task         = detect_task(df, target_column)
        task_config  = get_task_config(task)
        class_labels = get_class_labels(df, target_column)  # [] for regression

        X_train, X_test, y_train, y_test = stratified_split(df, target_column)
        X_train, X_test, y_train, y_test = get_preprocessed_splits(X_train, X_test, y_train, y_test)

        session["pending_run"] = {
            "dataset_name": filename, "target_column": target_column,
            "frameworks": selected_frameworks, "task": task,
        }
        run_in_background(X_train, X_test, y_train, y_test,
                          selected_frameworks, target_col=target_column,
                          class_labels=class_labels, task=task)

        session["last_run_info"] = {
            "name": filename, "target_column": target_column,
            "n_rows": len(df), "n_cols": len(df.columns),
            "task": task_config["label"], "class_labels": class_labels,
        }
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/loading")
@login_required
def loading():
    return render_template("loading.html", user=get_current_user())


@app.route("/status")
@login_required
def status():
    state = get_execution_state()
    return jsonify({
        "running": state["running"], "completed": state["completed"],
        "total": state["total"],     "current":   state["current"],
        "done":  state["done"],      "error":     state.get("error"),
    })


@app.route("/results")
@login_required
def results():
    report_path = os.path.join(RESULTS_FOLDER, "comparison_report.json")
    if not os.path.exists(report_path): return redirect(url_for("index"))
    with open(report_path) as f: report = json.load(f)

    # Auto-save experiment to DB
    user = get_current_user()
    pending = session.pop("pending_run", {})
    if user and pending and report.get("winner"):
        w    = report["winner"]
        task = pending.get("task", "binary")
        # Primary metric: accuracy for classification, R² for regression
        primary_score = w.get("accuracy") if task != "regression" else w.get("r2")
        save_experiment(
            user_id         = user["id"],
            dataset_name    = pending.get("dataset_name", ""),
            target_column   = pending.get("target_column", ""),
            frameworks_used = pending.get("frameworks", []),
            winner_model    = w.get("best_model", ""),
            winner_accuracy = primary_score or 0,
            report_json     = report,
        )
    return render_template("results.html", report=report, user=user)


@app.route("/results/json")
@login_required
def results_json():
    p = os.path.join(RESULTS_FOLDER, "comparison_report.json")
    if not os.path.exists(p): return jsonify({"error": "No results."}), 404
    return jsonify(json.load(open(p)))


@app.route("/results/confusion_matrices/<path:filename>")
def serve_cm(filename):
    return send_from_directory(CONFUSION_MATRIX_FOLDER, filename)


# ── Download Model ────────────────────────────────────────────────────────────

@app.route("/download/models")
@login_required
def download_models():
    """Zip all saved model artifacts and send as download."""
    buf = io.BytesIO()
    found = False
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(MODELS_FOLDER):
            for fname in files:
                fpath = os.path.join(root, fname)
                arcname = os.path.relpath(fpath, MODELS_FOLDER)
                zf.write(fpath, arcname)
                found = True
        # Also include the comparison report
        report_path = os.path.join(RESULTS_FOLDER, "comparison_report.json")
        if os.path.exists(report_path):
            zf.write(report_path, "comparison_report.json")
            found = True
    if not found:
        return jsonify({"error": "No models trained yet. Run an experiment first."}), 404
    buf.seek(0)
    return send_file(buf, mimetype="application/zip",
                     as_attachment=True, download_name="automl_models.zip")


@app.route("/download/report")
@login_required
def download_report():
    """Download the comparison report JSON."""
    p = os.path.join(RESULTS_FOLDER, "comparison_report.json")
    if not os.path.exists(p):
        return jsonify({"error": "No report yet."}), 404
    return send_file(p, mimetype="application/json",
                     as_attachment=True, download_name="automl_report.json")


# ── Gemini AI Analysis ────────────────────────────────────────────────────────

@app.route("/analyze/gemini", methods=["POST"])
@login_required
def gemini_analyze():
    from backend.gemini_helper import analyze_results_with_gemini
    p = os.path.join(RESULTS_FOLDER, "comparison_report.json")
    if not os.path.exists(p):
        return jsonify({"error": "No results to analyze."}), 404
    with open(p) as f: report = json.load(f)
    # Pass dataset metadata so analysis is fully dataset-agnostic
    dataset_info = session.get("last_run_info", {})
    result = analyze_results_with_gemini(report, dataset_info=dataset_info)
    return jsonify(result)


if __name__ == "__main__":
    # Use 7860 as default for Hugging Face compatibility
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
