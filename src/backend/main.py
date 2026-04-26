import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from pymongo import MongoClient
from datetime import datetime
import json
import numpy as np
import tensorflow as tf
from PIL import Image
import io
from pathlib import Path

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set.")

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client.envidex  # Assuming 'envidex' is your database name
logs_collection = db.animal_logs  # Collection for logging animal detections

client = genai.Client(api_key=api_key)

# Load AI model
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = PROJECT_ROOT / "animal_species_model.keras"
CLASS_NAMES_PATH = PROJECT_ROOT / "class_names.json"
PREDICTIONS_DIR = Path(__file__).resolve().parent / "Predictions"
IMG_SIZE = (224, 224)

PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)

model = None
class_names = []

if MODEL_PATH.exists() and CLASS_NAMES_PATH.exists():
    model = tf.keras.models.load_model(str(MODEL_PATH))
    with open(CLASS_NAMES_PATH, "r") as f:
        class_names = json.load(f)
else:
    print("WARNING: Model files not found.")

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

app = FastAPI(title="Animal Info API")

# Adjust this in production to your real frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded."}
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))

    result = predict_pil_image(img)

    filename = "prediction.json"
    output_path = PREDICTIONS_DIR / filename

    with open(output_path, "w") as f:
        json.dump(result, f, indent=4)

    return result


class AnimalRequest(BaseModel):
    detected_name: str = Field(..., description="Animal name from detector output")
    confidence: Optional[float] = Field(None, description="Optional detector confidence")
    scientific_name: Optional[str] = Field(
        None, description="Optional scientific name if detector provides it"
    )


class AnimalInfo(BaseModel):
    common_name: str
    scientific_name: str
    description: str
    endangerment_status: str
    donation_link: Optional[str] = None


# Optional trusted link map.
# This is safer than letting the model invent donation URLs.
DONATION_LINKS = {
    "snow leopard": "https://snowleopard.org/",
    "african elephant": "https://www.savetheelephants.org/",
    "pangolin": "https://www.pangolincrisisfund.org/",
    "sea otter": "https://www.seaotter.org/",
}


def inject_trusted_donation_link(info: AnimalInfo) -> AnimalInfo:
    key = info.common_name.strip().lower()
    trusted_link = DONATION_LINKS.get(key)
    if trusted_link:
        info.donation_link = trusted_link
    return info


@app.post("/api/animal-info", response_model=AnimalInfo)
def get_animal_info(payload: AnimalRequest):
    detected = payload.detected_name.strip()
    if not detected:
        raise HTTPException(status_code=400, detail="detected_name is required")

    prompt = f"""
You are helping a wildlife webapp.

Given an animal detector output, return structured data.

Detector output: {detected}
Confidence: {payload.confidence}
Scientific name: {payload.scientific_name}

Instructions:
- Return the most likely common animal name.
- Return the scientific name
- Write a short factual description under 80 words.
- Return a concise conservation/endangerment status.
- donation_link must be null unless you are highly confident in an official or well-known conservation donation page.
- If the detector output is uncertain, be conservative and reflect uncertainty briefly in the description.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnimalInfo,
                temperature=0.2,
            ),
        )

        # With structured output, the SDK can parse into the schema.
        parsed = response.parsed

        if parsed is None:
            raise ValueError("Gemini returned no parsed JSON")

        result = parsed
        result = inject_trusted_donation_link(result)
        
        # Log the animal detection to MongoDB
        log_entry = {
            "detected_name": payload.detected_name,
            "scientific_name": result.scientific_name,
            "common_name": result.common_name,
            "confidence": payload.confidence,
            "timestamp": datetime.utcnow(),
            "user_id": None,  # Add user ID if available from auth
        }
        logs_collection.insert_one(log_entry)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini request failed: {str(e)}")
    
#http://127.0.0.1:8000/docs
#uvicorn main:app --reload