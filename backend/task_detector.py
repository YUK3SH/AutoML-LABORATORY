import pandas as pd
from .logger import setup_logger

log = setup_logger("TASK")

def detect_task(df: pd.DataFrame, target: str) -> str:
    unique_vals = df[target].nunique()

    if df[target].dtype == "object":
        task = "classification"
    elif unique_vals <= 20:
        task = "classification"
    else:
        task = "regression"

    log.info(f"Detected task: {task}")
    return task
