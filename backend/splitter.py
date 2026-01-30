import pandas as pd
from sklearn.model_selection import train_test_split
from .logger import setup_logger

log = setup_logger("SPLIT")


def _drop_leakage_columns(df: pd.DataFrame):
    drop_cols = []
    for c in df.columns:
        if c.lower() in ["id", "index", "uid"]:
            drop_cols.append(c)
        elif df[c].nunique() == df.shape[0]:
            drop_cols.append(c)
    return df.drop(columns=drop_cols), drop_cols


def split_data(df: pd.DataFrame, target: str, task: str):
    log.info("Starting train-test split")

    df, dropped = _drop_leakage_columns(df)
    if dropped:
        log.warning(f"Dropped leakage columns: {dropped}")

    X = df.drop(columns=[target])
    y = df[target]

    stratify = y if task == "classification" else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify
    )

    return X_train, X_test, y_train, y_test
