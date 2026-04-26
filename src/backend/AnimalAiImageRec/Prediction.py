import io
import os
import json
from datetime import datetime

import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

MODEL_PATH = "animal_species_model.keras"
CLASS_NAMES_PATH = "class_names.json"
PREDICTIONS_DIR = "src/backend/Predictions"
IMG_SIZE = (224, 224)

os.makedirs(PREDICTIONS_DIR, exist_ok=True)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

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
    return FileResponse("static/index.html")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))

    result = predict_pil_image(img)

    filename = f"prediction_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.json"
    output_path = os.path.join(PREDICTIONS_DIR, filename)

    with open(output_path, "w") as f:
        json.dump(result, f, indent=4)

    return JSONResponse({
        "result": result,
        "saved_to": output_path
    })