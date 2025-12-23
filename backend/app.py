from fastapi import FastAPI
from .logger import setup_logger
from .data_loader import load_dataset
from .splitter import split_data
from .task_detector import detect_task
from .metrics import select_metrics
from .baseline import train_baseline
from .autogluon_runner import run_autogluon
from .h2o_runner import run_h2o
from .tpot_runner import run_tpot
from .flaml_runner import run_flaml
from .orchestrator import run_automl

app = FastAPI()
log = setup_logger("AUTOML")

@app.get("/ping")
def ping():
    log.info("Ping received")
    return {"status": "ok"}

@app.get("/load_sample")
def load_sample():
    df = load_dataset("datasets/sample.csv")
    return {"rows": df.shape[0], "cols": df.shape[1]}

@app.get("/split_sample")
def split_sample():
    df = load_dataset("datasets/sample.csv")
    X_train, X_test, y_train, y_test = split_data(df, target="score")
    return {
        "train_rows": X_train.shape[0],
        "test_rows": X_test.shape[0]
    }

@app.get("/detect_task")
def detect_task_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")
    return {"task": task}

@app.get("/metrics")
def metrics_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")
    metrics = select_metrics(task)
    return {
        "task": task,
        "metrics": metrics
    }

@app.get("/baseline")
def baseline_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")
    X_train, X_test, y_train, y_test = split_data(df, target="score")
    metric, score = train_baseline(
        X_train, X_test, y_train, y_test, task
    )
    return {
        "metric": metric,
        "score": score
    }

@app.get("/autogluon")
def autogluon_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")

    X_train, X_test, y_train, y_test = split_data(df, target="score")

    train_df = X_train.copy()
    train_df["score"] = y_train

    test_df = X_test.copy()
    test_df["score"] = y_test

    leaderboard = run_autogluon(
        train_df=train_df,
        test_df=test_df,
        target="score",
        task=task,
        time_limit=60
    )

    return {
        "models_trained": len(leaderboard),
        "leaderboard": leaderboard
    }

    result = run_autogluon(
    train_df=train_df,
    test_df=test_df,
    target="score",
    task=task,
    time_limit=60
    )

    return result

@app.get("/h2o")
def h2o_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")

    X_train, X_test, y_train, y_test = split_data(df, target="score")

    train_df = X_train.copy()
    train_df["score"] = y_train

    test_df = X_test.copy()
    test_df["score"] = y_test

    result = run_h2o(
        train_df=train_df,
        test_df=test_df,
        target="score",
        task=task,
        time_limit=60
    )

    return result

@app.get("/tpot")
def tpot_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")

    X_train, X_test, y_train, y_test = split_data(df, target="score")

    result = run_tpot(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        task=task,
        time_limit=120
    )

    return result

@app.get("/flaml")
def flaml_api():
    df = load_dataset("datasets/sample.csv")
    task = detect_task(df, target="score")

    X_train, X_test, y_train, y_test = split_data(df, target="score")

    result = run_flaml(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        task=task,
        time_limit=60
    )

    return result

@app.get("/run_automl")
def run_automl_api(engine: str = "all"):
    df = load_dataset("datasets/sample.csv")
    return run_automl(df, target="score", engine=engine)
