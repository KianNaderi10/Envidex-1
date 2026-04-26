import io
import os
import json
from datetime import datetime
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent.parent
MODEL_PATH = PROJECT_ROOT / "animal_species_model.keras"
CLASS_NAMES_PATH = PROJECT_ROOT / "class_names.json"
PREDICTIONS_DIR = BASE_DIR.parent / "Predictions"
STATIC_DIR = BASE_DIR / "static"
IMG_SIZE = (224, 224)

PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

model = None
class_names = []

if MODEL_PATH.exists() and CLASS_NAMES_PATH.exists():
    model = tf.keras.models.load_model(str(MODEL_PATH))
    with open(CLASS_NAMES_PATH, "r") as f:
        class_names = json.load(f)
else:
    print(f"WARNING: Model files not found. Run AnimalAi.py to train the model first.")

SCIENTIFIC_NAMES = {
    "ochotona_princeps": "Ochotona princeps",
    "panthera_leo": "Panthera leo",
    "panthera_tigris": "Panthera tigris",
}

def predict_pil_image(img: Image.Image):
    img = img.convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)

    preds = model.predict(arr, verbose=0)
    pred_index = int(np.argmax(preds[0]))
    confidence = float(preds[0][pred_index])

    label = class_names[pred_index]
    scientific_name = SCIENTIFIC_NAMES.get(label, label.replace("_", " ").title())

    result = {
        "scientific_name": scientific_name,
        "confidence": round(confidence * 100, 2),
    }
    return result

@app.get("/")
def home():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse({"status": "ok", "message": "Prediction service is running"})

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return JSONResponse({"error": "Model not loaded. Run AnimalAi.py to train first."}, status_code=503)
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))

    result = predict_pil_image(img)

    filename = f"prediction.json"
    output_path = PREDICTIONS_DIR / filename

    with open(output_path, "w") as f:
        json.dump(result, f, indent=4)

    return JSONResponse({
        "result": result,
        "saved_to": str(output_path)
    })