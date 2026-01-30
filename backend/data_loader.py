import pandas as pd
from .logger import setup_logger

log = setup_logger("DATA")

def load_dataset(path: str) -> pd.DataFrame:
    log.info(f"Loading dataset from {path}")
    df = pd.read_csv(path)
    log.info(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    log.info(f"Columns: {list(df.columns)}")
    return df

