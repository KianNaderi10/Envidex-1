"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, Loader2, RotateCcw, Plus, Check, Share2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useEnvidexStore } from "@/lib/store";
import type { ConservationStatus } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

type ScanState = "idle" | "preview" | "scanning" | "result" | "error";

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

export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [shareState, setShareState] = useState<"idle" | "sharing" | "copied">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCollection, isCollected, incrementShareCount } = useEnvidexStore();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setImageData(data);
      setScanState("preview");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleIdentify = async () => {
    if (!imageData) return;
    setScanState("scanning");
    setError(null);

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });

      if (!res.ok) throw new Error("Identification failed");
      const data: IdentifyResult = await res.json();
      setResult(data);
      setScanState("result");
    } catch {
      setError("Could not identify the species. Please try a clearer photo.");
      setScanState("error");
    }
  };

  const reset = () => {
    setScanState("idle");
    setImageData(null);
    setResult(null);
    setError(null);
  };

  const collected = result ? isCollected(result.id) : false;

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

  const handleShare = async () => {
    if (!result || !imageData || shareState === "sharing") return;
    setShareState("sharing");
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, speciesData: result }),
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
      // share cancelled or failed — reset silently
    }
    setShareState("idle");
  };

  const handleCollect = () => {
    if (!result || collected) return;
    addToCollection({ speciesId: result.id, discoveredAt: new Date().toISOString() });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4ade80", "#22c55e", "#16a34a", "#bbf7d0", "#ffffff"],
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <h1 className="text-2xl font-bold">Identify Species</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Take or upload a photo to discover what you&apos;ve found
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE — upload zone */}
        {scanState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 flex-1"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* Drop zone */}
            <motion.div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-64"
              animate={{ boxShadow: ["0 0 0 0px oklch(0.62 0.17 155 / 0)", "0 0 16px 4px oklch(0.62 0.17 155 / 0.15)", "0 0 0 0px oklch(0.62 0.17 155 / 0)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.02, borderColor: "oklch(0.62 0.17 155 / 0.6)", backgroundColor: "oklch(0.62 0.17 155 / 0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center float-animation">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Take or upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Point your camera at any animal or plant
                </p>
              </div>
            </motion.div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold text-sm"
              >
                <Camera className="h-4 w-4" />
                Camera
              </button>
              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                    fileInputRef.current.setAttribute("capture", "environment");
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-secondary text-secondary-foreground py-3.5 font-semibold text-sm"
              >
                <Upload className="h-4 w-4" />
                Gallery
              </button>
            </div>

            {/* Tips */}
            <Card className="mt-6 p-4 bg-card/60 border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tips for best results</p>
              <ul className="space-y-1.5">
                {["Get close and fill the frame", "Ensure good lighting", "Keep the subject in focus", "Capture distinctive features"].map((tip) => (
                  <li key={tip} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}

        {/* PREVIEW — confirm image */}
        {scanState === "preview" && imageData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 flex-1 flex flex-col gap-4"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-muted">
              <Image src={imageData} alt="Species to identify" fill className="object-cover" />
              {/* Scan frame overlay */}
              <div className="absolute inset-6 border-2 border-primary/60 rounded-2xl" />
              <div className="absolute inset-6 border-t-2 border-l-2 border-primary rounded-tl-2xl w-6 h-6 top-6 left-6" />
              <div className="absolute border-t-2 border-r-2 border-primary rounded-tr-2xl w-6 h-6 top-6 right-6" />
              <div className="absolute border-b-2 border-l-2 border-primary rounded-bl-2xl w-6 h-6 bottom-6 left-6" />
              <div className="absolute border-b-2 border-r-2 border-primary rounded-br-2xl w-6 h-6 bottom-6 right-6" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-2xl bg-secondary text-secondary-foreground py-3.5 px-5 font-semibold text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
              <button
                onClick={handleIdentify}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3.5 font-semibold text-sm shadow-lg shadow-primary/25"
              >
                Identify Species
              </button>
            </div>
          </motion.div>
        )}

        {/* SCANNING — loading */}
        {scanState === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-4"
          >
            {imageData && (
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden">
                <Image src={imageData} alt="Scanning" fill className="object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1 w-32 bg-primary/80 rounded-full scan-line absolute" />
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="font-semibold text-sm">Analyzing image...</p>
              <p className="text-xs text-muted-foreground mt-1">Consulting our species database</p>
            </div>
          </motion.div>
        )}

        {/* ERROR */}
        {scanState === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="text-5xl">😕</div>
            <p className="text-center text-sm text-muted-foreground">{error}</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3 px-6 font-semibold text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </motion.div>
        )}

        {/* RESULT */}
        {scanState === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 flex-1 flex flex-col gap-4 pb-4"
          >
            {!result.isIdentifiable ? (
              <Card className="p-6 text-center border-border/50">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold text-sm mb-1">No species detected</p>
                <p className="text-xs text-muted-foreground">{result.notIdentifiableReason}</p>
                <button onClick={reset} className="mt-4 text-xs text-primary font-semibold">Try another photo</button>
              </Card>
            ) : (
              <>
                {/* Species card */}
                <div style={{ perspective: 1000 }}>
                <motion.div
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.05 }}
                >
                <Card className="border-border/50 bg-card/80 overflow-hidden">
                  {imageData && (
                    <div className="relative h-48 w-full">
                      <Image src={imageData} alt={result.commonName} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h2 className="text-xl font-bold">{result.commonName}</h2>
                        <p className="text-xs text-muted-foreground italic">{result.scientificName}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={result.conservationStatus} />
                      <span className="text-xs text-muted-foreground">
                        <motion.span
                          key={result.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {displayConfidence}%
                        </motion.span>
                        {" "}confidence
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.description}</p>
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
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                          collected
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {collected ? (
                          <><Check className="h-3.5 w-3.5" /> Collected</>
                        ) : (
                          <><Plus className="h-3.5 w-3.5" /> Add to Field Guide</>
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
                </Card>
                </motion.div>
                </div>

                {/* Fun facts */}
                {result.funFacts.length > 0 && (
                  <Card className="p-4 border-border/50 bg-card/60">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Did You Know?</p>
                    <div className="space-y-2">
                      {result.funFacts.map((fact, i) => (
                        <div key={i} className="flex gap-2.5 text-xs">
                          <span className="text-primary shrink-0 mt-0.5">★</span>
                          <span className="text-muted-foreground leading-relaxed">{fact}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-secondary text-secondary-foreground py-3.5 font-semibold text-sm"
                >
                  <Camera className="h-4 w-4" />
                  Scan Another
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
