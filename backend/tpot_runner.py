from tpot import TPOTClassifier, TPOTRegressor
from sklearn.metrics import accuracy_score, mean_squared_error
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
        msg = f"TPOT skipped: need >= {MIN_ROWS} rows, got {X_train.shape[0]}"
        log.warning(msg)
        return {"skipped": True, "reason": msg}

    log.info("Starting TPOT")
    log.info(f"Time limit: {time_limit}s")

    if task == "classification":
        model = TPOTClassifier(
            generations=2,
            population_size=10,
            verbosity=2,
            max_time_mins=time_limit / 60,
            n_jobs=1,
            random_state=42,
            disable_update_check=True
        )
    else:
        model = TPOTRegressor(
            generations=2,
            population_size=10,
            verbosity=2,
            max_time_mins=time_limit / 60,
            n_jobs=1,
            random_state=42,
            disable_update_check=True
        )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    if task == "classification":
        score = accuracy_score(y_test, preds)
        metric = "accuracy"
    else:
        score = mean_squared_error(y_test, preds)
        metric = "mse"

    log.info(f"TPOT {metric}: {score}")

    return {
        "skipped": False,
        "metric": metric,
        "score": score
    }
