"""
tpot_runner.py — supports binary, multiclass, regression.
Falls back to sklearn if TPOT unavailable or dataset too small.
"""

import time, os, pickle, traceback, warnings
import pandas as pd

from backend.metrics import compute_metrics, plot_confusion_matrix, algo_score
from config import MODELS_FOLDER, RANDOM_STATE
from sklearn.preprocessing import LabelEncoder

def _train_both_directly(X_train, X_test, y_train, y_test, task):
    from xgboost import XGBClassifier, XGBRegressor
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

    if task == "regression":
        models = {
            "XGBoost": XGBRegressor(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                subsample=0.8,
                random_state=RANDOM_STATE,
                verbosity=0,
            ),
            "Random Forest": RandomForestRegressor(
                n_estimators=200,
                max_depth=10,
                random_state=RANDOM_STATE,
                n_jobs=-1,
            ),
        }
    else:
        models = {
            "XGBoost": XGBClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                subsample=0.8,
                eval_metric="logloss",
                random_state=RANDOM_STATE,
                verbosity=0,
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=200,
                max_depth=5,
                random_state=RANDOM_STATE,
                n_jobs=-1,
            ),
        }

    results = {}

    for name, model in models.items():
        t0 = time.time()
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        results[name] = {
            "preds": preds,
            "time": time.time() - t0,
            "model": model,
        }

    return results


def _run_tpot_native(X_train, X_test, y_train, y_test, task):

    if task == "regression":
        from tpot import TPOTRegressor
        tpot = TPOTRegressor(
            generations=5,
            population_size=20,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            max_time_mins=3,
        )
    else:
        from tpot import TPOTClassifier
        tpot = TPOTClassifier(
            generations=5,
            population_size=20,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            max_time_mins=3,
        )

    with warnings.catch_warnings():
        warnings.filterwarnings("ignore")

        t0 = time.time()
        tpot.fit(X_train, y_train.values)
        elapsed = time.time() - t0

        preds = tpot.predict(X_test)

    pipeline_str = str(tpot.fitted_pipeline_)

    if "XGB" in pipeline_str:
        winner = "XGBoost"
    else:
        winner = "Random Forest"

    fallback = _train_both_directly(X_train, X_test, y_train, y_test, task)

    return {
        winner: {"preds": preds, "time": elapsed},
        **fallback
    }, tpot


def run_tpot(X_train, X_test, y_train, y_test,
             task="binary", class_labels=None) -> dict:

    try:

        # Ensure pandas format
        if not isinstance(X_train, pd.DataFrame):
            X_train = pd.DataFrame(X_train)

        if not isinstance(X_test, pd.DataFrame):
            X_test = pd.DataFrame(X_test)

        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)
        if task != "regression":
            le = LabelEncoder()
            y_train = pd.Series(le.fit_transform(y_train))
            y_test = pd.Series(le.transform(y_test))
        y_true = y_test.values

        # Dataset safety check
        if X_train.shape[1] < 1 or len(X_train) < 50:
            results_per_algo = _train_both_directly(
                X_train, X_test, y_train, y_test, task
            )
            tpot_obj = None
        else:
            try:
                results_per_algo, tpot_obj = _run_tpot_native(
                    X_train, X_test, y_train, y_test, task
                )
            except (ImportError, ModuleNotFoundError):
                results_per_algo = _train_both_directly(
                    X_train, X_test, y_train, y_test, task
                )
                tpot_obj = None

        best_name = max(
            results_per_algo,
            key=lambda k: algo_score(
                y_true, results_per_algo[k]["preds"], task
            ),
        )

        best = results_per_algo[best_name]

        total_time = sum(v["time"] for v in results_per_algo.values())

        save_obj = tpot_obj.fitted_pipeline_ if tpot_obj else best.get("model")

        if save_obj:
            path = os.path.join(
                MODELS_FOLDER,
                f"tpot_{best_name.lower().replace(' ','_')}.pkl",
            )

            with open(path, "wb") as f:
                pickle.dump(save_obj, f)

        metrics = compute_metrics(
            y_true,
            best["preds"],
            "TPOT",
            f"TPOT-{best_name}",
            total_time,
            task=task,
        )

        metrics["algorithms_tested"] = list(results_per_algo.keys())

        metrics["algorithm_scores"] = {
            k: algo_score(y_true, v["preds"], task)
            for k, v in results_per_algo.items()
        }

        if task != "regression" and metrics.get("confusion_matrix"):

            metrics["cm_image"] = plot_confusion_matrix(
                metrics["confusion_matrix"],
                "TPOT",
                class_labels=class_labels
                or [str(c) for c in sorted(set(y_true))],
            )

        else:
            metrics["cm_image"] = None

        metrics["status"] = "success"

        return metrics

    except Exception as e:

        return {
            "framework": "TPOT",
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }