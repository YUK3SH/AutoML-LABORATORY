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
    yield {"type": "log", "message": f"Loading dataset: {filename}"}

    df = load_dataset(f"datasets/{filename}")
    task, target = detect_task(df)

    yield {"type": "log", "message": f"Detected task: {task}, target: {target}"}

    X_train, X_test, y_train, y_test = split_data(df, target, task)

    train_df = X_train.copy()
    train_df[target] = y_train
    test_df = X_test.copy()
    test_df[target] = y_test

    monitor = monitor_start()

    yield {"type": "log", "message": f"Starting {engine.upper()} AutoML"}

    if engine == "h2o":
        raw = run_h2o(train_df, test_df, target, task)
    elif engine == "autogluon":
        raw = run_autogluon(train_df, test_df, target, task)
    elif engine == "tpot":
        raw = run_tpot(X_train, X_test, y_train, y_test, task)
    elif engine == "flaml":
        raw = run_flaml(X_train, X_test, y_train, y_test, task)
    else:
        yield {"type": "log", "message": "Unknown engine"}
        return

    monitor_tick(monitor)
    system = monitor_end(monitor)

    if raw.get("skipped"):
        yield {"type": "log", "message": raw.get("reason", "Skipped")}
        return

    leaderboard = raw.get("leaderboard", [])
    best_model = leaderboard[0]["model_id"] if leaderboard else "UNKNOWN_MODEL"

    entry = {
        "dataset": filename,
        "tool": engine,
        "task": task,
        "best_model": best_model,
        "metrics": raw.get("metrics", {}),
        "system": system,
        "leaderboard": leaderboard
    }

    save_result(entry)

    yield {"type": "result", "data": entry}
