"""
test_preprocessor.py
Tests the generic preprocessing pipeline with synthetic datasets.
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from backend.preprocessor import get_preprocessed_splits
from backend.data_handler import stratified_split


@pytest.fixture
def generic_dataset():
    """Generic binary classification dataset — no domain-specific columns."""
    n = 100
    return pd.DataFrame({
        'id':        range(1, n+1),               # ID col — should be dropped
        'age':       np.random.randint(18, 80, n),
        'income':    np.random.normal(50000, 15000, n),
        'category':  np.random.choice(['A', 'B', 'C', np.nan], n),
        'score':     np.random.uniform(0, 1, n),
        'constant':  [1] * n,                     # constant col — should be dropped
        'free_text': [f'note_{i}' for i in range(n)],  # high-cardinality — should be dropped
        'target':    np.random.choice([0, 1], n),
    })


def test_drops_id_and_useless_cols(generic_dataset):
    X = generic_dataset.drop(columns=['target'])
    y = generic_dataset['target']
    X_tr, X_te = X.iloc[:80], X.iloc[80:]
    y_tr, y_te = y.iloc[:80], y.iloc[80:]
    X_train, X_test, _, _ = get_preprocessed_splits(X_tr, X_te, y_tr, y_te)
    # ID-like and constant columns must be dropped
    assert 'id'        not in X_train.columns, "ID column should be dropped"
    assert 'constant'  not in X_train.columns, "Constant column should be dropped"
    assert 'free_text' not in X_train.columns, "High-cardinality text should be dropped"


def test_no_missing_after_preprocess(generic_dataset):
    X_train, X_test, y_train, y_test = stratified_split(generic_dataset, 'target')
    X_tr, X_te, y_tr, y_te = get_preprocessed_splits(X_train, X_test, y_train, y_test)
    assert X_tr.isnull().sum().sum() == 0, "Train set must have no missing values"
    assert X_te.isnull().sum().sum() == 0, "Test set must have no missing values"


def test_all_numeric_after_preprocess(generic_dataset):
    X_train, X_test, y_train, y_test = stratified_split(generic_dataset, 'target')
    X_tr, X_te, y_tr, y_te = get_preprocessed_splits(X_train, X_test, y_train, y_test)
    non_numeric = X_tr.select_dtypes(exclude=[np.number]).columns.tolist()
    assert len(non_numeric) == 0, f"All columns must be numeric, got: {non_numeric}"


def test_train_test_same_columns(generic_dataset):
    X_train, X_test, y_train, y_test = stratified_split(generic_dataset, 'target')
    X_tr, X_te, _, _ = get_preprocessed_splits(X_train, X_test, y_train, y_test)
    assert list(X_tr.columns) == list(X_te.columns), "Train and test must have same columns"


def test_works_with_yes_no_features():
    """Test with Yes/No categorical features (common in many datasets)."""
    n = 100
    df = pd.DataFrame({
        'feature_a': np.random.choice(['Yes', 'No'], n),
        'feature_b': np.random.randint(0, 100, n),
        'feature_c': np.random.choice(['Low', 'Medium', 'High'], n),
        'label':     np.random.choice([0, 1], n),
    })
    X_train, X_test, y_train, y_test = stratified_split(df, 'label')
    X_tr, X_te, _, _ = get_preprocessed_splits(X_train, X_test, y_train, y_test)
    assert X_tr.isnull().sum().sum() == 0
    assert len(X_tr.select_dtypes(exclude=[np.number]).columns) == 0
