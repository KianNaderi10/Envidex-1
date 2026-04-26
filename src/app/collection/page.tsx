"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useEnvidexStore } from "@/lib/store";
import { mockSpeciesDatabase, findSpeciesById } from "@/lib/mock-species";
import { isThreatened } from "@/lib/conservation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CollectionPage() {
  const { collection } = useEnvidexStore();
  const [exampleSpecies, setExampleSpecies] = useState(mockSpeciesDatabase[0]);
  const [isExampleOpen, setIsExampleOpen] = useState(false);

  const sharedCardVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.05,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  const collectedSpecies = useMemo(
    () =>
      collection
        .map((entry) => ({
          entry,
          species: findSpeciesById(entry.speciesId),
        }))
        .filter((item) => item.species !== undefined),
    [collection]
  );

  const allSpecies = mockSpeciesDatabase;
  const collectedIds = new Set(collection.map((e) => e.speciesId));
  const completionPct = Math.round((collectedIds.size / allSpecies.length) * 100);

  const openExampleProfile = (species: (typeof mockSpeciesDatabase)[number]) => {
    setExampleSpecies(species);
    setIsExampleOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-10 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Field Guide</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your personal species collection</p>
      </div>

      {/* Progress */}
      <div className="px-4 pb-4">
        <Card className="p-4 border-border/50 bg-card/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discovery Progress</span>
            <span className="text-xs font-bold text-primary">{collectedIds.size}/{allSpecies.length}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 1.5 , ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{completionPct}% complete</p>
        </Card>
      </div>

      {/* Empty state */}
      {collectedSpecies.length === 0 && (
        <div className="px-4 flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm mb-1">Nothing discovered yet</p>
            <p className="text-xs text-muted-foreground">Scan animals and plants around you to fill your Field Guide</p>
          </div>
          <Link
            href="/scan"
            className="flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3 px-6 font-semibold text-sm"
          >
            Start Scanning
          </Link>
        </div>
      )}


      {/* Collected species */}
      {collectedSpecies.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold mb-3">Discovered</h2>
          <div className="space-y-2.5">
            {collectedSpecies.map(({ species, entry }, i) => (
              <motion.div
                key={entry.speciesId}
                custom={i}
                variants={sharedCardVariants}
                initial="hidden"
                animate="show"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
              >
                <Link href={`/species/${species!.id}`}>
                  <Card className="overflow-hidden border-border/50 bg-card/60 active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3 p-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                        {species!.kingdom === "Animalia" ? "🦁" : "🌿"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{species!.commonName}</p>
                        <p className="text-[11px] text-muted-foreground italic truncate">{species!.scientificName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={species!.conservationStatus} size="sm" />
                        {isThreatened(species!.conservationStatus) && (
                          <span className="text-[9px] text-amber-400/80 font-medium">⚠ Threatened</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked / undiscovered */}
      <div className="px-4 pb-6">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Undiscovered</h2>
        <div className="grid grid-cols-3 gap-2">
          {allSpecies
            .filter((s) => !collectedIds.has(s.id))
            .map((species, i) => (
              <motion.button
                key={species.id}
                type="button"
                onClick={() => openExampleProfile(species)}
                className="aspect-square"
                aria-label="Open undiscovered example"
                custom={i}
                variants={sharedCardVariants}
                initial="hidden"
                animate="show"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
              >
                <Card className="h-full flex flex-col items-center justify-center gap-1.5 border-border/30 bg-card/30 p-2 transition-colors hover:bg-card/45 active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 text-center leading-tight">Tap to preview</span>
                </Card>
              </motion.button>
            ))}
        </div>
      </div>

      <Dialog open={isExampleOpen} onOpenChange={setIsExampleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Example {exampleSpecies.kingdom === "Plantae" ? "Plant" : "Animal"} Profile
            </DialogTitle>
            <DialogDescription>
              Undiscovered entries stay hidden. This preview shows the type of details you unlock after scanning.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                {exampleSpecies.kingdom === "Animalia" ? "🦁" : "🌿"}
              </div>
              <div>
                <p className="font-semibold text-sm">{exampleSpecies.commonName}</p>
                <p className="text-xs text-muted-foreground italic">{exampleSpecies.scientificName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Card className="p-2 bg-card/50 border-border/50">
                <p className="text-muted-foreground">Conservation</p>
                <div className="mt-1">
                  <StatusBadge status={exampleSpecies.conservationStatus} size="sm" />
                </div>
              </Card>
              <Card className="p-2 bg-card/50 border-border/50">
                <p className="text-muted-foreground">Population</p>
                <p className="font-medium mt-1">{exampleSpecies.population}</p>
              </Card>
            </div>

            <Card className="p-3 bg-card/50 border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Habitat</p>
              <p className="text-xs font-medium">{exampleSpecies.habitat.join(", ")}</p>
            </Card>

            <Card className="p-3 bg-card/50 border-border/50">
              <p className="text-xs text-muted-foreground mb-1">About</p>
              <p className="text-xs leading-relaxed">{exampleSpecies.description}</p>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
