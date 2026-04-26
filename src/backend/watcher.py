import json
import os
import time
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

WATCH_FOLDER = Path("./src/backend/Predictions")
OUTPUT_FOLDER = Path("./src/backend/GeminiOut")

WATCH_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)

INPUT_FILE = WATCH_FOLDER / "prediction.json"
OUTPUT_FILE = OUTPUT_FOLDER / "animal_description.json"

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

client = genai.Client(api_key=api_key)


class AnimalInfo(BaseModel):
    common_name: str
    scientific_name: str
    description: str
    endangerment_status: str
    donation_link: Optional[str] = None


DONATION_LINKS = {
    "snow leopard": "https://snowleopard.org/",
    "panthera uncia": "https://snowleopard.org/",
    "african elephant": "https://www.savetheelephants.org/",
    "loxodonta africana": "https://www.savetheelephants.org/",
    "pangolin": "https://www.pangolincrisisfund.org/",
}


def get_trusted_donation_link(common_name: str, scientific_name: str) -> Optional[str]:
    return (
        DONATION_LINKS.get(common_name.strip().lower())
        or DONATION_LINKS.get(scientific_name.strip().lower())
    )


def generate_animal_info(scientific_name: str, confidence: Optional[float]) -> dict:
    prompt = f"""
You are helping a wildlife webapp.

Return structured JSON for this detected animal.

Detected animal: {scientific_name}
Confidence: {confidence}

Rules:
- common_name: human-friendly common name
- scientific_name: correct scientific name if known
- description: 1 to 2 sentences, max 80 words
- endangerment_status: concise conservation status
- donation_link: null unless highly confident
- do not invent facts or URLs
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AnimalInfo,
            temperature=0.2,
        ),
    )

    parsed = response.parsed
    if parsed is None:
        raise ValueError("Gemini returned no parsed JSON")

    result = parsed.model_dump()

    trusted_link = get_trusted_donation_link(
        result["common_name"],
        result["scientific_name"]
    )
    if trusted_link:
        result["donation_link"] = trusted_link

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

        name = data.get("scientific_name")
        confidence = data.get("confidence")

        if not name:
            print("No 'name' found in prediction.json")
            return

        result = generate_animal_info(name, confidence)

        print("Gemini result:")
        print(json.dumps(result, indent=2))

        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

        print(f"Updated {OUTPUT_FILE.resolve()}")

    except Exception as e:
        print(f"Error processing file: {e}")


class JsonChangeHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.last_run = 0

    def on_modified(self, event):
        src = Path(event.src_path).resolve()
        target = INPUT_FILE.resolve()

        print(f"Modified event detected: {src}")

        if src != target:
            return

        now = time.time()
        if now - self.last_run < 1:
            return

        self.last_run = now
        print(f"Detected change in {INPUT_FILE}")
        process_file()

    def on_created(self, event):
        src = Path(event.src_path).resolve()
        target = INPUT_FILE.resolve()

        print(f"Created event detected: {src}")

        if src != target:
            return

        now = time.time()
        if now - self.last_run < 1:
            return

        self.last_run = now
        print(f"Detected creation of {INPUT_FILE}")
        process_file()


if __name__ == "__main__":
    print(f"Watching folder: {WATCH_FOLDER.resolve()}")
    print(f"Watching file: {INPUT_FILE.resolve()}")
    print(f"Output file: {OUTPUT_FILE.resolve()}")

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