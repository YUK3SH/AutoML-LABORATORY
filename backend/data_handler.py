"""
data_handler.py
---------------
CSV loading, validation, feature-type detection, and stratified/random split.
Supports binary classification, multiclass classification, and regression.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

from config import RANDOM_STATE, TEST_SIZE
from backend.task_detector import detect_task


def load_csv(filepath: str) -> pd.DataFrame:
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    try:
        # Try standard CSV
        df = pd.read_csv(filepath)
    except Exception:
        try:
            # Handle unknown separators like ; or |
            df = pd.read_csv(filepath, sep=None, engine="python")
        except Exception:
            try:
                # Handle encoding issues
                df = pd.read_csv(filepath, encoding="latin1")
            except Exception as e:
                raise ValueError(f"Could not read CSV file: {e}")

    if df.empty:
        raise ValueError("Uploaded CSV is empty.")

    return df


def validate_data(df: pd.DataFrame, target_column: str) -> dict:
    issues = []

    if target_column not in df.columns:
        issues.append(f"Target column '{target_column}' not found.")
        return {"valid": False, "issues": issues}

    if df.shape[0] < 50:
        issues.append("Dataset has fewer than 50 rows — too small for reliable AutoML.")

    col      = df[target_column].dropna()
    n_unique = col.nunique()
    task     = detect_task(df, target_column)

    missing_pct    = (df.isnull().sum().sum() / df.size) * 100
    duplicate_rows = df.duplicated().sum()

    return {
        "rows":           int(df.shape[0]),
        "columns":        int(df.shape[1]),
        "missing_pct":    round(float(missing_pct), 2),
        "duplicate_rows": int(duplicate_rows),
        "target_column":  target_column,
        "target_classes": sorted([str(v) for v in col.unique()])
                          if task != "regression" else [],
        "n_unique_target": int(n_unique),
        "task":            task,
        "issues":          issues,
        "valid":           len(issues) == 0,
    }


def detect_feature_types(df: pd.DataFrame, target_column: str) -> dict:
    feature_types = {}
    for col in df.columns:
        if col == target_column:
            feature_types[col] = "target"
            continue
        dtype    = df[col].dtype
        n_unique = df[col].nunique()
        if dtype == object or n_unique <= 20:
            feature_types[col] = "categorical"
        elif dtype in [np.int64, np.float64]:
            feature_types[col] = "numerical"
        else:
            feature_types[col] = "unknown"
    return feature_types


def get_class_labels(df: pd.DataFrame, target_column: str) -> list:
    """
    Return sorted original class label names for CLASSIFICATION tasks.
    Returns [] for regression (no discrete labels).
    """
    task = detect_task(df, target_column)
    if task == "regression":
        return []
    unique_vals = sorted(df[target_column].dropna().unique(), key=str)
    return [str(v) for v in unique_vals]


def stratified_split(df: pd.DataFrame, target_column: str):
    """
    80/20 split. Uses stratify for classification, random for regression.
    Returns (X_train, X_test, y_train, y_test).
    """
    task = detect_task(df, target_column)
    X = df.drop(columns=[target_column])
    y = df[target_column]

    stratify = y if task != "regression" else None
    return train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=stratify,
    )
