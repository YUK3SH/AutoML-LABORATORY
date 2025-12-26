from tpot import TPOTClassifier, TPOTRegressor
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

log = setup_logger("TPOT")

MIN_ROWS = 50

def run_tpot(
    X_train,
    X_test,
    y_train,
    y_test,
    task: str,
    time_limit: int = 120
):
    if X_train.shape[0] < MIN_ROWS:
        return {"skipped": True, "reason": "Dataset too small"}

    log.info("TPOT training started")

    if task == "classification":
        model = TPOTClassifier(
            generations=2,
            population_size=10,
            max_time_mins=time_limit / 60,
            random_state=42,
            n_jobs=1
        )
    else:
        model = TPOTRegressor(
            generations=2,
            population_size=10,
            max_time_mins=time_limit / 60,
            random_state=42,
            n_jobs=1
        )

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    # FIX: decode labels if TPOT encoded them
    if task == "classification" and hasattr(model, "label_encoder_"):
        preds = model.label_encoder_.inverse_transform(preds)

    if task == "classification":
        metrics = {
            "accuracy": accuracy_score(y_test, preds),
            "precision": precision_score(y_test, preds, average="macro", zero_division=0),
            "recall": recall_score(y_test, preds, average="macro", zero_division=0),
            "f1": f1_score(y_test, preds, average="macro", zero_division=0),
        }
    else:
        metrics = {
            "rmse": mean_squared_error(y_test, preds, squared=False),
            "mae": mean_absolute_error(y_test, preds),
            "r2": r2_score(y_test, preds),
        }

    return {
        "skipped": False,
        "metrics": metrics,
        "leaderboard": [
            {
                "model_id": "TPOT_Best_Pipeline",
                **metrics
            }
        ]
    }
