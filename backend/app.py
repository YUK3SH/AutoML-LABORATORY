from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

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
    """
    result = None

    async for msg in run_pipeline(req.dataset, req.tool):
        if msg["type"] == "result":
            result = msg["data"]

    if not result:
        raise HTTPException(status_code=500, detail="AutoML run failed")

    return result


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
