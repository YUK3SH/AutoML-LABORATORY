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

        dataset = entry.get("dataset")
        tool = entry.get("tool")

        # FIX: ensure model id always exists
        if not entry.get("best_model"):
            lb = entry.get("leaderboard", [])
            if lb and isinstance(lb, list) and "model_id" in lb[0]:
                entry["best_model"] = lb[0]["model_id"]
            else:
                entry["best_model"] = "UNKNOWN_MODEL"

        # remove old record for same dataset + tool
        data = [
            r for r in data
            if not (r.get("dataset") == dataset and r.get("tool") == tool)
        ]

        data.append(entry)

        with open(STORE_PATH, "w") as f:
            json.dump(data, f, indent=2)
