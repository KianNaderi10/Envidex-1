"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useEnvidexStore } from "@/lib/store";
import { findSpeciesByScientificName } from "@/lib/mock-species";

type PredictOutput = Record<string, unknown>;

export default function LiveFeedPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [output, setOutput] = useState("Waiting...");
  const [isPredicting, setIsPredicting] = useState(false);
  const { addToCollection } = useEnvidexStore();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setOutput(`Camera error: ${String(err)}`);
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureAndPredict = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setOutput("Camera is not ready yet. Please try again.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setOutput("Canvas context unavailable.");
      return;
    }

    setIsPredicting(true);
    setOutput("Predicting...");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );

      if (!blob) throw new Error("Failed to create image blob");

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Prediction request failed (${res.status})`);

      const data = (await res.json()) as PredictOutput;
      setOutput(JSON.stringify(data, null, 2));

      // Add to collection if species found
      if (data.scientific_name && typeof data.scientific_name === "string") {
        const species = findSpeciesByScientificName(data.scientific_name);
        if (species) {
          addToCollection({
            speciesId: species.id,
            discoveredAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      setOutput(`Prediction error: ${String(err)}`);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-10 pb-24">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Live Animal Recognition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Point at any mammal to identify
        </p>
      </div>

      <Card className="p-3 border-border/50 bg-card/60">
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-square">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <button
          type="button"
          onClick={captureAndPredict}
          disabled={isPredicting}
          className="mt-3 w-full flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPredicting ? "Predicting..." : "Capture and Predict"}
        </button>
      </Card>

      <Card className="mt-4 p-3 border-border/50 bg-card/60">
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
          {output}
        </pre>
      </Card>
    </div>
  );
}
