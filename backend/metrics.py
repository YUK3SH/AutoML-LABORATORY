from .logger import setup_logger

log = setup_logger("METRIC")

def select_metrics(task: str):
    if task == "classification":
        metrics = [
            "accuracy",
            "precision",
            "recall",
            "f1"
        ]
    else:
        metrics = [
            "rmse",
            "mae",
            "r2"
        ]

    log.info(f"Selected metrics: {metrics}")
    return metrics
