from flaml import AutoML
from sklearn.metrics import accuracy_score, mean_squared_error
from .logger import setup_logger

log = setup_logger("FLAML")

MIN_ROWS = 50

def run_flaml(
    X_train,
    X_test,
    y_train,
    y_test,
    task: str,
    time_limit: int = 60
):
    if X_train.shape[0] < MIN_ROWS:
        msg = f"FLAML skipped: need >= {MIN_ROWS} rows, got {X_train.shape[0]}"
        log.warning(msg)
        return {"skipped": True, "reason": msg}

    log.info("Starting FLAML")
    log.info(f"Time limit: {time_limit}s")

    automl = AutoML()

    if task == "classification":
        automl_task = "classification"
        metric = "accuracy"
    else:
        automl_task = "regression"
        metric = "mse"

    automl.fit(
        X_train=X_train,
        y_train=y_train,
        task=automl_task,
        time_budget=time_limit,
        verbose=1
    )

    preds = automl.predict(X_test)

    if task == "classification":
        score = accuracy_score(y_test, preds)
    else:
        score = mean_squared_error(y_test, preds)

    log.info(f"FLAML {metric}: {score}")

    return {
        "skipped": False,
        "metric": metric,
        "score": score,
        "best_model": automl.best_estimator
    }
