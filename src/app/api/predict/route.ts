import { NextResponse } from "next/server";

const PREDICTION_API_BASE_URL =
  process.env.PREDICTION_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file upload in field 'file'" },
        { status: 400 }
      );
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", file, file.name || "frame.jpg");

    const upstreamRes = await fetch(`${PREDICTION_API_BASE_URL}/predict`, {
      method: "POST",
      body: upstreamForm,
      cache: "no-store",
    });

    const rawText = await upstreamRes.text();
    let payload: unknown = { message: rawText };

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = { message: rawText };
      }
    }

    return NextResponse.json(payload, { status: upstreamRes.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Prediction service unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
