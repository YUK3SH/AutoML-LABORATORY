from .logger import setup_logger

log = setup_logger("METRIC")

def select_metrics(task: str):
    if task == "classification":
        return ["accuracy", "precision_weighted", "recall_weighted", "f1_weighted"]
    return ["rmse", "mae", "r2"]
