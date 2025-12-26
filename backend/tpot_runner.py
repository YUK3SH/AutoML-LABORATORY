from tpot import TPOTClassifier, TPOTRegressor
from sklearn.metrics import accuracy_score, mean_squared_error
import numpy as np
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
            random_state=42,
            n_jobs=1,
            verbosity=0,
            disable_update_check=True
        )
    else:
        model = TPOTRegressor(
            generations=2,
            population_size=10,
            max_time_mins=time_limit / 60,
            random_state=42,
            n_jobs=1,
            verbosity=0,
            disable_update_check=True
        )

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    if task == "classification":
        return {
            "skipped": False,
            "metric": "accuracy",
            "score": accuracy_score(y_test, preds)
        }

    rmse = np.sqrt(mean_squared_error(y_test, preds))
    return {
        "skipped": False,
        "metric": "rmse",
        "score": rmse
    }
