"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CollectedEntry, Species } from "./types";

interface EnvidexStore {
  collection: CollectedEntry[];
  recentSpecies: Species[];
  addToCollection: (entry: CollectedEntry) => void;
  isCollected: (speciesId: string) => boolean;
  setRecentSpecies: (species: Species[]) => void;
}

export const useEnvidexStore = create<EnvidexStore>()(
  persist(
    (set, get) => ({
      collection: [],
      recentSpecies: [],
      addToCollection: (entry) => {
        const existing = get().collection.find((e) => e.speciesId === entry.speciesId);
        if (!existing) {
          set((state) => ({ collection: [entry, ...state.collection] }));
        }
      },
      isCollected: (speciesId) => {
        return get().collection.some((e) => e.speciesId === speciesId);
      },
      setRecentSpecies: (species) => set({ recentSpecies: species }),
    }),
    { name: "envidex-collection" }
  )
);
