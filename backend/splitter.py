import pandas as pd
from sklearn.model_selection import train_test_split
from .logger import setup_logger

log = setup_logger("SPLIT")

def split_data(
    df: pd.DataFrame,
    target: str,
    test_size: float = 0.2,
    random_state: int = 42
):
    log.info("Starting train-test split")

    X = df.drop(columns=[target])
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y if y.nunique() <= 10 else None
    )

    log.info(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")

    return X_train, X_test, y_train, y_test
