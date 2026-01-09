from backend.data_loader import load_dataset
from backend.splitter import split_data
from backend.task_detector import detect_task
from backend.h2o_runner import run_h2o
from backend.autogluon_runner import run_autogluon
from backend.tpot_runner import run_tpot
from backend.flaml_runner import run_flaml
from backend.system_stats import monitor_start, monitor_tick, monitor_end
from backend.compare.registry import save_result

async def run_pipeline(filename, engine):
    df = load_dataset(f"datasets/{filename}")
    task, target = detect_task(df)

    X_train, X_test, y_train, y_test = split_data(df, target, task)

    train_df = X_train.copy()
    train_df[target] = y_train
    test_df = X_test.copy()
    test_df[target] = y_test

    monitor = monitor_start()

    if engine == "h2o":
        raw = run_h2o(train_df, test_df, target, task)
    elif engine == "autogluon":
        raw = run_autogluon(train_df, test_df, target, task)
    elif engine == "tpot":
        raw = run_tpot(X_train, X_test, y_train, y_test, task)
    elif engine == "flaml":
        raw = run_flaml(X_train, X_test, y_train, y_test, task)
    else:
        return

    monitor_tick(monitor)
    system = monitor_end(monitor)

    if raw.get("skipped"):
        return

    entry = {
        "dataset": filename,
        "tool": engine,
        "task": task,
        "best_model": raw["leaderboard"][0]["model_id"],
        "metrics": raw["metrics"],
        "system": system
    }

    save_result(entry)

    yield {"type": "result", "data": entry}
