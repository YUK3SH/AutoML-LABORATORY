import pandas as pd


def detect_task(df: pd.DataFrame):
    target = df.columns[-1]

    if df[target].dtype == "object" or df[target].nunique() <= 20:
        task = "classification"
    else:
        task = "regression"

    return task, target
