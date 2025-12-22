from autogluon.tabular import TabularPredictor
from .logger import setup_logger

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
        msg = f"AutoGluon skipped: need >= {MIN_ROWS} rows, got {train_df.shape[0]}"
        log.warning(msg)
        return {
            "skipped": True,
            "reason": msg
        }

    log.info("Starting AutoGluon training")
    log.info(f"Time limit: {time_limit}s")

    predictor = TabularPredictor(
        label=target,
        problem_type=task,
        verbosity=2
    )

    predictor.fit(
        train_data=train_df,
        time_limit=time_limit,
        presets="medium_quality_faster_train"
    )

    leaderboard = predictor.leaderboard(
        test_df,
        silent=True
    )

    log.info("AutoGluon training completed")

    return {
        "skipped": False,
        "leaderboard": leaderboard.to_dict(orient="records")
    }

