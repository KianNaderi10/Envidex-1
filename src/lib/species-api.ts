import type { ConservationStatus } from "./types";

export type SpeciesRecord = {
  id: string;
  commonName: string;
  scientificName: string;
  kingdom: string;
  conservationStatus: ConservationStatus;
  population: string;
  habitat: string[];
  description: string;
  donationLink?: string | null;
  confidence?: number | null;
  detectedAt?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_ANIMAL_API_URL || "http://127.0.0.1:8000";

export async function fetchSpeciesDatabase(): Promise<SpeciesRecord[]> {
  const res = await fetch(`${API_BASE}/api/species`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch species database");
  }

  return res.json();
}

export async function fetchLatestSpecies(): Promise<SpeciesRecord> {
  const res = await fetch(`${API_BASE}/api/species/latest`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch latest species");
  }

  return res.json();
}

export function findSpeciesById(species: SpeciesRecord[], id: string) {
  return species.find((item) => item.id === id);
}