import json
import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set.")

client = genai.Client(api_key=api_key)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_FOLDER = BASE_DIR / "GeminiOut"
DATABASE_FILE = OUTPUT_FOLDER / "species_database.json"
LATEST_OUTPUT_FILE = OUTPUT_FOLDER / "animal_description.json"

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Animal Info API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnimalRequest(BaseModel):
    detected_name: str = Field(..., description="Animal name from detector output")
    confidence: Optional[float] = Field(None, description="Optional detector confidence")
    scientific_name: Optional[str] = Field(None, description="Optional scientific name if detector provides it")
    detected_at: Optional[str] = None


class SpeciesRecord(BaseModel):
    id: str
    commonName: str
    scientificName: str
    kingdom: str
    conservationStatus: str
    population: str
    habitat: List[str]
    description: str
    donationLink: Optional[str] = None
    confidence: Optional[float] = None
    detectedAt: Optional[str] = None


DONATION_LINKS = {
    "snow leopard": "https://snowleopard.org/",
    "panthera uncia": "https://snowleopard.org/",
    "african elephant": "https://www.savetheelephants.org/",
    "loxodonta africana": "https://www.savetheelephants.org/",
    "pangolin": "https://www.pangolincrisisfund.org/",
    "lion": "https://lionrecoveryfund.org/",
    "panthera leo": "https://lionrecoveryfund.org/",
    "tiger": "https://tigerconservation.org/",
    "panthera tigris": "https://tigerconservation.org/",
}


def load_json_file(path: Path, default):
    if not path.exists():
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def inject_trusted_donation_link(info: dict) -> dict:
    key1 = info.get("commonName", "").strip().lower()
    key2 = info.get("scientificName", "").strip().lower()
    trusted_link = DONATION_LINKS.get(key1) or DONATION_LINKS.get(key2)
    if trusted_link:
        info["donationLink"] = trusted_link
    return info


@app.get("/api/species", response_model=list[SpeciesRecord])
def get_species():
    return load_json_file(DATABASE_FILE, [])


@app.get("/api/species/latest", response_model=SpeciesRecord)
def get_latest_species():
    latest = load_json_file(LATEST_OUTPUT_FILE, None)
    if not latest:
        raise HTTPException(status_code=404, detail="No latest species data found")
    return latest


@app.get("/api/species/{species_id}", response_model=SpeciesRecord)
def get_species_by_id(species_id: str):
    database = load_json_file(DATABASE_FILE, [])
    match = next((item for item in database if item["id"] == species_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Species not found")
    return match


@app.post("/api/animal-info", response_model=SpeciesRecord)
def get_animal_info(payload: AnimalRequest):
    detected = (payload.scientific_name or payload.detected_name).strip()
    if not detected:
        raise HTTPException(status_code=400, detail="detected_name or scientific_name is required")

    prompt = f"""
You are helping a wildlife webapp.

Return structured JSON for this detected animal.

Detected animal: {detected}
Confidence: {payload.confidence}
Detected at: {payload.detected_at}

Rules:
- id: lowercase kebab-case unique id based on scientific name
- commonName: human-friendly common name
- scientificName: correct scientific (binomial) name if known
- kingdom: usually "Animalia"
- conservationStatus: concise conservation status
- population: short readable estimate or "Unknown"
- habitat: array of short habitat strings
- description: 1 to 3 sentences, max 90 words
- donationLink: null unless highly trustworthy
- confidence: pass through the numeric confidence
- detectedAt: pass through the timestamp
- do not invent facts or URLs
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SpeciesRecord,
                temperature=0.2,
            ),
        )

        parsed = response.parsed
        if parsed is None:
            raise ValueError("Gemini returned no parsed JSON")

        result = parsed.model_dump()
        result = inject_trusted_donation_link(result)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini request failed: {str(e)}")


# uvicorn main:app --reload
# docs at http://127.0.0.1:8000/docs