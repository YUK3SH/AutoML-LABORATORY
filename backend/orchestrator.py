from backend.data_loader import load_dataset
from backend.splitter import split_data
from backend.task_detector import detect_task
from backend.h2o_runner import run_h2o
from backend.autogluon_runner import run_autogluon
from backend.tpot_runner import run_tpot
from backend.flaml_runner import run_flaml


async def run_pipeline(filename, engine):
    yield {"type": "log", "message": f"ORCH | Loading dataset {filename}"}
    df = load_dataset(f"datasets/{filename}")

    task, target = detect_task(df)
    yield {"type": "log", "message": f"ORCH | Task={task}, Target={target}"}

    X_train, X_test, y_train, y_test = split_data(df, target, task)
    yield {
        "type": "log",
        "message": f"ORCH | Split done | Train={X_train.shape}, Test={X_test.shape}"
    }

    train_df = X_train.copy()
    train_df[target] = y_train

    test_df = X_test.copy()
    test_df[target] = y_test

    if engine == "h2o":
        raw = run_h2o(train_df, test_df, target, task)

    elif engine == "autogluon":
        raw = run_autogluon(train_df, test_df, target, task)

    elif engine == "tpot":
        raw = run_tpot(X_train, X_test, y_train, y_test, task)

    elif engine == "flaml":
        raw = run_flaml(X_train, X_test, y_train, y_test, task)

    else:
        yield {"type": "error", "message": "Unknown engine"}
        return

    if raw.get("skipped"):
        yield {"type": "error", "message": raw["reason"]}
        return

    result = {
        "task": task,
        "engine": engine,
        "metrics": raw.get("metrics", {}),
        "confusion_matrix": raw.get("confusion_matrix"),
        "top_models": raw.get("leaderboard", []),
        "leaderboard": raw.get("leaderboard", [])
    }

    yield {"type": "result", "data": result}
