"""
h2o_runner.py — supports binary, multiclass, regression.
Falls back to sklearn equivalents if H2O fails.
"""

import time, traceback, warnings
import pandas as pd
import numpy as np

from backend.metrics import compute_metrics, plot_confusion_matrix, algo_score
from config import H2O_MAX_RUNTIME, RANDOM_STATE


def _run_sklearn_fallback(X_train, X_test, y_train, y_test, task):
    from sklearn.ensemble import (
        GradientBoostingClassifier,
        GradientBoostingRegressor,
        RandomForestClassifier,
        RandomForestRegressor,
    )

    if task == "regression":
        models = {
            "GBM": GradientBoostingRegressor(random_state=RANDOM_STATE),
            "Random Forest": RandomForestRegressor(
                random_state=RANDOM_STATE, n_jobs=-1
            ),
        }
    else:
        models = {
            "GBM": GradientBoostingClassifier(random_state=RANDOM_STATE),
            "Random Forest": RandomForestClassifier(
                random_state=RANDOM_STATE, n_jobs=-1
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
        }

    return results


def _run_h2o_native(X_train, X_test, y_train, y_test, target_col, task):

    import h2o
    from h2o.automl import H2OAutoML

    h2o.init(nthreads=2, max_mem_size="512m", verbose=False)
    h2o.no_progress()

    train_df = X_train.copy()
    train_df[target_col] = y_train.values

    test_df = X_test.copy()
    test_df[target_col] = y_test.values

    features = X_train.columns.tolist()

    results = {}

    for algo, label in [("GBM", "GBM"), ("DRF", "Random Forest")]:

        h2o_train = h2o.H2OFrame(train_df)
        h2o_test = h2o.H2OFrame(test_df)

        if task != "regression":
            h2o_train[target_col] = h2o_train[target_col].asfactor()
            h2o_test[target_col] = h2o_test[target_col].asfactor()

        aml = H2OAutoML(
            max_runtime_secs=max(30, H2O_MAX_RUNTIME // 2),
            include_algos=[algo],
            seed=RANDOM_STATE,
            nfolds=3,
        )

        t0 = time.time()
        aml.train(x=features, y=target_col, training_frame=h2o_train)
        elapsed = time.time() - t0

        if aml.leader is None:
            continue

        preds_frame = aml.leader.predict(h2o_test)

        raw = h2o.as_list(preds_frame["predict"], use_pandas=True).values.flatten()

        if task == "regression":
            preds = raw.astype(float)
        else:
            preds = raw

        results[label] = {
            "preds": preds,
            "time": elapsed,
        }

    try:
        h2o.cluster().shutdown(prompt=False)
    except Exception:
        pass

    return results


def run_h2o(X_train, X_test, y_train, y_test,
            target_col="target", task="binary", class_labels=None) -> dict:

    try:

        # Ensure pandas format
        if not isinstance(X_train, pd.DataFrame):
            X_train = pd.DataFrame(X_train)

        if not isinstance(X_test, pd.DataFrame):
            X_test = pd.DataFrame(X_test)

        y_train = pd.Series(y_train)
        y_test = pd.Series(y_test)

        y_true = y_test.values

        # Dataset safety checks
        if X_train.shape[1] < 1 or len(X_train) < 50:
            results_per_algo = _run_sklearn_fallback(
                X_train, X_test, y_train, y_test, task
            )
            used_fallback = True
        else:
            try:
                results_per_algo = _run_h2o_native(
                    X_train, X_test, y_train, y_test, target_col, task
                )

                if not results_per_algo:
                    raise RuntimeError("No H2O models trained")

                used_fallback = False

            except Exception:
                results_per_algo = _run_sklearn_fallback(
                    X_train, X_test, y_train, y_test, task
                )
                used_fallback = True

        best_name = max(
            results_per_algo,
            key=lambda k: algo_score(
                y_true, results_per_algo[k]["preds"], task
            ),
        )

        total_time = sum(v["time"] for v in results_per_algo.values())

        suffix = " (sklearn)" if used_fallback else ""

        metrics = compute_metrics(
            y_true,
            results_per_algo[best_name]["preds"],
            "H2O",
            f"H2O-{best_name}{suffix}",
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
                "H2O",
                class_labels=class_labels
                or [str(c) for c in sorted(set(y_true))],
            )

        else:
            metrics["cm_image"] = None

        metrics["status"] = "success"

        return metrics

    except Exception as e:

        return {
            "framework": "H2O",
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }