"""
test_data_handler.py
Tests data loading, validation, and splitting — generic datasets only.
"""

import pytest
import numpy as np
import pandas as pd
import os
import tempfile
from backend.data_handler import load_csv, validate_data, detect_feature_types, stratified_split


@pytest.fixture
def sample_df():
    n = 200
    return pd.DataFrame({
        'age':      np.random.randint(18, 80, n),
        'income':   np.random.normal(50000, 15000, n),
        'category': np.random.choice(['A', 'B', 'C'], n),
        'score':    np.random.uniform(0, 1, n),
        'label':    np.random.choice([0, 1], n),
    })


def test_validate_data_passes(sample_df):
    result = validate_data(sample_df, 'label')
    assert result['valid'], f"Validation failed: {result.get('issues')}"


def test_validate_data_wrong_target(sample_df):
    result = validate_data(sample_df, 'nonexistent_column')
    assert not result['valid']


def test_detect_feature_types(sample_df):
    types = detect_feature_types(sample_df, 'label')
    assert types['label'] == 'target'
    assert 'age' in types
    assert 'category' in types


def test_stratified_split_sizes(sample_df):
    X_train, X_test, y_train, y_test = stratified_split(sample_df, 'label')
    total = len(X_train) + len(X_test)
    assert total == len(sample_df)
    assert abs(len(X_test) / total - 0.2) < 0.05


def test_stratified_split_no_target_leakage(sample_df):
    X_train, X_test, y_train, y_test = stratified_split(sample_df, 'label')
    assert 'label' not in X_train.columns
    assert 'label' not in X_test.columns


def test_load_csv():
    df = pd.DataFrame({
        'x': [1, 2, 3, 4, 5],
        'y': ['a', 'b', 'a', 'b', 'a'],
        'target': [0, 1, 0, 1, 0],
    })
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False, mode='w') as f:
        df.to_csv(f, index=False)
        tmp_path = f.name
    try:
        loaded = load_csv(tmp_path)
        assert list(loaded.columns) == list(df.columns)
        assert len(loaded) == len(df)
    finally:
        os.unlink(tmp_path)


def test_validate_rejects_multiclass():
    """Datasets with more than 2 target classes should fail validation."""
    df = pd.DataFrame({
        'x': range(100),
        'target': np.random.choice([0, 1, 2], 100),  # 3 classes
    })
    result = validate_data(df, 'target')
    assert not result['valid']
