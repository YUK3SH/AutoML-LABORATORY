"""
task_detector.py
----------------
Auto-detects whether a dataset is:
  - "binary"      : classification with exactly 2 classes
  - "multiclass"  : classification with 3+ classes
  - "regression"  : continuous numeric target

Used to set the correct metrics, model type, and confusion matrix behaviour
across all frameworks without any user input.
"""

import numpy as np
import pandas as pd

REGRESSION_UNIQUE_THRESHOLD = 20   # if target has > this many unique values → regression


def detect_task(df: pd.DataFrame, target_column: str) -> str:
    """
    Returns one of: 'binary', 'multiclass', 'regression'
    """
    col = df[target_column].dropna()
    n_unique = col.nunique()
    dtype    = col.dtype

    # Float column with many unique values → regression
    if dtype in [np.float64, float] and n_unique > REGRESSION_UNIQUE_THRESHOLD:
        return "regression"

    # Integer but very high cardinality → treat as regression
    if dtype in [np.int64, int] and n_unique > REGRESSION_UNIQUE_THRESHOLD:
        return "regression"

    # 2 unique values → binary classification
    if n_unique == 2:
        return "binary"

    # 3+ unique values but low cardinality → multiclass
    return "multiclass"


def get_task_config(task: str) -> dict:
    """
    Returns metric names, sklearn averaging strategy, and display info
    for the given task type.
    """
    if task == "regression":
        return {
            "task":           "regression",
            "primary_metric": "r2",          # used to pick winner
            "display_metrics": ["r2", "rmse", "mae"],
            "sklearn_average": None,          # not used for regression
            "higher_is_better": True,         # for R²
            "show_confusion_matrix": False,
            "flaml_task":    "regression",
            "autogluon_metric": "r2",
            "h2o_metric":    "deviance",
            "label": "Regression",
        }
    elif task == "multiclass":
        return {
            "task":           "multiclass",
            "primary_metric": "accuracy",
            "display_metrics": ["accuracy", "f1", "precision", "recall"],
            "sklearn_average": "weighted",
            "higher_is_better": True,
            "show_confusion_matrix": True,
            "flaml_task":    "classification",
            "autogluon_metric": "accuracy",
            "h2o_metric":    "logloss",
            "label": "Multiclass Classification",
        }
    else:  # binary
        return {
            "task":           "binary",
            "primary_metric": "accuracy",
            "display_metrics": ["accuracy", "f1", "precision", "recall"],
            "sklearn_average": "weighted",
            "higher_is_better": True,
            "show_confusion_matrix": True,
            "flaml_task":    "classification",
            "autogluon_metric": "accuracy",
            "h2o_metric":    "logloss",
            "label": "Binary Classification",
        }
