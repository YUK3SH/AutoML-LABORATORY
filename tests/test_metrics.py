"""Tests for metrics.py"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import numpy as np
from backend.metrics import compute_metrics, determine_winner, generate_comparison_report


def test_compute_metrics_perfect():
    y = [0, 1, 0, 1, 0]
    result = compute_metrics(y, y, "TestFW", "TestModel", 5.0)
    assert result['accuracy'] == 1.0
    assert result['f1_score'] == 1.0
    assert result['framework'] == "TestFW"
    assert result['best_model'] == "TestModel"
    assert result['execution_time_seconds'] == 5.0


def test_compute_metrics_imperfect():
    y_true = [0, 0, 1, 1]
    y_pred = [0, 1, 0, 1]
    result = compute_metrics(y_true, y_pred, "FW", "Model", 10.0)
    assert 0 < result['accuracy'] < 1.0


def test_determine_winner_picks_highest_accuracy():
    results = [
        {'framework': 'A', 'accuracy': 0.85, 'execution_time_seconds': 30, 'status': 'success'},
        {'framework': 'B', 'accuracy': 0.91, 'execution_time_seconds': 45, 'status': 'success'},
        {'framework': 'C', 'accuracy': 0.78, 'execution_time_seconds': 20, 'status': 'success'},
    ]
    winner = determine_winner(results)
    assert winner['framework'] == 'B'


def test_determine_winner_tiebreak_by_speed():
    results = [
        {'framework': 'A', 'accuracy': 0.90, 'execution_time_seconds': 60, 'status': 'success'},
        {'framework': 'B', 'accuracy': 0.90, 'execution_time_seconds': 30, 'status': 'success'},
    ]
    winner = determine_winner(results)
    assert winner['framework'] == 'B'


def test_determine_winner_ignores_errors():
    results = [
        {'framework': 'A', 'accuracy': 0.85, 'execution_time_seconds': 30, 'status': 'success'},
        {'framework': 'B', 'status': 'error', 'error': 'OOM'},
    ]
    winner = determine_winner(results)
    assert winner['framework'] == 'A'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
