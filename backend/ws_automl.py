import asyncio
from fastapi import WebSocket
from backend.orchestrator import run_pipeline
from backend.system_stats import send_system_info, send_system_stats


async def automl_ws(websocket: WebSocket, engine: str):
    await websocket.accept()

    payload = await websocket.receive_json()
    filename = payload.get("filename")

    await send_system_info(websocket)

    async for msg in run_pipeline(filename, engine):
        if msg["type"] == "log":
            await websocket.send_json(msg)
            await send_system_stats(websocket)

        elif msg["type"] == "result":
            await websocket.send_json({
                "type": "result",
                "data": msg["data"]
            })
            await websocket.send_json({"type": "done"})
            await asyncio.sleep(0)
            await websocket.close()
            return

    await websocket.send_json({"type": "done"})
    await websocket.close()
