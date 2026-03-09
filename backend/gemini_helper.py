"""
gemini_helper.py
----------------
Sends experiment results to Google Gemini API for detailed AI analysis.
Works for ANY binary classification dataset — not Titanic-specific.
"""

import os
import json
import urllib.request
import urllib.error

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def generate_demo_analysis(report: dict, dataset_info: dict = None) -> dict:
    """
    Generate a high-quality static analysis report for demo purposes.
    """
    ds = dataset_info or {}
    dataset_name = ds.get("name", "the dataset")
    results = [r for r in report.get("results", []) if r.get("status") == "success"]
    if not results:
        return {"analysis": None, "error": "No successful results to analyze."}

    winner = report.get("winner", {})
    task = report.get("task", "binary")
    
    # Simple template-based demo analysis
    demo_text = f"""## 🧪 Demo AI Analysis: {dataset_name}

**Note: This is a Demo Analysis generated locally because no valid Gemini API key was detected.**

### 1. Winner Analysis
The **{winner.get('best_model', 'N/A')}** model emerged as the top performer using the **{winner.get('framework', 'N/A')}** framework. 
It achieved an {'R²' if task == 'regression' else 'Accuracy'} of **{winner.get('accuracy', 0)*100 if task != 'regression' else winner.get('r2', 0):.2f}{'%' if task != 'regression' else ''}**.

### 2. Technical Comparison
Across the {len(results)} frameworks tested, we observe a consistent trend where gradient-boosting algorithms (like those used in H2O and AutoGluon) outperformed traditional linear models. This is typical for tabular data with complex feature interactions.

### 3. Recommendation
For production deployment, we recommend the winner due to its superior balance of inference speed and predictive power. To further improve results, consider:
- **Feature Engineering**: Creating interaction terms between top features.
- **Hyperparameter Tuning**: Running a longer search (e.g., 1 hour+) for the top-performing frameworks.
- **Ensemble Methods**: Stacking the top 3 models could yield a 1-2% performance boost.
"""
    return {"analysis": demo_text, "error": None}


def analyze_results_with_gemini(report: dict, dataset_info: dict = None, use_demo: bool = False) -> dict:
    """
    Send comparison report to Gemini for expert analysis.
    dataset_info: optional dict with keys: name, target_column, n_rows, n_cols, task
    """
    if use_demo:
        return generate_demo_analysis(report, dataset_info)

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_key_here":
        return {
            "error": "GEMINI_API_KEY not set or invalid. Add a valid key to your .env file.",
            "analysis": None,
            "can_demo": True
        }

    results = [r for r in report.get("results", []) if r.get("status") == "success"]
    failed  = [r for r in report.get("results", []) if r.get("status") != "success"]
    winner  = report.get("winner", {})

    # Dataset context — generic fallback if no info provided
    ds = dataset_info or {}
    dataset_name   = ds.get("name", "the uploaded dataset")
    target_col     = ds.get("target_column", "the target column")
    n_rows         = ds.get("n_rows", "unknown")
    n_cols         = ds.get("n_cols", "unknown")
    task_type      = ds.get("task", "binary classification")

    task = report.get("task", "binary")
    if task == "regression":
        task_config_label = "Regression"
    elif task == "multiclass":
        task_config_label = "Multiclass Classification"
    else:
        task_config_label = "Binary Classification"
    # Build metrics table rows — different columns for regression vs classification
    metrics_rows = []
    for r in results:
        algo_scores = r.get("algorithm_scores", {})
        algo_detail = " vs ".join([f"{k}: {v}" for k, v in algo_scores.items()])
        if task == "regression":
            metrics_rows.append(
                f"| {r['framework']} | {r['best_model']} | "
                f"**R²={r.get('r2',0):.4f}** | **RMSE={r.get('rmse',0):.4f}** | "
                f"**MAE={r.get('mae',0):.4f}** | {r['execution_time_seconds']}s | {algo_detail} |"
            )
        else:
            metrics_rows.append(
                f"| {r['framework']} | {r['best_model']} | "
                f"**{r.get('accuracy',0)*100:.2f}%** | **{r.get('f1_score',0)*100:.2f}%** | "
                f"**{r.get('precision',0)*100:.2f}%** | **{r.get('recall',0)*100:.2f}%** | "
                f"{r['execution_time_seconds']}s | {algo_detail} |"
            )

    failed_text = ""
    if failed:
        failed_text = "\n**Failed Frameworks:**\n" + "\n".join(
            [f"- {f['framework']}: {f.get('error','Unknown error')}" for f in failed]
        )

    if not results:
        return {"analysis": None, "error": "No successful results to analyze."}

    fastest = min(results, key=lambda r: r['execution_time_seconds'])

    if task == "regression":
        best_acc  = max(results, key=lambda r: r.get('r2', -999))
        worst_acc = min(results, key=lambda r: r.get('r2', -999))
        acc_gap   = best_acc.get('r2', 0) - worst_acc.get('r2', 0)
        best_f1 = best_prec = best_rec = best_acc  # not used for regression
    else:
        best_acc  = max(results, key=lambda r: r.get('accuracy', 0))
        worst_acc = min(results, key=lambda r: r.get('accuracy', 0))
        best_f1   = max(results, key=lambda r: r.get('f1_score', 0))
        best_prec = max(results, key=lambda r: r.get('precision', 0))
        best_rec  = max(results, key=lambda r: r.get('recall', 0))
        acc_gap   = (best_acc.get('accuracy', 0) - worst_acc.get('accuracy', 0)) * 100

    # Metric-specific rankings based on task
    if task == "regression":
        ranking_sections = f"""
**R² Ranking:** (best={best_acc['framework']} {best_acc.get('r2',0):.4f}, worst={worst_acc['framework']} {worst_acc.get('r2',0):.4f})
**RMSE Ranking:** (best={min(results, key=lambda r: r.get('rmse',99)).get('framework')} {min(results, key=lambda r: r.get('rmse',99)).get('rmse',0):.4f})
**MAE Ranking:** (best={min(results, key=lambda r: r.get('mae',99)).get('framework')} {min(results, key=lambda r: r.get('mae',99)).get('mae',0):.4f})
"""
        winner_score_label = f"R² ({best_acc.get('r2', 0):.4f})"
        gap_label = "R² gap"
        improvement_label = f"R² {best_acc.get('r2',0):.4f}"
    else:
        ranking_sections = f"""
**Accuracy Ranking:** (best={best_acc['framework']} {best_acc.get('accuracy',0)*100:.2f}%, worst={worst_acc['framework']} {worst_acc.get('accuracy',0)*100:.2f}%)
**F1-Score Ranking:** (best={best_f1['framework']} {best_f1.get('f1_score',0)*100:.2f}%)
**Precision Ranking:** (best={best_prec['framework']} {best_prec.get('precision',0)*100:.2f}%)
**Recall Ranking:** (best={best_rec['framework']} {best_rec.get('recall',0)*100:.2f}%)
"""
        winner_score_label = f"Accuracy ({best_acc.get('accuracy', 0)*100:.2f}%)"
        gap_label = "accuracy gap"
        improvement_label = f"Accuracy {best_acc.get('accuracy', 0)*100:.2f}%"

    acc_gap_str = f"{acc_gap:.4f}" if task == "regression" else f"{acc_gap:.2f}%"


    prompt = f"""You are a senior ML engineer. Analyze these AutoML benchmark results and write a complete technical report.
DO NOT write a client header, date, or executive summary. Start DIRECTLY with Section 1.
Use the EXACT metric numbers given. Be specific and compare all frameworks against each other numerically.

---
**Dataset:** {dataset_name} | **Target:** {target_col} | **Rows:** {n_rows} | **Columns:** {n_cols} | **Task:** {task_type} | **Split:** 80/20 stratified

## Benchmark Results

{('| Framework | Best Model | R² | RMSE | MAE | Time | Algorithm Comparison |' + chr(10) + '|-----------|-----------|-----|------|-----|------|---------------------|') if task == 'regression' else ('| Framework | Best Model | Accuracy | F1-Score | Precision | Recall | Time | Algorithm Comparison |' + chr(10) + '|-----------|-----------|----------|----------|-----------|--------|------|---------------------|')}
{chr(10).join(metrics_rows)}
{failed_text}

**Winner:** {winner.get('best_model','N/A')} — {'R²: ' + str(round(winner.get('r2',0),4)) + ', RMSE: ' + str(round(winner.get('rmse',0),4)) + ', MAE: ' + str(round(winner.get('mae',0),4)) if task == 'regression' else 'Accuracy: ' + str(round(winner.get('accuracy',0)*100,2)) + '%, F1: ' + str(round(winner.get('f1_score',0)*100,2)) + '%, Precision: ' + str(round(winner.get('precision',0)*100,2)) + '%, Recall: ' + str(round(winner.get('recall',0)*100,2)) + '%'}, Time: {winner.get('execution_time_seconds',0)}s

---

## 1.  Winner Analysis
- State which model won and its exact scores across ALL 4 metrics
- Compare winner's {winner_score_label} against each other framework numerically
- The {gap_label} between best and worst is {acc_gap_str} — is this significant for a real deployment decision?
- Explain WHY this specific algorithm type performs best on this type of tabular data

## 2. Metric-by-Metric Full Comparison
Rank ALL frameworks for EACH metric separately with actual values:

{ranking_sections}

For each metric explain: what it measures, which framework leads, and whether the differences are meaningful.

## 3. Speed vs Accuracy Tradeoff
- List all frameworks with their time and performance metric ({'R²' if task == 'regression' else 'Accuracy'})
- Fastest framework: {fastest['framework']} at {fastest['execution_time_seconds']}s — what performance did it achieve?
- Calculate and compare performance-per-second for each framework
- Is the extra training time of slower frameworks justified by the performance gain?

## 4. Internal Algorithm Comparison (per framework)
For each framework, analyze its two internal algorithm scores:
- Which algorithm won inside each framework?
- By how much did the winner beat the loser?
- Any surprising result where a simpler algorithm beat a complex one?

## 5. Why These Results Make Sense
- Why do certain algorithm types dominate on tabular/structured data?
- What dataset characteristics (size, feature types, class balance) influence these results?
- Why do gradient boosting variants consistently perform well?

## 6. Production Recommendation
Give a specific recommendation for 3 use cases:
- **Latency-critical** (fastest inference needed): Which framework and why?
- **Performance-critical** (best { 'R²' if task == 'regression' else 'accuracy' } needed): Which framework and why?
- **Balanced** (good performance, reasonable time): Which framework and why?

## 7. Top 5 Ways to Improve Performance Beyond {improvement_label}
Give 5 specific, actionable improvements:
1. Feature engineering (specific to {task_type} problems)
2. Hyperparameter tuning strategy with specific parameters to tune
3. Ensemble/stacking the top frameworks together
4. Data preprocessing improvements
5. Cross-validation and model selection strategy

## 8. Limitations
- Impact of dataset size ({n_rows} rows) on reliability of results
- Overfitting risks with small datasets
- What these benchmark results may NOT tell you

Be technical, precise, and use exact numbers throughout. Tailor advice to the task type ({task_config_label}). Use markdown with headers, **bold** for key numbers, and tables where useful."""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 8192,
        }
    }

    try:
        url  = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
        data = json.dumps(payload).encode("utf-8")
        req  = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode())
            text   = result["candidates"][0]["content"]["parts"][0]["text"]
            return {"analysis": text, "error": None}

    except urllib.error.HTTPError as e:
        body = e.read().decode()
        err_msg = f"Gemini API error {e.code}: {body[:300]}"
        can_demo = False
        if "leaked" in body.lower() or e.code == 403:
            err_msg = "Your API key was reported as leaked or is invalid. Please use another API key."
            can_demo = True
        return {"analysis": None, "error": err_msg, "can_demo": can_demo}
    except Exception as e:
        return {"analysis": None, "error": str(e)}
