from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from .logger import setup_logger
import numpy as np

log = setup_logger("BASELINE")

def train_baseline(X_train, X_test, y_train, y_test, task: str):
    if task == "classification":
        model = LogisticRegression(max_iter=1000)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        return "accuracy", accuracy_score(y_test, preds)

    model = LinearRegression()
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    return "rmse", rmse
