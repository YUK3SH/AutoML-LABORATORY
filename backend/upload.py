import os
from fastapi import UploadFile
from backend.logger import setup_logger

DATASET_DIR = "datasets"

log = setup_logger("UPLOAD")


async def upload_dataset(file: UploadFile):
    os.makedirs(DATASET_DIR, exist_ok=True)

    file_path = os.path.join(DATASET_DIR, file.filename)

    log.info(f"Uploading file: {file.filename}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    log.info(f"Saved dataset to {file_path}")

    return {
        "success": True,
        "filename": file.filename
    }
