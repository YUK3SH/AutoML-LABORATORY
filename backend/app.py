import os
import asyncio
from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from backend.system_stats import send_system_info, send_system_stats
from backend.logger import setup_logger
from backend.data_loader import load_dataset
from backend.upload import upload_dataset
from backend.splitter import split_data
from backend.task_detector import detect_task
from backend.metrics import select_metrics
from backend.baseline import train_baseline
from backend.autogluon_runner import run_autogluon
from backend.h2o_runner import run_h2o
from backend.tpot_runner import run_tpot
from backend.flaml_runner import run_flaml
from backend.ws_automl import automl_ws

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

log = setup_logger("AUTOML")


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.get("/load_sample")
def load_sample():
    df = load_dataset("datasets/sample.csv")
    return {"rows": df.shape[0], "cols": df.shape[1]}


@app.get("/baseline")
def baseline_api():
    df = load_dataset("datasets/sample.csv")
    task, target = detect_task(df)
    X_train, X_test, y_train, y_test = split_data(df, target, task)
    metric, score = train_baseline(X_train, X_test, y_train, y_test, task)
    return {"metric": metric, "score": score}


@app.get("/autogluon")
def autogluon_api():
    df = load_dataset("datasets/sample.csv")
    task, target = detect_task(df)

    X_train, X_test, y_train, y_test = split_data(df, target, task)

    train_df = X_train.copy()
    train_df[target] = y_train

    test_df = X_test.copy()
    test_df[target] = y_test

    result = run_autogluon(
        train_df=train_df,
        test_df=test_df,
        target=target,
        task=task,
        time_limit=60
    )

    return result


@app.get("/h2o")
def h2o_api():
    df = load_dataset("datasets/sample.csv")
    task, target = detect_task(df)

    X_train, X_test, y_train, y_test = split_data(df, target, task)

    train_df = X_train.copy()
    train_df[target] = y_train

    test_df = X_test.copy()
    test_df[target] = y_test

    return run_h2o(
        train_df=train_df,
        test_df=test_df,
        target=target,
        task=task,
        time_limit=60
    )


@app.get("/tpot")
def tpot_api():
    df = load_dataset("datasets/sample.csv")
    task, target = detect_task(df)

    X_train, X_test, y_train, y_test = split_data(df, target, task)

    return run_tpot(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        task=task,
        time_limit=120
    )


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    return await upload_dataset(file)


@app.get("/list_files")
def list_files():
    return {"files": os.listdir("datasets")}


@app.websocket("/ws/automl")
async def ws_automl_entry(websocket: WebSocket):
    await automl_ws(websocket, engine="h2o")


@app.websocket("/ws/autogluon")
async def ws_autogluon(websocket: WebSocket):
    await automl_ws(websocket, engine="autogluon")


@app.websocket("/ws/tpot")
async def ws_tpot(websocket: WebSocket):
    await automl_ws(websocket, engine="tpot")


@app.websocket("/ws/system_logs")
async def ws_system_logs(websocket: WebSocket):
    await websocket.accept()
    await send_system_info(websocket)
    while True:
        await send_system_stats(websocket)
        await asyncio.sleep(1)
