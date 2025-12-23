from .logger import setup_logger
from .task_detector import detect_task
from .splitter import split_data
from .baseline import train_baseline
from .autogluon_runner import run_autogluon
from .h2o_runner import run_h2o
from .tpot_runner import run_tpot

log = setup_logger("ORCH")

def run_automl(df, target: str, engine: str = "all"):
    log.info("Starting unified AutoML pipeline")

    task = detect_task(df, target)
    log.info(f"Task detected: {task}")

    X_train, X_test, y_train, y_test = split_data(df, target)

    # baseline
    base_metric, base_score = train_baseline(
        X_train, X_test, y_train, y_test, task
    )

    result = {
        "task": task,
        "baseline": {
            "metric": base_metric,
            "score": base_score
        }
    }

    # prepare frames (NO leakage)
    train_df = X_train.copy()
    train_df[target] = y_train

    test_df = X_test.copy()
    test_df[target] = y_test

    if engine in ("all", "autogluon"):
        result["autogluon"] = run_autogluon(
            train_df, test_df, target, task, time_limit=60
        )

    if engine in ("all", "h2o"):
        result["h2o"] = run_h2o(
            train_df, test_df, target, task, time_limit=60
        )

    if engine in ("all", "tpot"):
        result["tpot"] = run_tpot(
            X_train, X_test, y_train, y_test, task, time_limit=120
        )

    log.info("AutoML pipeline finished")

    return result
