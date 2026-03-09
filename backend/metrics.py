"""
metrics.py
----------
Standardized metric computation for binary, multiclass, and regression tasks.
Confusion matrices only rendered for classification tasks.
"""

import os
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, r2_score, mean_squared_error, mean_absolute_error,
)

from config import CONFUSION_MATRIX_FOLDER, RESULTS_FOLDER


def compute_metrics(y_true, y_pred, framework_name: str,
                    best_model_name: str, exec_time: float,
                    task: str = "binary") -> dict:
    """
    Compute standardized metrics for any task type.
    task: 'binary' | 'multiclass' | 'regression'
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    base = {
        "framework":              framework_name,
        "best_model":             best_model_name,
        "execution_time_seconds": round(float(exec_time), 2),
        "task":                   task,
    }

    if task == "regression":
        r2   = r2_score(y_true, y_pred)
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        mae  = float(mean_absolute_error(y_true, y_pred))
        base.update({
            "r2":               round(r2,   4),
            "rmse":             round(rmse, 4),
            "mae":              round(mae,  4),
            # Keep these keys for template compatibility (show N/A for regression)
            "accuracy":         None,
            "f1_score":         None,
            "precision":        None,
            "recall":           None,
            "confusion_matrix": None,
        })
    else:
        avg = "weighted"
        acc  = accuracy_score(y_true, y_pred)
        f1   = f1_score(y_true, y_pred, average=avg, zero_division=0)
        prec = precision_score(y_true, y_pred, average=avg, zero_division=0)
        rec  = recall_score(y_true, y_pred, average=avg, zero_division=0)
        cm   = confusion_matrix(y_true, y_pred).tolist()
        base.update({
            "accuracy":         round(float(acc),  4),
            "f1_score":         round(float(f1),   4),
            "precision":        round(float(prec), 4),
            "recall":           round(float(rec),  4),
            "confusion_matrix": cm,
            # Regression keys → None for template compatibility
            "r2":   None,
            "rmse": None,
            "mae":  None,
        })

    return base


def plot_confusion_matrix(cm_data: list, framework_name: str,
                          class_labels=None) -> str:
    """Plot and save confusion matrix. Returns relative path."""
    cm_array  = np.array(cm_data)
    n_classes = cm_array.shape[0]
    labels    = class_labels if class_labels else [str(i) for i in range(n_classes)]

    fig, ax = plt.subplots(figsize=(max(5, n_classes * 1.5), max(4, n_classes * 1.2)))
    sns.heatmap(
        cm_array, annot=True, fmt="d", cmap="Blues",
        xticklabels=labels, yticklabels=labels,
        linewidths=0.5, ax=ax,
    )
    ax.set_title(f"{framework_name} — Confusion Matrix",
                 fontsize=13, fontweight="bold", pad=12)
    ax.set_ylabel("Actual",    fontsize=11)
    ax.set_xlabel("Predicted", fontsize=11)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    filename  = f"{framework_name.lower()}_cm.png"
    save_path = os.path.join(CONFUSION_MATRIX_FOLDER, filename)
    plt.savefig(save_path, dpi=120, bbox_inches="tight")
    plt.close()
    return f"confusion_matrices/{filename}"


def determine_winner(results: list) -> dict:
    """
    Pick winner by primary metric.
    Classification → highest accuracy.
    Regression     → highest R².
    Tiebreak: fastest execution time.
    """
    valid = [r for r in results if r.get("status") == "success"]
    if not valid:
        return {}

    task = valid[0].get("task", "binary")
    if task == "regression":
        key = lambda r: (-r.get("r2", -999), r["execution_time_seconds"])
    else:
        key = lambda r: (-r.get("accuracy", 0), r["execution_time_seconds"])

    return sorted(valid, key=key)[0]


def _pick_best(results_per_algo: dict, y_true, task: str) -> str:
    """Return the name of the best algorithm from per-algo results dict."""
    if task == "regression":
        return max(results_per_algo,
                   key=lambda k: r2_score(y_true, results_per_algo[k]["preds"]))
    else:
        return max(results_per_algo,
                   key=lambda k: accuracy_score(y_true, results_per_algo[k]["preds"]))


def algo_score(y_true, preds, task: str) -> float:
    """Single scalar score for an algorithm — R² for regression, accuracy for classification."""
    if task == "regression":
        return round(float(r2_score(y_true, preds)), 4)
    return round(float(accuracy_score(y_true, preds)), 4)


def generate_comparison_report(results: list) -> dict:
    winner = determine_winner(results)
    report = {
        "results":               results,
        "winner":                winner,
        "total_frameworks_run":  len(results),
        "successful_frameworks": sum(1 for r in results if r.get("status") == "success"),
        "task":                  results[0].get("task", "binary") if results else "binary",
    }
    report_path = os.path.join(RESULTS_FOLDER, "comparison_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    return report
