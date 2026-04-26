import os
from typing import Optional

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

app = FastAPI(title="Animal Info API")

# Adjust this in production to your real frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini request failed: {str(e)}")
    
#http://127.0.0.1:8000/docs