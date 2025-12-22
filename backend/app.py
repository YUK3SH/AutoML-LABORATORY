from fastapi import FastAPI
from .logger import setup_logger
from .data_loader import load_dataset
from .splitter import split_data
from .task_detector import detect_task

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
