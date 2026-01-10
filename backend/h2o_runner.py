import h2o
import time
import threading
import os
from h2o.automl import H2OAutoML
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from .logger import setup_logger

log = setup_logger("H2O")
MIN_ROWS = 50

H2O_LOG_FILE = os.path.expanduser("~/.h2oai/h2o.log")


def tail_file(path, callback, stop_flag):
    with open(path, "r", errors="ignore") as f:
        f.seek(0, 2)
        while not stop_flag["stop"]:
            line = f.readline()
            if line:
                callback(line.rstrip())
            else:
                time.sleep(0.1)


def run_h2o(train_df, test_df, target, task, time_limit=60, log_callback=None):
    if train_df.shape[0] < MIN_ROWS:
        return {"skipped": True, "reason": "Dataset too small"}

    h2o.init(max_mem_size="2G", nthreads=2)

    stop_flag = {"stop": False}

    if log_callback and os.path.exists(H2O_LOG_FILE):
        t = threading.Thread(
            target=tail_file,
            args=(H2O_LOG_FILE, log_callback, stop_flag),
            daemon=True
        )
        t.start()

    train = h2o.H2OFrame(train_df)
    test = h2o.H2OFrame(test_df)

    if task == "classification":
        train[target] = train[target].asfactor()
        test[target] = test[target].asfactor()

    aml = H2OAutoML(
        max_runtime_secs=time_limit,
        exclude_algos=["DeepLearning"],
        verbosity="info"
    )

    aml.train(y=target, training_frame=train)

    stop_flag["stop"] = True

    leaderboard = aml.leaderboard.as_data_frame()
    models = leaderboard["model_id"].tolist()[:5]

    y_true = test_df[target].values
    evaluated_models = []

    for model_id in models:
        model = h2o.get_model(model_id)
        preds = model.predict(test).as_data_frame().iloc[:, 0]

        acc = accuracy_score(y_true, preds)
        prec = precision_score(y_true, preds, average="weighted")
        rec = recall_score(y_true, preds, average="weighted")
        f1 = f1_score(y_true, preds, average="weighted")

        evaluated_models.append({
            "model_id": model_id,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4)
        })

    best_preds = h2o.get_model(models[0]).predict(test).as_data_frame().iloc[:, 0]
    labels = sorted(set(y_true))
    cm = confusion_matrix(y_true, best_preds, labels=labels)

    return {
        "skipped": False,
        "model_id": models[0],
        "metrics": evaluated_models[0],
        "confusion_matrix": {
            "labels": labels,
            "matrix": cm.tolist()
        },
        "leaderboard": evaluated_models
    }
