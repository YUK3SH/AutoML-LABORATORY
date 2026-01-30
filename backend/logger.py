import logging
import sys
from queue import Queue
from datetime import datetime
from collections import deque

# global in-memory log queue (for websocket replay if needed)
_LOG_QUEUE = deque(maxlen=500)
_LOGGERS = {}

def setup_logger(name: str):
    if name in _LOGGERS:
        return _LOGGERS[name]

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )
    handler.setFormatter(formatter)

    if not logger.handlers:
        logger.addHandler(handler)

    logger.propagate = False
    _LOGGERS[name] = logger
    return logger


def stream_log(ws, message: str):
    ts = datetime.now().strftime("%H:%M:%S")
    msg = f"[{ts}] {message}"

    _LOG_QUEUE.append(msg)

    ws.send_json({
        "type": "log",
        "message": msg
    })


def get_log_queue():
    return list(_LOG_QUEUE)
