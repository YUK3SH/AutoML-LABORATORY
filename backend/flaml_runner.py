from flaml import AutoML
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
)
from .logger import setup_logger

log = setup_logger("FLAML")

MIN_ROWS = 50


def run_flaml(X_train, X_test, y_train, y_test, task: str, time_limit: int = 60):
    if X_train.shape[0] < MIN_ROWS:
        return {"skipped": True, "reason": "Dataset too small"}

    log.info("Starting FLAML")

    automl = AutoML()

    automl.fit(
        X_train=X_train,
        y_train=y_train,
        task=task,
        time_budget=time_limit,
        verbose=0,
    )

    preds = automl.predict(X_test)

    if task == "classification":
        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, preds, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, preds, average="weighted", zero_division=0))

        metrics = {
            "accuracy": round(acc, 4),
            "precision_weighted": round(prec, 4),
            "recall_weighted": round(rec, 4),
            "f1_weighted": round(f1, 4),
        }
    else:
        rmse = float(mean_squared_error(y_test, preds, squared=False))
        mae = float(mean_absolute_error(y_test, preds))
        r2 = float(r2_score(y_test, preds))

        metrics = {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "r2": round(r2, 4),
        }

    best_model_id = str(automl.best_estimator)

    leaderboard = [
        {
            "model_id": best_model_id,
            **metrics,
        }
    ]

    return {
        "skipped": False,
        "best_model": best_model_id,
        "metrics": metrics,
        "leaderboard": leaderboard,
    }
