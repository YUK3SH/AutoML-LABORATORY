"""
flaml_runner.py — supports binary, multiclass, regression.
"""

import time, os, pickle, traceback, warnings
import numpy as np
import pandas as pd

from backend.metrics import compute_metrics, plot_confusion_matrix, algo_score
from config import FLAML_MAX_RUNTIME, MODELS_FOLDER, RANDOM_STATE


def run_flaml(X_train, X_test, y_train, y_test,
              task="binary", class_labels=None) -> dict:

    try:
        from flaml import AutoML

        # Ensure pandas format
        if not isinstance(X_train, pd.DataFrame):
            X_train = pd.DataFrame(X_train)
        if not isinstance(X_test, pd.DataFrame):
            X_test = pd.DataFrame(X_test)

        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)

        if X_train.shape[1] < 1:
            return {
                "framework": "FLAML",
                "status": "error",
                "error": "Dataset must contain at least 1 feature column."
            }

        y_true = y_test.values

        flaml_task = "regression" if task == "regression" else "classification"
        metric = "r2" if task == "regression" else "accuracy"

        estimators = ["lgbm", "xgboost"]
        estimator_labels = ["LightGBM", "XGBoost"]

        results_per_algo = {}

        for estimator, label in zip(estimators, estimator_labels):

            try:
                automl = AutoML()

                t0 = time.time()

                automl.fit(
                    X_train.values,
                    y_train.values,
                    time_budget=max(30, FLAML_MAX_RUNTIME // 2),
                    metric=metric,
                    task=flaml_task,
                    estimator_list=[estimator],
                    seed=RANDOM_STATE,
                    verbose=0,
                    n_jobs=-1,
                )

                elapsed = time.time() - t0

                preds = automl.predict(X_test.values)

                results_per_algo[label] = {
                    "preds": preds,
                    "time": elapsed,
                    "model": automl
                }

            except Exception:
                # Skip failed algorithm
                continue

        if not results_per_algo:
            return {
                "framework": "FLAML",
                "status": "error",
                "error": "FLAML could not train any model."
            }

        best_name = max(
            results_per_algo,
            key=lambda k: algo_score(y_true, results_per_algo[k]["preds"], task)
        )

        best = results_per_algo[best_name]

        total_time = sum(v["time"] for v in results_per_algo.values())

        model_path = os.path.join(
            MODELS_FOLDER,
            f"flaml_{best_name.lower()}.pkl"
        )

        with open(model_path, "wb") as f:
            pickle.dump(best["model"], f)

        metrics = compute_metrics(
            y_true,
            best["preds"],
            "FLAML",
            f"FLAML-{best_name}",
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
                "FLAML",
                class_labels=class_labels or [str(c) for c in sorted(set(y_true))]
            )

        else:
            metrics["cm_image"] = None

        metrics["status"] = "success"

        return metrics

    except Exception as e:
        return {
            "framework": "FLAML",
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }