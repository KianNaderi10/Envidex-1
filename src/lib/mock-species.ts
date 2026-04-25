import type { Species } from "./types";

export const mockSpeciesDatabase: Species[] = [
  {
    id: "amur-leopard",
    commonName: "Amur Leopard",
    scientificName: "Panthera pardus orientalis",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Temperate Forest", "Russian Far East"],
    conservationStatus: "CR",
    population: "~100 individuals",
    description:
      "The Amur leopard is the world's rarest wild cat. Adapted to cold climates with thick spotted fur, it's an apex predator of the Russian Far East forests. Its solitary nature and vast territory requirements make it especially vulnerable.",
    threats: ["Poaching", "Habitat loss", "Prey depletion", "Inbreeding"],
    howToHelp: [
      "Support WWF's Amur Leopard conservation programs",
      "Avoid purchasing fur products",
      "Raise awareness on social media",
      "Donate to anti-poaching organizations",
    ],
    funFacts: [
      "Can leap more than 6 meters horizontally",
      "Stores food in trees to keep it from other predators",
      "Each leopard has a unique spot pattern",
    ],
    range: "Russian Far East, Northeastern China",
    diet: "Deer, wild boar, small mammals",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Amur_leopard_Panthera_pardus_orientalis.jpg/640px-Amur_leopard_Panthera_pardus_orientalis.jpg",
  },
  {
    id: "vaquita",
    commonName: "Vaquita",
    scientificName: "Phocoena sinus",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Shallow Coastal Waters", "Gulf of California"],
    conservationStatus: "CR",
    population: "<10 individuals",
    description:
      "The vaquita is the world's most critically endangered marine mammal. This small porpoise is endemic to the northern Gulf of California and has been decimated by illegal gillnet fishing.",
    threats: ["Illegal fishing nets (bycatch)", "Illegal totoaba trade", "Pollution"],
    howToHelp: [
      "Support Sea Shepherd's Operation Milagro",
      "Avoid seafood caught in the Gulf of California without certification",
      "Petition for stronger fishing regulations",
      "Donate to the Vaquita CPR program",
    ],
    funFacts: [
      "Spanish for 'little cow'",
      "Smallest cetacean in the world",
      "Uses echolocation to navigate",
    ],
    range: "Northern Gulf of California, Mexico",
    diet: "Fish, squid, crustaceans",
  },
  {
    id: "sumatran-orangutan",
    commonName: "Sumatran Orangutan",
    scientificName: "Pongo abelii",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Tropical Rainforest", "Sumatra"],
    conservationStatus: "CR",
    population: "~14,000 individuals",
    description:
      "The Sumatran orangutan is one of humanity's closest relatives, sharing 96.9% of our DNA. These highly intelligent apes build elaborate nests, use tools, and have complex social cultures passed down through generations.",
    threats: ["Deforestation for palm oil", "Illegal pet trade", "Hunting"],
    howToHelp: [
      "Choose palm-oil-free or certified sustainable palm oil products",
      "Support Sumatran Orangutan Society",
      "Never buy exotic pets",
      "Reduce, reuse, recycle paper and wood products",
    ],
    funFacts: [
      "Have the longest childhood of any animal except humans",
      "Can learn sign language",
      "Name means 'person of the forest' in Malay",
    ],
    range: "Northern Sumatra, Indonesia",
    diet: "Fruit, bark, insects, bird eggs",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Orang_Utan%2C_Semenggok_Forest_Reserve%2C_Sarawak%2C_Borneo%2C_Malaysia.JPG/640px-Orang_Utan%2C_Semenggok_Forest_Reserve%2C_Sarawak%2C_Borneo%2C_Malaysia.JPG",
  },
  {
    id: "snow-leopard",
    commonName: "Snow Leopard",
    scientificName: "Panthera uncia",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Alpine Meadows", "Rocky Terrain", "Central Asia"],
    conservationStatus: "VU",
    population: "4,000–6,500 individuals",
    description:
      "The ghost of the mountains. Snow leopards are perfectly adapted to cold, rugged mountain terrain. Their pale, spotted coats provide camouflage against rocks and snow, and their long tails help them balance.",
    threats: ["Poaching", "Retaliatory killings by herders", "Climate change", "Prey depletion"],
    howToHelp: [
      "Support Snow Leopard Trust programs",
      "Buy handicrafts from Snow Leopard Enterprises cooperatives",
      "Avoid products with big cat fur or bones",
    ],
    funFacts: [
      "Cannot roar — only purr, hiss, and mew",
      "Tails are nearly as long as their bodies",
      "Can kill prey three times their size",
    ],
    range: "12 countries across Central Asia",
    diet: "Blue sheep, ibex, marmots",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Snow_leopard_Panthera_uncia.jpg/640px-Snow_leopard_Panthera_uncia.jpg",
  },
  {
    id: "blue-whale",
    commonName: "Blue Whale",
    scientificName: "Balaenoptera musculus",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Open Ocean", "All Major Oceans"],
    conservationStatus: "EN",
    population: "10,000–25,000 individuals",
    description:
      "The largest animal ever known to have lived on Earth, blue whales can reach 30 meters in length. Despite their immense size, they feed almost exclusively on tiny krill. Their haunting songs travel thousands of miles underwater.",
    threats: ["Ship strikes", "Entanglement in fishing gear", "Ocean pollution", "Climate change affecting krill"],
    howToHelp: [
      "Reduce single-use plastic consumption",
      "Support whale sanctuaries and marine protected areas",
      "Choose sustainably sourced seafood",
      "Support organizations working on shipping lane adjustments",
    ],
    funFacts: [
      "Heart is the size of a small car",
      "Tongue weighs as much as an elephant",
      "Calls can be heard 1,600 km away",
    ],
    range: "All major oceans except Arctic",
    diet: "Krill (up to 40 million per day)",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Sperm_whale_pod.jpg/640px-Sperm_whale_pod.jpg",
  },
  {
    id: "rafflesia-arnoldii",
    commonName: "Rafflesia",
    scientificName: "Rafflesia arnoldii",
    kingdom: "Plantae",
    class: "Magnoliopsida",
    habitat: ["Tropical Rainforest", "Sumatra", "Borneo"],
    conservationStatus: "CR",
    population: "Unknown — severely fragmented",
    description:
      "The largest individual flower on Earth. Rafflesia has no leaves, stems, or roots — it's a purely parasitic plant that lives inside the tissue of its host vine. It blooms for only a few days, emitting a rotting flesh odor to attract pollinators.",
    threats: ["Deforestation", "Habitat fragmentation", "Collection", "Host vine destruction"],
    howToHelp: [
      "Support Indonesian conservation NGOs",
      "Choose sustainable forest products",
      "Advocate for rainforest protection policies",
    ],
    funFacts: [
      "Flowers can weigh up to 11 kg",
      "Takes up to 9 months to develop before blooming",
      "Smells like rotting flesh to attract flies",
    ],
    range: "Sumatra and Borneo, Indonesia",
    diet: "Parasitic — feeds on host vine nutrients",
  },
  {
    id: "monarch-butterfly",
    commonName: "Monarch Butterfly",
    scientificName: "Danaus plexippus",
    kingdom: "Animalia",
    class: "Insecta",
    habitat: ["Meadows", "Fields", "Forests", "North America"],
    conservationStatus: "EN",
    population: "~1.9 billion (90% decline since 1990s)",
    description:
      "Monarchs undertake one of the most spectacular migrations in the animal kingdom — up to 4,800 km from Canada to Mexico. No single butterfly completes the round trip; it takes multiple generations.",
    threats: ["Milkweed loss from herbicide use", "Deforestation of wintering sites", "Climate change", "Pesticides"],
    howToHelp: [
      "Plant native milkweed in your garden",
      "Reduce or eliminate pesticide use",
      "Create waystation habitats",
      "Join citizen science monitoring programs like Journey North",
    ],
    funFacts: [
      "Toxic to predators due to milkweed diet",
      "Navigate using the sun and Earth's magnetic field",
      "Can fly 80–160 km per day during migration",
    ],
    range: "North America (breeding), Mexico (wintering)",
    diet: "Milkweed (larvae), flower nectar (adults)",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Monarch_Butterfly_Danaus_plexippus_Mating_Vertical_3008px.jpg/640px-Monarch_Butterfly_Danaus_plexippus_Mating_Vertical_3008px.jpg",
  },
  {
    id: "pangolin",
    commonName: "Pangolin",
    scientificName: "Manis spp.",
    kingdom: "Animalia",
    class: "Mammalia",
    habitat: ["Tropical Forest", "Grasslands", "Africa", "Asia"],
    conservationStatus: "CR",
    population: "Unknown — all 8 species threatened",
    description:
      "The most trafficked mammal in the world. Pangolins are covered in overlapping keratin scales — the only mammal with this feature. When threatened, they roll into a tight ball. They are essential for ecosystem health, consuming millions of ants and termites.",
    threats: ["Illegal wildlife trade (scales & meat)", "Habitat loss", "Hunting"],
    howToHelp: [
      "Never purchase pangolin products",
      "Report illegal wildlife trade to authorities",
      "Support Save Pangolins organization",
      "Spread awareness about their ecological importance",
    ],
    funFacts: [
      "Scales are made of the same material as human fingernails",
      "Have no teeth — grinds food in their stomachs",
      "A single pangolin can eat 70 million insects per year",
    ],
    range: "Sub-Saharan Africa and South/Southeast Asia",
    diet: "Ants, termites",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Pangolin_India.jpg/640px-Pangolin_India.jpg",
  },
];

export function findSpeciesById(id: string): Species | undefined {
  return mockSpeciesDatabase.find((s) => s.id === id);
}

export function searchSpecies(query: string): Species[] {
  const q = query.toLowerCase();
  return mockSpeciesDatabase.filter(
    (s) =>
      s.commonName.toLowerCase().includes(q) ||
      s.scientificName.toLowerCase().includes(q) ||
      s.conservationStatus.toLowerCase().includes(q)
  );
}
