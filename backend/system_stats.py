import platform
import psutil
import time

_START_TIME = time.time()


def get_system_info():
    return {
        "os": platform.system() + " " + platform.release(),
        "python_version": platform.python_version(),
        "cpu_cores": psutil.cpu_count(logical=False),
        "cpu_threads": psutil.cpu_count(logical=True),
        "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
    }


def get_system_stats():
    vm = psutil.virtual_memory()
    return {
        "cpu_usage_percent": psutil.cpu_percent(interval=None),
        "ram_used_gb": round((vm.total - vm.available) / (1024**3), 2),
        "ram_percent": vm.percent,
        "uptime_sec": int(time.time() - _START_TIME),
    }


async def send_system_info(ws):
    await ws.send_json({
        "type": "system_info",
        "data": get_system_info()
    })


async def send_system_stats(ws):
    await ws.send_json({
        "type": "system_stats",
        "data": get_system_stats()
    })
