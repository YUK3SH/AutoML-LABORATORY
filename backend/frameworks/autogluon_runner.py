"""
autogluon_runner.py — supports binary, multiclass, regression.
"""

import time, os, shutil, traceback, warnings
import pandas as pd

from backend.metrics import compute_metrics, plot_confusion_matrix, algo_score
from config import AUTOGLUON_MAX_RUNTIME, MODELS_FOLDER

warnings.filterwarnings("ignore")


def _fresh_path(label: str) -> str:
    path = os.path.join(MODELS_FOLDER, f"autogluon_{label.lower()}")
    if os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)
    os.makedirs(path, exist_ok=True)
    return path


def run_autogluon(X_train, X_test, y_train, y_test,
                  task="binary", class_labels=None) -> dict:
    try:
        from autogluon.tabular import TabularPredictor

        # Ensure pandas format
        if not isinstance(X_train, pd.DataFrame):
            X_train = pd.DataFrame(X_train)
        if not isinstance(X_test, pd.DataFrame):
            X_test = pd.DataFrame(X_test)

        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)

        ag_metric = "r2" if task == "regression" else "accuracy"

        train_df = X_train.copy()
        train_df["label"] = y_train.values

        test_df = X_test.copy()
        y_true = y_test.values

        results_per_algo = {}

        models_to_run = [
            ("GBM", "LightGBM"),
            ("CAT", "CatBoost"),
        ]

        for model_type, label in models_to_run:
            try:
                save_path = _fresh_path(label)

                predictor = TabularPredictor(
                    label="label",
                    path=save_path,
                    eval_metric=ag_metric,
                    verbosity=0,
                    problem_type="regression" if task == "regression" else None,  # ← ADD THIS
                )

                t0 = time.time()

                predictor.fit(
                    train_df,
                    included_model_types=[model_type],
                    time_limit=max(30, AUTOGLUON_MAX_RUNTIME // 2),
                    presets="medium_quality",
                    excluded_model_types=["NN_TORCH", "FASTAI", "TABPFN"],  
                    auto_stack=False
                )

                elapsed = time.time() - t0

                preds = predictor.predict(test_df).values

                results_per_algo[label] = {
                    "preds": preds,
                    "time": elapsed,
                }

            except Exception:
                # Skip failed model but continue
                continue

        # If no model trained
        if not results_per_algo:
            return {
                "framework": "AutoGluon",
                "status": "error",
                "error": "AutoGluon could not train any model."
            }

        # Select best algorithm
        best_name = max(
            results_per_algo,
            key=lambda k: algo_score(y_true, results_per_algo[k]["preds"], task)
        )

        total_time = sum(v["time"] for v in results_per_algo.values())

        metrics = compute_metrics(
            y_true,
            results_per_algo[best_name]["preds"],
            "AutoGluon",
            f"AutoGluon-{best_name}",
            total_time,
            task=task
        )

        metrics["algorithms_tested"] = list(results_per_algo.keys())

        metrics["algorithm_scores"] = {
            k: algo_score(y_true, v["preds"], task)
            for k, v in results_per_algo.items()
        }

        if task != "regression" and metrics.get("confusion_matrix"):
            metrics["cm_image"] = plot_confusion_matrix(
                metrics["confusion_matrix"],
                "AutoGluon",
                class_labels=class_labels or [str(c) for c in sorted(set(y_true))]
            )
        else:
            metrics["cm_image"] = None

        metrics["status"] = "success"

        return metrics

    except Exception as e:
        return {
            "framework": "AutoGluon",
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }