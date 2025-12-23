from .logger import setup_logger

log = setup_logger("PYCARET")

def run_pycaret(*args, **kwargs):
    msg = (
        "PyCaret is disabled in this environment "
        "(Python 3.12). Will be enabled in a separate venv."
    )
    log.warning(msg)
    return {
        "skipped": True,
        "reason": msg
    }
