from autogluon.tabular import TabularPredictor
from .logger import setup_logger
import numpy as np

log = setup_logger("AUTOGLUON")

MIN_ROWS = 50

def run_autogluon(
    train_df,
    test_df,
    target: str,
    task: str,
    time_limit: int = 60
):
    if train_df.shape[0] < MIN_ROWS:
        return {"skipped": True, "reason": "Dataset too small"}

    predictor = TabularPredictor(
        label=target,
        problem_type=task,
        eval_metric="accuracy" if task == "classification" else "rmse",
        verbosity=0
    )

    predictor.fit(
        train_data=train_df,
        time_limit=time_limit,
        presets="medium_quality_faster_train"
    )

    lb = predictor.leaderboard(test_df, silent=True)

    return {
        "skipped": False,
        "leaderboard": lb.to_dict(orient="records")
    }
