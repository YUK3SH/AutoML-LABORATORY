from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error
from .logger import setup_logger

log = setup_logger("BASELINE")

def train_baseline(X_train, X_test, y_train, y_test, task: str):
    if task == "classification":
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        score = accuracy_score(y_test, preds)
        metric = "accuracy"
    else:
        model = LinearRegression()
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        score = mean_squared_error(y_test, preds)
        metric = "mse"

    log.info(f"Baseline {metric}: {score}")
    return metric, score
