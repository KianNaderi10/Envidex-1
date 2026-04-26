"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Plus, Check, Share2, Copy, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useEnvidexStore } from "@/lib/store";
import type { ConservationStatus } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { sounds } from "@/lib/sounds";

type ScanState = "idle" | "scanning" | "result" | "error";
type ErrorType = "photo" | "network" | "ratelimit" | "server";

const SCAN_MESSAGES = [
  "Analyzing image...",
  "Checking species features...",
  "Cross-referencing database...",
  "Identifying habitat markers...",
  "Almost there...",
];

interface IdentifyResult {
  id: string;
  commonName: string;
  scientificName: string;
  conservationStatus: ConservationStatus;
  population: string;
  description: string;
  threats: string[];
  howToHelp: string[];
  funFacts: string[];
  confidence: number;
  isIdentifiable: boolean;
  notIdentifiableReason?: string;
  kingdom: string;
  habitat: string[];
  range: string;
  diet?: string;
  class: string;
}

export default function LiveFeedPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [shareState, setShareState] = useState<"idle" | "sharing" | "copied">("idle");
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [errorType, setErrorType] = useState<ErrorType>("photo");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [predictResult, setPredictResult] = useState<Record<string, unknown> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addToCollection, isCollected, incrementShareCount, collection } = useEnvidexStore();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError("Camera unavailable on this device.");
      }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const captureAndIdentify = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    setPredictResult(null);
    setScanState("scanning");

    // Convert data URL to blob for the predict endpoint
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));

    const [identifySettled, predictSettled] = await Promise.allSettled([
      fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      }),
      blob
        ? (() => { const f = new FormData(); f.append("file", blob, "frame.jpg"); return fetch("/api/predict", { method: "POST", body: f }); })()
        : Promise.reject(new Error("no blob")),
    ]);

    // Handle predict result (best-effort — never blocks the main result)
    if (predictSettled.status === "fulfilled" && predictSettled.value.ok) {
      try { setPredictResult(await predictSettled.value.json()); } catch { /* ignore */ }
    }

    try {
      if (identifySettled.status === "rejected") throw new TypeError();
      const res = identifySettled.value;
      if (!res.ok) {
        if (res.status === 429) { setErrorType("ratelimit"); throw new Error(); }
        if (res.status === 413) { setErrorType("photo"); throw new Error(); }
        setErrorType("server");
        throw new Error();
      }
      const data: IdentifyResult = await res.json();
      setResult(data);
      sounds.scanComplete();
      setScanState("result");
    } catch (err) {
      if (err instanceof TypeError) setErrorType("network");
      sounds.error();
      setScanState("error");
    }
  };

  const dismiss = () => {
    setScanState("idle");
    setCapturedImage(null);
    setResult(null);
    setPredictResult(null);
    setShareState("idle");
  };

  const collected = result ? isCollected(result.id) : false;
  const collectedEntry = result ? collection.find((e) => e.speciesId === result.id) : null;
  const collectedDate = collectedEntry
    ? new Date(collectedEntry.discoveredAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  useEffect(() => {
    if (!result) { setDisplayConfidence(0); return; }
    const target = Math.round(result.confidence * 100);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + 3, target);
      setDisplayConfidence(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (scanState !== "scanning") { setScanMessageIndex(0); return; }
    const timer = setInterval(() => setScanMessageIndex((i) => (i + 1) % SCAN_MESSAGES.length), 1800);
    return () => clearInterval(timer);
  }, [scanState]);

  const handleShare = async () => {
    if (!result || !capturedImage || shareState === "sharing") return;
    setShareState("sharing");
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: capturedImage, speciesData: result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      incrementShareCount();
      if (navigator.share) {
        await navigator.share({ title: result.commonName, text: `I found a ${result.commonName} with Envidex!`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2500);
        return;
      }
    } catch {
      // share cancelled or failed
    }
    setShareState("idle");
  };

  const handleCollect = () => {
    if (!result || collected) return;
    addToCollection({ speciesId: result.id, discoveredAt: new Date().toISOString() });
    sounds.collect();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4ade80", "#22c55e", "#16a34a", "#bbf7d0", "#ffffff"],
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 pt-10 pb-4">
        <h1 className="text-2xl font-bold">Live Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">Point at any mammal to identify</p>
      </div>

      {/* Camera */}
      <div className="px-4 flex-1 flex flex-col gap-4">
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-square">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Corner brackets */}
          <div className="absolute inset-6 border-2 border-primary/40 rounded-2xl pointer-events-none" />
          <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-2xl" />
          <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-2xl" />

          {/* Scanning overlay */}
          <AnimatePresence>
            {scanState === "scanning" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3"
              >
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scanMessageIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-white text-sm font-semibold"
                  >
                    {SCAN_MESSAGES[scanMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6">
              <p className="text-white/80 text-xs text-center">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Identify button */}
        <button
          onClick={captureAndIdentify}
          disabled={!!cameraError || scanState === "scanning"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-40"
        >
          <Camera className="h-4 w-4" />
          Identify
        </button>
      </div>

      {/* Result / Error sheet */}
      <AnimatePresence>
        {(scanState === "result" || scanState === "error") && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-28"
          >
            {scanState === "error" && (
              <Card className="p-5 border-border/50 bg-card/95 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {errorType === "network" ? "📡" : errorType === "ratelimit" ? "⏳" : errorType === "server" ? "🛠️" : "📷"}
                    </span>
                    <p className="font-semibold text-sm">
                      {errorType === "network" && "No connection"}
                      {errorType === "ratelimit" && "Too many requests"}
                      {errorType === "server" && "Something went wrong"}
                      {errorType === "photo" && "Couldn't identify this one"}
                    </p>
                  </div>
                  <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {errorType === "network" && "Check your internet connection and try again."}
                  {errorType === "ratelimit" && "You've hit the limit — wait a moment before trying again."}
                  {errorType === "server" && "Our servers hit a snag. Give it a moment and try again."}
                  {errorType === "photo" && "Try pointing at the subject more directly with good lighting."}
                </p>
                <button
                  onClick={dismiss}
                  className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold"
                >
                  <RotateCcw className="h-3 w-3" /> Try again
                </button>
              </Card>
            )}

            {scanState === "result" && result && (
              <>
              <Card className="border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden">
                {!result.isIdentifiable ? (
                  <div className="p-5 text-center">
                    <div className="flex justify-end mb-1">
                      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="font-semibold text-sm mb-1">No species detected</p>
                    <p className="text-xs text-muted-foreground">{result.notIdentifiableReason}</p>
                    <button onClick={dismiss} className="mt-3 text-xs text-primary font-semibold">Try again</button>
                  </div>
                ) : (
                  <>
                    {capturedImage && (
                      <div className="relative h-36 w-full">
                        <Image src={capturedImage} alt={result.commonName} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                        <button
                          onClick={dismiss}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h2 className="text-lg font-bold leading-tight">{result.commonName}</h2>
                          <p className="text-xs text-muted-foreground italic">{result.scientificName}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={result.conservationStatus} />
                        <span className="text-xs text-muted-foreground">
                          <motion.span key={result.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {displayConfidence}%
                          </motion.span>
                          {" "}confidence
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{result.description}</p>
                      <div className="flex gap-2">
                        <Link
                          href={`/species/${result.id}?data=${encodeURIComponent(JSON.stringify(result))}`}
                          className="flex-1 text-center rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-secondary transition-colors"
                        >
                          Full Profile
                        </Link>
                        <button
                          onClick={handleCollect}
                          disabled={collected}
                          className={`flex-1 flex flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition-colors ${
                            collected
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {collected ? (
                            <>
                              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Collected</span>
                              {collectedDate && <span className="text-[10px] font-normal opacity-70 mt-0.5">{collectedDate}</span>}
                            </>
                          ) : (
                            <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add to Field Guide</span>
                          )}
                        </button>
                      </div>
                      <motion.button
                        onClick={handleShare}
                        disabled={shareState === "sharing"}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold border transition-colors ${
                          shareState === "copied"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {shareState === "sharing" ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating link…</>
                        ) : shareState === "copied" ? (
                          <><Copy className="h-3.5 w-3.5" /> Link copied!</>
                        ) : (
                          <><Share2 className="h-3.5 w-3.5" /> Share this discovery</>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </Card>

              {/* Model predictions */}
              {predictResult && (
                <Card className="mt-3 p-4 border-border/50 bg-card/95 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Model Predictions</p>
                  <div className="space-y-1.5">
                    {Object.entries(predictResult).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted-foreground truncate">{key}</span>
                        <span className="font-semibold shrink-0">
                          {typeof val === "number"
                            ? `${(val * 100).toFixed(1)}%`
                            : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
