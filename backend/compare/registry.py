import json
import os
from threading import Lock

STORE_PATH = "backend/storage/results.json"
_lock = Lock()

os.makedirs("backend/storage", exist_ok=True)

def load_results():
    if not os.path.exists(STORE_PATH):
        return []
    with open(STORE_PATH, "r") as f:
        return json.load(f)

def save_result(entry):
    with _lock:
        data = load_results()
        data.append(entry)
        with open(STORE_PATH, "w") as f:
            json.dump(data, f, indent=2)
