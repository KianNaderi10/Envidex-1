"""ASGI entrypoint for the prediction service.

This file is used so a stable module name is importable when starting
uvicorn from the backend directory.

Usage:
    cd src/backend
    uvicorn prediction:app --reload
"""

from AnimalAiImageRec.Prediction import app