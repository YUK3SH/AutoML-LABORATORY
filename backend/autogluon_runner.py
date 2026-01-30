from autogluon.tabular import TabularPredictor
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    confusion_matrix,
)
from .logger import setup_logger

log = setup_logger("AUTOGLUON")

MIN_ROWS = 50


def _map_problem_type(task, y):
    if task == "classification":
        return "binary" if len(set(y)) == 2 else "multiclass"
    return "regression"


def run_autogluon(
    train_df,
    test_df,
    target: str,
    task: str,
    time_limit: int = 60
):
    if train_df.shape[0] < MIN_ROWS:
        return {"skipped": True, "reason": "Dataset too small"}

    y_train = train_df[target].values
    problem_type = _map_problem_type(task, y_train)

    predictor = TabularPredictor(
        label=target,
        problem_type=problem_type,
        verbosity=0
    )

    predictor.fit(
        train_data=train_df,
        time_limit=time_limit,
        presets="medium_quality_faster_train"
    )

    y_true = test_df[target].values
    X_test = test_df.drop(columns=[target])

    model_names = predictor.model_names()
    leaderboard = []

    for model_name in model_names[:5]:
        preds = predictor.predict(X_test, model=model_name)

        if task == "classification":
            acc = float(accuracy_score(y_true, preds))
            prec = float(precision_score(y_true, preds, average="weighted", zero_division=0))
            rec = float(recall_score(y_true, preds, average="weighted", zero_division=0))
            f1 = float(f1_score(y_true, preds, average="weighted", zero_division=0))

            leaderboard.append({
                "model_id": model_name,
                "accuracy": round(acc, 4),
                "precision_weighted": round(prec, 4),
                "recall_weighted": round(rec, 4),
                "f1_weighted": round(f1, 4),
            })
        else:
            rmse = float(mean_squared_error(y_true, preds, squared=False))
            mae = float(mean_absolute_error(y_true, preds))
            r2 = float(r2_score(y_true, preds))

            leaderboard.append({
                "model_id": model_name,
                "rmse": round(rmse, 4),
                "mae": round(mae, 4),
                "r2": round(r2, 4),
            })

    confusion = None
    best_model_id = leaderboard[0]["model_id"] if leaderboard else None

    if task == "classification" and best_model_id:
        best_preds = predictor.predict(X_test, model=best_model_id)
        labels = sorted(set(y_true))
        cm = confusion_matrix(y_true, best_preds, labels=labels)

        confusion = {
            "labels": labels,
            "matrix": cm.tolist()
        }

    return {
        "skipped": False,
        "best_model": best_model_id,
        "metrics": leaderboard[0] if leaderboard else {},
        "confusion_matrix": confusion,
        "leaderboard": leaderboard
    }
