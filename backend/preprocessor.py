"""
preprocessor.py
---------------
Generic preprocessing pipeline for ANY tabular dataset.
Handles:
  - ID-like columns
  - high missing columns
  - numeric + categorical imputation
  - consistent encoding
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder


def _drop_useless(df: pd.DataFrame) -> pd.DataFrame:
    cols_to_drop = []
    n = len(df)

    for col in df.columns:

        missing_ratio = df[col].isnull().mean()
        unique_ratio  = df[col].nunique(dropna=False) / max(n, 1)
        n_unique      = df[col].nunique(dropna=False)

        # Too many missing values
        if missing_ratio > 0.75:
            cols_to_drop.append(col)

        # Constant column
        elif n_unique <= 1:
            cols_to_drop.append(col)

        # ID-like column (works for BOTH numeric and text)
        elif unique_ratio > 0.95:
            cols_to_drop.append(col)

    return df.drop(columns=list(set(cols_to_drop)), errors="ignore")

def _impute(train: pd.DataFrame, test: pd.DataFrame):

    num_cols = train.select_dtypes(include=[np.number]).columns
    cat_cols = train.select_dtypes(exclude=[np.number]).columns

    # numeric → median
    for col in num_cols:
        med = train[col].median()
        train[col] = train[col].fillna(med)
        test[col] = test[col].fillna(med)

    # categorical → mode
    for col in cat_cols:
        mode_val = train[col].mode()
        fill_val = mode_val[0] if not mode_val.empty else "Unknown"

        train[col] = train[col].fillna(fill_val)
        test[col] = test[col].fillna(fill_val)

    return train, test


def _encode(train: pd.DataFrame, test: pd.DataFrame):

    for col in train.select_dtypes(include=["object", "category"]).columns:

        le = LabelEncoder()

        combined = pd.concat([train[col], test[col]], axis=0).astype(str)

        le.fit(combined)

        train[col] = le.transform(train[col].astype(str))
        test[col] = le.transform(test[col].astype(str))

    return train, test


def preprocess(X_train: pd.DataFrame, X_test: pd.DataFrame):

    train = X_train.copy()
    test = X_test.copy()

    # Drop useless columns
    train = _drop_useless(train)
    kept_cols = train.columns.tolist()

    test = test.reindex(columns=kept_cols)

    # Impute using train statistics
    train, test = _impute(train, test)

    # Encode consistently
    train, test = _encode(train, test)

    return train, test


def get_preprocessed_splits(X_train, X_test, y_train, y_test):

    # Run preprocessing pipeline
    X_tr, X_te = preprocess(X_train, X_test)

    # Safety cleanup (important for AutoML)
    X_tr = X_tr.replace([np.inf, -np.inf], np.nan).fillna(0)
    X_te = X_te.replace([np.inf, -np.inf], np.nan).fillna(0)

    return (
        X_tr.reset_index(drop=True),
        X_te.reset_index(drop=True),
        y_train.reset_index(drop=True),
        y_test.reset_index(drop=True),
    )