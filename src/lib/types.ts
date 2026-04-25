export type ConservationStatus =
  | "EX"   // Extinct
  | "EW"   // Extinct in the Wild
  | "CR"   // Critically Endangered
  | "EN"   // Endangered
  | "VU"   // Vulnerable
  | "NT"   // Near Threatened
  | "LC"   // Least Concern
  | "DD"   // Data Deficient
  | "NE";  // Not Evaluated

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  kingdom: "Animalia" | "Plantae" | "Fungi" | "Other";
  class: string;
  habitat: string[];
  conservationStatus: ConservationStatus;
  population: string;
  description: string;
  threats: string[];
  howToHelp: string[];
  funFacts: string[];
  imageUrl?: string;
  range: string;
  diet?: string;
  discoveredYear?: number;
}

export interface CollectedEntry {
  speciesId: string;
  discoveredAt: string;
  location?: string;
  imageData?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  totalCollected: number;
  badges: Badge[];
  joinedAt: string;
  streak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  locked: boolean;
}

export type ScanResult = {
  species: Species;
  confidence: number;
  alternativeMatches?: { commonName: string; confidence: number }[];
};
