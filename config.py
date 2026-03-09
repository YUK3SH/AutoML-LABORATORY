import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
RESULTS_FOLDER = os.path.join(BASE_DIR, "results")
CONFUSION_MATRIX_FOLDER = os.path.join(RESULTS_FOLDER, "confusion_matrices")
MODELS_FOLDER = os.path.join(BASE_DIR, "models")

for folder in [UPLOAD_FOLDER, RESULTS_FOLDER, CONFUSION_MATRIX_FOLDER, MODELS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

ALLOWED_EXTENSIONS = {"csv"}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 50 MB

TEST_SIZE = 0.2
RANDOM_STATE = 42

H2O_MAX_RUNTIME = 120       # seconds
AUTOGLUON_MAX_RUNTIME = 120
TPOT_GENERATIONS = 5
TPOT_POPULATION_SIZE = 20
FLAML_MAX_RUNTIME = 120

FRAMEWORKS = ["H2O", "AutoGluon", "TPOT", "FLAML"]

FRAMEWORK_ALGORITHMS = {
    "H2O":       ["GBM", "Random Forest"],
    "AutoGluon": ["LightGBM", "CatBoost"],
    "TPOT":      ["XGBoost", "Random Forest"],
    "FLAML":     ["LightGBM", "XGBoost"],
}
print(f"--- Config loaded. Base Dir: {BASE_DIR} ---")
