import h2o
from h2o.automl import H2OAutoML
from .logger import setup_logger

log = setup_logger("H2O")

MIN_ROWS = 50

def run_h2o(train_df, test_df, target: str, task: str, time_limit: int = 60):
    if train_df.shape[0] < MIN_ROWS:
        msg = f"H2O skipped: need >= {MIN_ROWS} rows, got {train_df.shape[0]}"
        log.warning(msg)
        return {"skipped": True, "reason": msg}

    h2o.init(max_mem_size="2G", nthreads=2)

    train = h2o.H2OFrame(train_df)
    test = h2o.H2OFrame(test_df)

    train[target] = train[target].asfactor() if task == "classification" else train[target]
    test[target] = test[target].asfactor() if task == "classification" else test[target]

    log.info("Starting H2O AutoML")

    aml = H2OAutoML(
        max_runtime_secs=time_limit,
        sort_metric="AUTO",
        exclude_algos=["DeepLearning"],  # keep fast & stable
        verbosity="info"
    )

    aml.train(y=target, training_frame=train)

    lb = aml.leaderboard.as_data_frame()

    log.info("H2O AutoML completed")

    return {
        "skipped": False,
        "leaderboard": lb.to_dict(orient="records")
    }
