import asyncio
from fastapi import WebSocket, WebSocketDisconnect

from backend.orchestrator import run_pipeline
from backend.system_stats import (
    send_system_info,
    send_system_stats
)


async def automl_ws(websocket: WebSocket, engine: str):
    await websocket.accept()

    try:
        payload = await websocket.receive_json()
        filename = payload.get("filename")

        if not filename:
            await websocket.send_json({
                "type": "error",
                "message": "Filename missing"
            })
            await websocket.close()
            return

        await send_system_info(websocket)

        async for msg in run_pipeline(
            filename=filename,
            engine=engine
        ):
            if msg["type"] == "result":
                await websocket.send_json({
                    "type": "result",
                    "data": msg["data"]
                })
                await websocket.send_json({"type": "done"})
                await asyncio.sleep(0)
                await websocket.close()
                return

            await send_system_stats(websocket)

    except WebSocketDisconnect:
        return

    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
        await websocket.close()
