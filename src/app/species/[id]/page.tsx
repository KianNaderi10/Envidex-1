"use client";

import { use } from "react";
import { ArrowLeft, Plus, Check, Heart, AlertTriangle, Leaf, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useEnvidexStore } from "@/lib/store";
import { findSpeciesById } from "@/lib/mock-species";
import { isThreatened } from "@/lib/conservation";
import type { Species } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SpeciesDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCollection, isCollected } = useEnvidexStore();

  const dataParam = searchParams.get("data");
  const dynamicSpecies: Species | null = dataParam
    ? JSON.parse(decodeURIComponent(dataParam))
    : null;

  const species: Species | undefined = dynamicSpecies ?? findSpeciesById(id);

  if (!species) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="text-5xl">🔍</div>
        <p className="font-semibold text-sm">Species not found</p>
        <Link href="/" className="text-xs text-primary">Go home</Link>
      </div>
    );
  }

  const collected = isCollected(species.id);

  const handleCollect = () => {
    addToCollection({
      speciesId: species.id,
      discoveredAt: new Date().toISOString(),
    });
  };

  const threatened = isThreatened(species.conservationStatus);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero image / gradient header */}
      <div className="relative h-64 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
        {species.imageUrl ? (
          <Image
            src={species.imageUrl}
            alt={species.commonName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-30">
              {species.kingdom === "Animalia" ? "🦁" : "🌿"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-10 left-4 h-9 w-9 rounded-full bg-background/60 backdrop-blur-md border border-border/50 flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 -mt-8 relative flex flex-col gap-4 pb-8">
        {/* Title card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-border/50 bg-card/90 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl font-bold leading-tight">{species.commonName}</h1>
                <p className="text-xs text-muted-foreground italic mt-0.5">{species.scientificName}</p>
              </div>
              <StatusBadge status={species.conservationStatus} />
            </div>

            {threatened && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-3">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-400/90 leading-tight">
                  This species faces a significant threat of extinction without conservation action.
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">{species.description}</p>

            <button
              onClick={handleCollect}
              disabled={collected}
              className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                collected
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              }`}
            >
              {collected ? (
                <>
                  <Check className="h-4 w-4" />
                  In Your Field Guide
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Field Guide
                </>
              )}
            </button>
          </Card>
        </motion.div>

        {/* Quick facts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Quick Facts</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Kingdom", value: species.kingdom },
                { label: "Class", value: species.class },
                { label: "Population", value: species.population },
                { label: "Range", value: species.range },
                ...(species.diet ? [{ label: "Diet", value: species.diet }] : []),
              ].map((fact) => (
                <div key={fact.label} className="bg-muted/30 rounded-xl p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{fact.label}</p>
                  <p className="text-xs font-medium leading-tight">{fact.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Habitat */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-4 border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Habitat</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {species.habitat.map((h) => (
                <span
                  key={h}
                  className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary"
                >
                  {h}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Threats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4 border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold">Major Threats</h2>
            </div>
            <ul className="space-y-2">
              {species.threats.map((threat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60 shrink-0 mt-1.5" />
                  {threat}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* How to help */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-4 border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">How You Can Help</h2>
            </div>
            <ul className="space-y-2.5">
              {species.howToHelp.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
                  <span className="h-5 w-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-foreground/80 pt-0.5">{action}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Fun facts */}
        {species.funFacts && species.funFacts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-4 border-border/50 bg-card/60">
              <h2 className="text-sm font-semibold mb-3">✨ Did You Know?</h2>
              <div className="space-y-3">
                {species.funFacts.map((fact, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-primary shrink-0 font-bold">★</span>
                    <span className="text-muted-foreground leading-relaxed">{fact}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SpeciesDetailContent id={id} />;
}
