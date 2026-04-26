import json
import os
import time
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()

WATCH_FOLDER = Path("./src/backend/Predictions")
OUTPUT_FOLDER = Path("./src/backend/GeminiOut")

WATCH_FOLDER.mkdir(parents=True, exist_ok=True)
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)

INPUT_FILE = WATCH_FOLDER / "prediction.json"
LATEST_OUTPUT_FILE = OUTPUT_FOLDER / "animal_description.json"
DATABASE_FILE = OUTPUT_FOLDER / "species_database.json"

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

client = genai.Client(api_key=api_key)


class SpeciesRecord(BaseModel):
    id: str = Field(..., description="slug id like panthera-leo")
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


def get_trusted_donation_link(common_name: str, scientific_name: str) -> Optional[str]:
    return (
        DONATION_LINKS.get(common_name.strip().lower())
        or DONATION_LINKS.get(scientific_name.strip().lower())
    )


def load_database() -> list[dict]:
    if not DATABASE_FILE.exists():
        return []

    try:
        with open(DATABASE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_database(data: list[dict]) -> None:
    with open(DATABASE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def upsert_species_record(record: dict) -> None:
    db = load_database()
    existing_index = next((i for i, item in enumerate(db) if item["id"] == record["id"]), None)

    if existing_index is None:
        db.append(record)
    else:
        db[existing_index] = record

    db.sort(key=lambda x: x["commonName"].lower())
    save_database(db)


def generate_species_record(scientific_name: str, confidence: Optional[float], detected_at: Optional[str]) -> dict:
    prompt = f"""
You are helping a wildlife webapp.

Return structured JSON matching this schema exactly for the detected animal.

Detected animal scientific name: {scientific_name}
Confidence: {confidence}
Detected at: {detected_at}

Rules:
- id: lowercase kebab-case unique id based on scientific name, e.g. "panthera-leo"
- commonName: short human-friendly animal name
- scientificName: proper scientific/binomial name
- kingdom: usually "Animalia"
- conservationStatus: one concise value like "Least Concern", "Vulnerable", "Endangered", "Critically Endangered", "Data Deficient", "Near Threatened", "Extinct in the Wild"
- population: short readable estimate, e.g. "~20,000", "Unknown", "<4,000"
- habitat: array of 1 to 4 short habitat labels
- description: 1 to 3 sentences, max 90 words, suitable for mobile UI
- donationLink: null unless highly trustworthy, but you should usually return null
- confidence: pass through the numeric confidence you were given
- detectedAt: pass through the timestamp you were given
- do not invent precise statistics if uncertain; use "Unknown"
- output JSON only
"""

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

    trusted_link = get_trusted_donation_link(
        result["commonName"],
        result["scientificName"]
    )
    if trusted_link:
        result["donationLink"] = trusted_link

    return result


def process_file():
    print(f"Checking input file: {INPUT_FILE.resolve()}")

    if not INPUT_FILE.exists():
        print(f"Input file not found: {INPUT_FILE.resolve()}")
        return

    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        print(f"Loaded input JSON: {data}")

        scientific_name = data.get("scientific_name")
        confidence = data.get("confidence")
        detected_at = data.get("detected_at")

        if not scientific_name:
            print("No 'scientific_name' found in prediction.json")
            return

        result = generate_species_record(scientific_name, confidence, detected_at)

        with open(LATEST_OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        upsert_species_record(result)

        print("Latest output written to:", LATEST_OUTPUT_FILE.resolve())
        print("Database updated at:", DATABASE_FILE.resolve())

    except Exception as e:
        print(f"Error processing file: {e}")


class JsonChangeHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.last_run = 0

    def _should_process(self, src_path: str) -> bool:
        src = Path(src_path).resolve()
        target = INPUT_FILE.resolve()

        if src != target:
            return False

        now = time.time()
        if now - self.last_run < 1:
            return False

        self.last_run = now
        return True

    def on_modified(self, event):
        if self._should_process(event.src_path):
            print(f"Detected change in {INPUT_FILE}")
            process_file()

    def on_created(self, event):
        if self._should_process(event.src_path):
            print(f"Detected creation of {INPUT_FILE}")
            process_file()


if __name__ == "__main__":
    print(f"Watching folder: {WATCH_FOLDER.resolve()}")
    print(f"Watching file: {INPUT_FILE.resolve()}")
    print(f"Latest output file: {LATEST_OUTPUT_FILE.resolve()}")
    print(f"Database file: {DATABASE_FILE.resolve()}")

    event_handler = JsonChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path=str(WATCH_FOLDER), recursive=False)
    observer.start()

    process_file()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()