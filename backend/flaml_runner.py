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
        metrics = {
            "accuracy": accuracy_score(y_test, preds),
            "precision": precision_score(y_test, preds, average="macro"),
            "recall": recall_score(y_test, preds, average="macro"),
            "f1": f1_score(y_test, preds, average="macro"),
        }
    else:
        metrics = {
            "rmse": mean_squared_error(y_test, preds, squared=False),
            "mae": mean_absolute_error(y_test, preds),
            "r2": r2_score(y_test, preds),
        }

    leaderboard = [
        {
            "model_id": automl.best_estimator,
            **metrics,
        }
    ]

    return {
        "skipped": False,
        "metrics": metrics,
        "leaderboard": leaderboard,
    }
