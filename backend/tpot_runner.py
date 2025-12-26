from tpot import TPOTClassifier, TPOTRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
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

    if task == "classification":
        model = TPOTClassifier(
            generations=2,
            population_size=10,
            max_time_mins=time_limit / 60,
            verbosity=2,
            random_state=42,
            n_jobs=1,
            disable_update_check=True
        )
    else:
        model = TPOTRegressor(
            generations=2,
            population_size=10,
            max_time_mins=time_limit / 60,
            verbosity=2,
            random_state=42,
            n_jobs=1,
            disable_update_check=True
        )

    log.info("TPOT training started")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

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
