from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import time

from backend.orchestrator import run_pipeline
from backend.compare.registry import load_results
from backend.system_stats import send_system_info, send_system_stats

app = FastAPI(title="AutoML Laboratory")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- MODELS --------------------
class RunRequest(BaseModel):
    dataset: str
    tool: str


class CompareRequest(BaseModel):
    dataset: str
    tool: str


# -------------------- ROUTES --------------------

@app.get("/list_files")
def list_files():
    if not os.path.exists("datasets"):
        return {"files": []}

    files = [
        f for f in os.listdir("datasets")
        if f.lower().endswith(".csv")
    ]
    return {"files": files}


@app.post("/run")
async def run_automl(req: RunRequest):
    """
    Select & Run AutoML (single tool, REST fallback)
    Returns structured result for frontend
    """
    start_time = time.time()
    raw_result = None

    async for msg in run_pipeline(req.dataset, req.tool):
        if msg.get("type") == "result":
            raw_result = msg.get("data")

    if not raw_result:
        raise HTTPException(status_code=500, detail="AutoML run failed")

    # -------- NORMALIZE RESULT --------
    training_time = round(time.time() - start_time, 2)

    models = raw_result.get("models", [])
    leaderboard = []

    for m in models:
        leaderboard.append({
            "model": m.get("name", "unknown"),
            "accuracy": m.get("accuracy", 0)
        })

    leaderboard = sorted(
        leaderboard,
        key=lambda x: x["accuracy"],
        reverse=True
    )

    response = {
        "run_id": raw_result.get("run_id", f"{req.tool}-{int(start_time)}"),
        "dataset": req.dataset,
        "tool": req.tool,
        "status": "COMPLETED",

        "metrics": {
            "accuracy": raw_result.get("best_accuracy", 0),
            "training_time_sec": training_time,
            "models_trained": len(models)
        },

        "leaderboard": leaderboard[:5],
        "loss_curve": raw_result.get("loss_curve", [])
    }

    return response


@app.post("/compare")
def compare(req: CompareRequest):
    """
    Benchmark comparison using stored results
    """
    records = [
        r for r in load_results()
        if r.get("dataset") == req.dataset
    ]

    selected = None
    others = []

    for r in records:
        if r.get("tool") == req.tool:
            selected = r
        else:
            others.append(r)

    return {
        "selected": selected,
        "others": others
    }


# -------------------- WEBSOCKET --------------------

@app.websocket("/ws/automl")
async def ws_automl(websocket: WebSocket):
    """
    Live AutoML execution with logs + system stats
    """
    await websocket.accept()

    try:
        payload = await websocket.receive_json()
        dataset = payload.get("filename")
        tool = payload.get("tool", "h2o")

        if not dataset:
            await websocket.close(code=1008)
            return

        await send_system_info(websocket)

        async for msg in run_pipeline(dataset, tool):
            if msg["type"] == "log":
                await websocket.send_json(msg)
                await send_system_stats(websocket)

            elif msg["type"] == "result":
                await websocket.send_json({
                    "type": "result",
                    "data": msg["data"]
                })
                await websocket.send_json({"type": "done"})
                await websocket.close()
                return

        await websocket.send_json({"type": "done"})
        await websocket.close()

    except WebSocketDisconnect:
        pass

@app.get("/benchmarks")
def get_benchmarks():
    """
    Return all saved benchmark results
    """
    return load_results()
