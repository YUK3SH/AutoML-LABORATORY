"""
runner.py — orchestrates all frameworks, passes task + class_labels to each.
"""

import threading
from backend.frameworks.h2o_runner       import run_h2o
from backend.frameworks.autogluon_runner import run_autogluon
from backend.frameworks.tpot_runner      import run_tpot
from backend.frameworks.flaml_runner     import run_flaml
from backend.metrics import generate_comparison_report

_execution_state = {
    "running": False, "completed": [], "total": 0,
    "current": "", "done": False, "report": None, "error": None,
}
_lock = threading.Lock()


def get_execution_state() -> dict:
    with _lock: return dict(_execution_state)


def _update_state(**kwargs):
    with _lock: _execution_state.update(kwargs)


def run_all_frameworks(X_train, X_test, y_train, y_test,
                       selected_frameworks: list,
                       target_col: str = "target",
                       class_labels: list = None,
                       task: str = "binary") -> dict:

    FRAMEWORK_MAP = {
        "H2O":       lambda: run_h2o(X_train, X_test, y_train, y_test,
                                     target_col=target_col, task=task,
                                     class_labels=class_labels),
        "AutoGluon": lambda: run_autogluon(X_train, X_test, y_train, y_test,
                                           task=task, class_labels=class_labels),
        "TPOT":      lambda: run_tpot(X_train, X_test, y_train, y_test,
                                      task=task, class_labels=class_labels),
        "FLAML":     lambda: run_flaml(X_train, X_test, y_train, y_test,
                                       task=task, class_labels=class_labels),
    }

    _update_state(running=True, completed=[], total=len(selected_frameworks),
                  current="", done=False, report=None, error=None)

    results = []
    for fw_name in selected_frameworks:
        if fw_name not in FRAMEWORK_MAP: continue
        _update_state(current=fw_name)
        results.append(FRAMEWORK_MAP[fw_name]())
        with _lock: _execution_state["completed"].append(fw_name)

    report = generate_comparison_report(results)
    _update_state(running=False, done=True, report=report, current="")
    return report


def run_in_background(X_train, X_test, y_train, y_test,
                      selected_frameworks, target_col="target",
                      class_labels=None, task="binary"):
    thread = threading.Thread(
        target=run_all_frameworks,
        args=(X_train, X_test, y_train, y_test,
              selected_frameworks, target_col, class_labels, task),
        daemon=True,
    )
    thread.start()
    return thread
