"use client";

import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Award, Flame, Leaf, Star, Shield, Settings, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useEnvidexStore } from "@/lib/store";

import { mockSpeciesDatabase } from "@/lib/mock-species";
import { isThreatened } from "@/lib/conservation";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface BadgeStats {
  speciesFound: number;
  endangeredFound: number;
  plantsFound: number;
  shareCount: number;
  criticallyEndangered: number;
  ddFound: number;
  uniqueStatusCount: number;
  uniqueDays: number;
  maxConsecutiveDays: number;
  mammalsFound: number;
  nocturnalFound: number;
  uniqueKingdoms: number;
  insectsFound: number;
  primatesFound: number;
  ghostSpeciesFound: number;
  ewFound: number;
  maxSpeciesInOneDay: number;
  lcFound: number;
  uniqueHabitats: number;
  hadLongBreak: boolean;
  currentStreak: number;
  rarityScore: number;
  earnedBadgeCount: number;
}

type Badge = { id: string; name: string; description: string; icon: string; requirement: (s: BadgeStats) => boolean; progress?: (s: BadgeStats) => { current: number; total: number } };

const BADGES: Badge[] = [
  {
    id: "first-scan",
    name: "First Discovery",
    description: "Identify your first species",
    icon: "🔭",
    requirement: (s) => s.speciesFound >= 1,
    progress: (s) => ({ current: Math.min(s.speciesFound, 1), total: 1 }),
  },
  {
    id: "conservationist",
    name: "Conservationist",
    description: "Discover 3 endangered species",
    icon: "🌿",
    requirement: (s) => s.endangeredFound >= 3,
    progress: (s) => ({ current: s.endangeredFound, total: 3 }),
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Collect 5 different species",
    icon: "🗺️",
    requirement: (s) => s.speciesFound >= 5,
    progress: (s) => ({ current: s.speciesFound, total: 5 }),
  },
  {
    id: "naturalist",
    name: "Naturalist",
    description: "Collect 10 different species",
    icon: "🧭",
    requirement: (s) => s.speciesFound >= 10,
    progress: (s) => ({ current: s.speciesFound, total: 10 }),
  },
  {
    id: "field-expert",
    name: "Field Expert",
    description: "Collect 20 different species",
    icon: "🎖️",
    requirement: (s) => s.speciesFound >= 20,
    progress: (s) => ({ current: s.speciesFound, total: 20 }),
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Collect 30 different species",
    icon: "🌟",
    requirement: (s) => s.speciesFound >= 30,
    progress: (s) => ({ current: s.speciesFound, total: 30 }),
  },
  {
    id: "legend",
    name: "Legend",
    description: "Collect 50 different species",
    icon: "👑",
    requirement: (s) => s.speciesFound >= 50,
    progress: (s) => ({ current: s.speciesFound, total: 50 }),
  },
  {
    id: "halfway-there",
    name: "Halfway There",
    description: "Collect half the species database",
    icon: "⚡",
    requirement: (s) => s.speciesFound >= Math.ceil(mockSpeciesDatabase.length / 2),
    progress: (s) => ({ current: s.speciesFound, total: Math.ceil(mockSpeciesDatabase.length / 2) }),
  },
  {
    id: "champion",
    name: "Champion",
    description: "Collect all species in the database",
    icon: "🏆",
    requirement: (s) => s.speciesFound >= mockSpeciesDatabase.length,
    progress: (s) => ({ current: s.speciesFound, total: mockSpeciesDatabase.length }),
  },
  {
    id: "botanist",
    name: "Botanist",
    description: "Discover a plant species",
    icon: "🌱",
    requirement: (s) => s.plantsFound >= 1,
    progress: (s) => ({ current: Math.min(s.plantsFound, 1), total: 1 }),
  },
  {
    id: "guardian",
    name: "Guardian",
    description: "Discover 5 threatened species",
    icon: "🛡️",
    requirement: (s) => s.endangeredFound >= 5,
    progress: (s) => ({ current: s.endangeredFound, total: 5 }),
  },
  {
    id: "rare-find",
    name: "Rare Find",
    description: "Discover a critically endangered species",
    icon: "💎",
    requirement: (s) => s.criticallyEndangered >= 1,
    progress: (s) => ({ current: Math.min(s.criticallyEndangered, 1), total: 1 }),
  },
  {
    id: "critically-aware",
    name: "Critically Aware",
    description: "Discover 5 critically endangered species",
    icon: "🚨",
    requirement: (s) => s.criticallyEndangered >= 5,
    progress: (s) => ({ current: s.criticallyEndangered, total: 5 }),
  },
  {
    id: "data-hunter",
    name: "Data Hunter",
    description: "Discover a data deficient species",
    icon: "🔍",
    requirement: (s) => s.ddFound >= 1,
    progress: (s) => ({ current: Math.min(s.ddFound, 1), total: 1 }),
  },
  {
    id: "common-ground",
    name: "Common Ground",
    description: "Discover a Least Concern species",
    icon: "🟢",
    requirement: (s) => s.lcFound >= 1,
    progress: (s) => ({ current: Math.min(s.lcFound, 1), total: 1 }),
  },
  {
    id: "red-lister",
    name: "Red Lister",
    description: "Discover species across 3 conservation statuses",
    icon: "📋",
    requirement: (s) => s.uniqueStatusCount >= 3,
    progress: (s) => ({ current: s.uniqueStatusCount, total: 3 }),
  },
  {
    id: "status-sweep",
    name: "Status Sweep",
    description: "Discover species across 5 conservation statuses",
    icon: "🎯",
    requirement: (s) => s.uniqueStatusCount >= 5,
    progress: (s) => ({ current: s.uniqueStatusCount, total: 5 }),
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Collect species on 3 different days",
    icon: "📅",
    requirement: (s) => s.uniqueDays >= 3,
    progress: (s) => ({ current: s.uniqueDays, total: 3 }),
  },
  {
    id: "weekly-explorer",
    name: "Weekly Explorer",
    description: "Collect species 7 days in a row",
    icon: "🗓️",
    requirement: (s) => s.maxConsecutiveDays >= 7,
    progress: (s) => ({ current: s.maxConsecutiveDays, total: 7 }),
  },
  {
    id: "month-long",
    name: "Month Long",
    description: "Collect species across 30 different days",
    icon: "📆",
    requirement: (s) => s.uniqueDays >= 30,
    progress: (s) => ({ current: s.uniqueDays, total: 30 }),
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Collect 3 species in a single day",
    icon: "🎲",
    requirement: (s) => s.maxSpeciesInOneDay >= 3,
    progress: (s) => ({ current: s.maxSpeciesInOneDay, total: 3 }),
  },
  {
    id: "speed-runner",
    name: "Speed Runner",
    description: "Collect 5 species in a single day",
    icon: "⚡",
    requirement: (s) => s.maxSpeciesInOneDay >= 5,
    progress: (s) => ({ current: s.maxSpeciesInOneDay, total: 5 }),
  },
  {
    id: "mammalogist",
    name: "Mammalogist",
    description: "Discover 5 mammal species",
    icon: "🦁",
    requirement: (s) => s.mammalsFound >= 5,
    progress: (s) => ({ current: s.mammalsFound, total: 5 }),
  },
  {
    id: "primatologist",
    name: "Primatologist",
    description: "Discover 3 primate species",
    icon: "🐒",
    requirement: (s) => s.primatesFound >= 3,
    progress: (s) => ({ current: s.primatesFound, total: 3 }),
  },
  {
    id: "insectivore",
    name: "Insectivore",
    description: "Discover 3 insect species",
    icon: "🐛",
    requirement: (s) => s.insectsFound >= 3,
    progress: (s) => ({ current: s.insectsFound, total: 3 }),
  },
  {
    id: "night-watch",
    name: "Night Watch",
    description: "Discover a nocturnal species",
    icon: "🦇",
    requirement: (s) => s.nocturnalFound >= 1,
    progress: (s) => ({ current: Math.min(s.nocturnalFound, 1), total: 1 }),
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Discover species from 3 different kingdoms",
    icon: "✅",
    requirement: (s) => s.uniqueKingdoms >= 3,
    progress: (s) => ({ current: s.uniqueKingdoms, total: 3 }),
  },
  {
    id: "ghost-species",
    name: "Ghost Species",
    description: "Discover a species with fewer than 100 individuals",
    icon: "👻",
    requirement: (s) => s.ghostSpeciesFound >= 1,
    progress: (s) => ({ current: Math.min(s.ghostSpeciesFound, 1), total: 1 }),
  },
  {
    id: "last-of-its-kind",
    name: "Last of its Kind",
    description: "Discover an Extinct in the Wild species",
    icon: "💀",
    requirement: (s) => s.ewFound >= 1,
    progress: (s) => ({ current: Math.min(s.ewFound, 1), total: 1 }),
  },
  {
    id: "broadcaster",
    name: "Broadcaster",
    description: "Share your first discovery",
    icon: "📡",
    requirement: (s) => s.shareCount >= 1,
    progress: (s) => ({ current: Math.min(s.shareCount, 1), total: 1 }),
  },
  {
    id: "advocate",
    name: "Advocate",
    description: "Share 3 discoveries",
    icon: "📣",
    requirement: (s) => s.shareCount >= 3,
    progress: (s) => ({ current: s.shareCount, total: 3 }),
  },
  {
    id: "ambassador",
    name: "Ambassador",
    description: "Share 5 discoveries",
    icon: "🤝",
    requirement: (s) => s.shareCount >= 5,
    progress: (s) => ({ current: s.shareCount, total: 5 }),
  },
  {
    id: "viral",
    name: "Viral",
    description: "Share 10 discoveries",
    icon: "📢",
    requirement: (s) => s.shareCount >= 10,
    progress: (s) => ({ current: s.shareCount, total: 10 }),
  },
  {
    id: "gone-viral",
    name: "Gone Viral",
    description: "Share 25 discoveries",
    icon: "🌐",
    requirement: (s) => s.shareCount >= 25,
    progress: (s) => ({ current: s.shareCount, total: 25 }),
  },
  {
    id: "ecologist",
    name: "Ecologist",
    description: "Discover species from 3 different habitats",
    icon: "🌍",
    requirement: (s) => s.uniqueHabitats >= 3,
    progress: (s) => ({ current: s.uniqueHabitats, total: 3 }),
  },
  {
    id: "consistent",
    name: "Consistent",
    description: "Collect species on 5 different days",
    icon: "✔️",
    requirement: (s) => s.uniqueDays >= 5,
    progress: (s) => ({ current: s.uniqueDays, total: 5 }),
  },
  {
    id: "photogenic",
    name: "Photogenic",
    description: "Build a gallery of 5 species and share one",
    icon: "📸",
    requirement: (s) => s.speciesFound >= 5 && s.shareCount >= 1,
    progress: (s) => ({ current: Math.min(s.speciesFound, 5), total: 5 }),
  },
  {
    id: "return-explorer",
    name: "Return Explorer",
    description: "Come back after a 7-day break",
    icon: "🔄",
    requirement: (s) => s.hadLongBreak,
    progress: (s) => ({ current: s.hadLongBreak ? 1 : 0, total: 1 }),
  },
];

const META_BADGES: Badge[] = [
  {
    id: "rising-star",
    name: "Rising Star",
    description: "Earn 5 badges",
    icon: "⭐",
    requirement: (s) => s.earnedBadgeCount >= 5,
    progress: (s) => ({ current: s.earnedBadgeCount, total: 5 }),
  },
  {
    id: "badge-hunter",
    name: "Badge Hunter",
    description: "Earn 10 badges",
    icon: "🏅",
    requirement: (s) => s.earnedBadgeCount >= 10,
    progress: (s) => ({ current: s.earnedBadgeCount, total: 10 }),
  },
  {
    id: "overachiever",
    name: "Overachiever",
    description: "Earn 20 badges",
    icon: "🎯",
    requirement: (s) => s.earnedBadgeCount >= 20,
    progress: (s) => ({ current: s.earnedBadgeCount, total: 20 }),
  },
];

const RARITY_POINTS: Partial<Record<string, number>> = { EW: 6, CR: 5, EN: 4, VU: 3, NT: 2, LC: 1, DD: 1 };

const HABITAT_CATEGORIES = [
  { key: "Forest",    label: "Forest",    icon: "🌳", keywords: ["forest", "rainforest", "woodland", "jungle", "taiga"] },
  { key: "Aquatic",   label: "Aquatic",   icon: "🌊", keywords: ["ocean", "coastal", "marine", "water", "sea", "river", "lake", "wetland"] },
  { key: "Grassland", label: "Grassland", icon: "🌾", keywords: ["grassland", "meadow", "field", "savanna", "prairie", "steppe", "plains"] },
  { key: "Mountain",  label: "Mountain",  icon: "🏔️", keywords: ["alpine", "mountain", "highland", "rocky", "terrain", "hill"] },
  { key: "Arid",      label: "Arid",      icon: "🏜️", keywords: ["desert", "arid", "scrub", "shrub"] },
];

const STATUS_CONFIG = [
  { status: "EW", color: "bg-purple-500", dot: "bg-purple-500", label: "EW" },
  { status: "CR", color: "bg-red-500",    dot: "bg-red-500",    label: "CR" },
  { status: "EN", color: "bg-orange-500", dot: "bg-orange-500", label: "EN" },
  { status: "VU", color: "bg-amber-500",  dot: "bg-amber-500",  label: "VU" },
  { status: "NT", color: "bg-yellow-500", dot: "bg-yellow-500", label: "NT" },
  { status: "LC", color: "bg-green-500",  dot: "bg-green-500",  label: "LC" },
  { status: "DD", color: "bg-slate-400",  dot: "bg-slate-400",  label: "DD" },
];

function BadgeCard({ badge, index, stats }: { badge: Badge & { earned: boolean }; index: number; stats: BadgeStats }) {
  const controls = useAnimationControls();
  const prog = !badge.earned && badge.progress ? badge.progress(stats) : null;
  const pct = prog ? Math.min((prog.current / prog.total) * 100, 100) : 0;

  const handleTap = () => {
    if (badge.earned) return;
    controls.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
    >
      <motion.div animate={controls} onTap={handleTap} style={{ cursor: badge.earned ? "default" : "pointer" }}>
        <Card
          className={`relative overflow-hidden p-4 border-border/50 transition-all ${
            badge.earned ? "bg-primary/10 border-primary/30" : "bg-card/30"
          }`}
        >
          {badge.earned && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-100%" }}
              animate={{ x: "250%" }}
              transition={{ delay: index * 0.06 + 0.4, duration: 0.7, ease: "easeInOut" }}
              style={{ background: "linear-gradient(105deg, transparent 35%, oklch(0.85 0.16 85 / 0.45) 50%, transparent 65%)" }}
            />
          )}
          <div className="flex items-start gap-3">
            <span className={`text-2xl ${!badge.earned ? "grayscale opacity-50" : ""}`}>{badge.icon}</span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold text-xs leading-tight ${!badge.earned ? "opacity-60" : ""}`}>{badge.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
              {badge.earned ? (
                <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                  <Star className="h-2.5 w-2.5" /> Earned
                </span>
              ) : prog ? (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-muted-foreground/70">{prog.current}/{prog.total}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.06 + 0.1 }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { collection, avatarEmoji, shareCount } = useEnvidexStore();

  const displayName = useMemo(() => {
    return session?.user?.name?.trim() || "Explorer";
  }, [session?.user?.name]);

  const stats = useMemo((): BadgeStats => {
    const speciesFound = collection.length;

    const collectedSpecies = collection.map((e) => mockSpeciesDatabase.find((sp) => sp.id === e.speciesId)).filter(Boolean);

    const endangeredFound = collectedSpecies.filter((s) => s && isThreatened(s.conservationStatus)).length;
    const plantsFound = collectedSpecies.filter((s) => s?.kingdom === "Plantae").length;
    const criticallyEndangered = collectedSpecies.filter((s) => s?.conservationStatus === "CR").length;
    const ddFound = collectedSpecies.filter((s) => s?.conservationStatus === "DD").length;
    const uniqueStatusCount = new Set(collectedSpecies.map((s) => s?.conservationStatus)).size;
    const mammalsFound = collectedSpecies.filter((s) => s?.class === "Mammalia").length;
    const nocturnalFound = collectedSpecies.filter((s) =>
      s?.class === "Chiroptera" ||
      s?.commonName?.toLowerCase().includes("owl") ||
      s?.commonName?.toLowerCase().includes("bat") ||
      s?.description?.toLowerCase().includes("nocturnal")
    ).length;
    const uniqueKingdoms = new Set(collectedSpecies.map((s) => s?.kingdom)).size;
    const insectsFound = collectedSpecies.filter((s) => s?.class === "Insecta").length;

    const PRIMATE_KEYWORDS = ["orangutan", "gorilla", "chimpanzee", "monkey", "lemur", "gibbon", "baboon", "macaque", "marmoset", "aye-aye", "bonobo", "primate"];
    const primatesFound = collectedSpecies.filter((s) =>
      PRIMATE_KEYWORDS.some((k) => s?.commonName?.toLowerCase().includes(k) || s?.description?.toLowerCase().includes("primate"))
    ).length;

    const ghostSpeciesFound = collectedSpecies.filter((s) => {
      if (!s?.population) return false;
      const match = s.population.replace(/,/g, "").match(/\d+/);
      return match ? parseInt(match[0], 10) < 100 : false;
    }).length;

    const ewFound = collectedSpecies.filter((s) => s?.conservationStatus === "EW").length;
    const lcFound = collectedSpecies.filter((s) => s?.conservationStatus === "LC").length;
    const uniqueHabitats = new Set(collectedSpecies.flatMap((s) => s?.habitat ?? [])).size;

    const speciesPerDay = collection.reduce<Record<string, number>>((acc, e) => {
      const day = new Date(e.discoveredAt).toISOString().split("T")[0];
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});
    const maxSpeciesInOneDay = Object.values(speciesPerDay).reduce((max, n) => Math.max(max, n), 0);

    // Streak calculations using discoveredAt timestamps
    const uniqueDates = [...new Set(
      collection.map((e) => new Date(e.discoveredAt).toISOString().split("T")[0])
    )].sort();

    const uniqueDays = uniqueDates.length;

    let maxConsecutiveDays = uniqueDays > 0 ? 1 : 0;
    let currentRun = 1;
    let hadLongBreak = false;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]).getTime();
      const curr = new Date(uniqueDates[i]).getTime();
      const diffDays = (curr - prev) / 86400000;
      if (diffDays === 1) {
        currentRun++;
        if (currentRun > maxConsecutiveDays) maxConsecutiveDays = currentRun;
      } else {
        currentRun = 1;
      }
      if (diffDays >= 7) hadLongBreak = true;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const datesDesc = [...uniqueDates].reverse();
    let currentStreak = 0;
    if (datesDesc.length > 0 && (datesDesc[0] === todayStr || datesDesc[0] === yesterdayStr)) {
      currentStreak = 1;
      for (let i = 1; i < datesDesc.length; i++) {
        const diffDays = (new Date(datesDesc[i - 1]).getTime() - new Date(datesDesc[i]).getTime()) / 86400000;
        if (diffDays === 1) { currentStreak++; } else { break; }
      }
    }

    const rarityScore = collectedSpecies.reduce((sum, s) => sum + (RARITY_POINTS[s?.conservationStatus ?? ""] ?? 0), 0);

    return { speciesFound, endangeredFound, plantsFound, shareCount, criticallyEndangered, ddFound, uniqueStatusCount, uniqueDays, maxConsecutiveDays, mammalsFound, nocturnalFound, uniqueKingdoms, insectsFound, primatesFound, ghostSpeciesFound, ewFound, maxSpeciesInOneDay, lcFound, uniqueHabitats, hadLongBreak, currentStreak, rarityScore, earnedBadgeCount: 0 };
  }, [collection, shareCount]);

  const baseBadges = BADGES.map((badge) => ({
    ...badge,
    earned: badge.requirement(stats),
  }));
  const earnedBadgeCount = baseBadges.filter((b) => b.earned).length;
  const statsWithMeta = { ...stats, earnedBadgeCount };
  const metaBadges = META_BADGES.map((badge) => ({
    ...badge,
    earned: badge.requirement(statsWithMeta),
  }));
  const badges = [...baseBadges, ...metaBadges];

  const earnedCount = badges.filter((b) => b.earned).length;
  const level = Math.floor(stats.speciesFound / 2) + 1;
  const xpForNext = (level * 2) - stats.speciesFound;

  const last7Days = useMemo(() => {
    const activeDays = new Set(
      collection.map((e) => new Date(e.discoveredAt).toISOString().split("T")[0])
    );
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      return { dateStr, active: activeDays.has(dateStr), label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2) };
    });
  }, [collection]);

  const conservationBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    collection.forEach((e) => {
      const sp = mockSpeciesDatabase.find((s) => s.id === e.speciesId);
      if (sp) counts[sp.conservationStatus] = (counts[sp.conservationStatus] ?? 0) + 1;
    });
    return STATUS_CONFIG.map((c) => ({ ...c, count: counts[c.status] ?? 0 })).filter((c) => c.count > 0);
  }, [collection]);

  const habitatBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    collection.forEach((e) => {
      const sp = mockSpeciesDatabase.find((s) => s.id === e.speciesId);
      if (!sp) return;
      sp.habitat.forEach((h) => {
        const lower = h.toLowerCase();
        HABITAT_CATEGORIES.forEach((cat) => {
          if (cat.keywords.some((k) => lower.includes(k))) {
            counts[cat.key] = (counts[cat.key] ?? 0) + 1;
          }
        });
      });
    });
    return HABITAT_CATEGORIES.map((cat) => ({ ...cat, count: counts[cat.key] ?? 0 }));
  }, [collection]);

  const [showAllBadges, setShowAllBadges] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(1);
  useEffect(() => {
    let current = 1;
    const timer = setInterval(() => {
      current = Math.min(current + 1, level);
      setDisplayLevel(current);
      if (current >= level) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, [level]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative px-4 pt-10 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.35_0.12_155/0.25),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <Link href="/settings" className="absolute top-0 right-0 h-9 w-9 rounded-full border border-border/60 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
          </Link>
          <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
            {avatarEmoji ? (
              <span className="text-4xl">{avatarEmoji}</span>
            ) : session?.user?.image ? (
              <img src={session.user.image} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-primary">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {displayName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Level <motion.span key={level} animate={{ opacity: [0, 1] }} transition={{ duration: 0.2 }}>{displayLevel}</motion.span> Explorer</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">Active</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative mt-5">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>Level {displayLevel}</span>
            <span>{xpForNext} discoveries to level {level + 1}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((stats.speciesFound % 2) / 2) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 pb-5">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Discovered", value: stats.speciesFound, icon: Leaf, color: "text-primary" },
            { label: "Endangered", value: stats.endangeredFound, icon: Shield, color: "text-amber-400" },
            { label: "Badges", value: earnedCount, icon: Star, color: "text-yellow-400" },
            { label: "Rarity Score", value: stats.rarityScore, icon: Zap, color: "text-purple-400" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-card/60 border-border/50 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Collection preview */}
      {collection.length > 0 && (
        <div className="pb-5">
          <div className="flex items-baseline justify-between px-4 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">Recent discoveries</p>
            <Link href="/collection" className="text-[11px] text-primary font-medium">See all →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {collection.slice(0, 6).map((entry, i) => {
              const sp = mockSpeciesDatabase.find((s) => s.id === entry.speciesId);
              if (!sp) return null;
              return (
                <motion.div
                  key={entry.speciesId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="shrink-0"
                >
                  <Link href={`/species/${sp.id}`}>
                    <div className="w-24 rounded-2xl border border-border/40 bg-card/60 p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                        {sp.kingdom === "Animalia" ? "🦁" : "🌿"}
                      </div>
                      <p className="text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full">{sp.commonName}</p>
                      <StatusBadge status={sp.conservationStatus} size="sm" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conservation breakdown */}
      {conservationBreakdown.length > 0 && (
        <div className="px-4 pb-5">
          <Card className="p-4 border-border/50 bg-card/60">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">Collection breakdown</p>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-3">
              {conservationBreakdown.map((c) => (
                <div
                  key={c.status}
                  className={`h-full ${c.color} transition-all duration-700`}
                  style={{ flex: c.count }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {conservationBreakdown.map((c) => (
                <div key={c.status} className="flex items-center gap-1.5 text-[11px]">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-semibold">{c.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Habitat explorer */}
      {collection.length > 0 && (
        <div className="px-4 pb-5">
          <Card className="p-4 border-border/50 bg-card/60">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">Habitats explored</p>
            <div className="flex flex-wrap gap-2">
              {habitatBreakdown.map((cat) => (
                <div
                  key={cat.key}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors ${
                    cat.count > 0
                      ? "border-primary/30 bg-primary/10"
                      : "border-border/30 bg-card/30 opacity-40"
                  }`}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className={`text-[11px] font-semibold leading-none ${cat.count === 0 ? "text-muted-foreground" : ""}`}>{cat.label}</span>
                  {cat.count > 0 && (
                    <span className="text-[10px] text-muted-foreground leading-none">×{cat.count}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Streak card */}
      <div className="px-4 pb-5">
        <Card className="p-4 border-border/50 bg-card/60 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.65_0.18_35/0.10),transparent_70%)]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold">Activity Streak</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Best: {stats.maxConsecutiveDays}d</span>
            </div>
            <div className="flex items-end gap-1 mb-4">
              <motion.span
                key={stats.currentStreak}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tabular-nums"
              >
                {stats.currentStreak}
              </motion.span>
              <span className="text-sm text-muted-foreground mb-1.5 ml-1">
                {stats.currentStreak === 1 ? "day streak" : "day streak"}
              </span>
              {stats.currentStreak === 0 && (
                <span className="text-[10px] text-muted-foreground mb-1.5 ml-1">— start one today</span>
              )}
            </div>
            <div className="flex gap-1.5 justify-between">
              {last7Days.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center gap-1.5 flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`h-7 w-full rounded-lg ${
                      day.active
                        ? "bg-orange-400/90 shadow-sm shadow-orange-400/30"
                        : "bg-muted/60"
                    }`}
                  />
                  <span className="text-[9px] text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Badges */}
      <div className="px-4 pb-8 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Badges</h2>
          <span className="text-xs text-muted-foreground ml-auto">{earnedCount}/{badges.length} earned</span>
        </div>

        {/* Unlocked */}
        {earnedCount > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70 mb-2.5">Unlocked</p>
            <div className="grid grid-cols-2 gap-2.5">
              {badges.filter((b) => b.earned).map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} stats={statsWithMeta} />
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {badges.filter((b) => !b.earned).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2.5">Locked</p>
            <div className="grid grid-cols-2 gap-2.5">
              {badges.filter((b) => !b.earned).slice(0, 6).map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} stats={statsWithMeta} />
              ))}
            </div>

            <AnimatePresence>
              {showAllBadges && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    {badges.filter((b) => !b.earned).slice(6).map((badge, i) => (
                      <BadgeCard key={badge.id} badge={badge} index={i + 6} stats={statsWithMeta} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {badges.filter((b) => !b.earned).length > 6 && (
              <motion.button
                type="button"
                onClick={() => setShowAllBadges((v) => !v)}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-3 py-2.5 rounded-2xl border border-border/40 bg-card/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAllBadges ? "Show less" : `Show ${badges.filter((b) => !b.earned).length - 6} more locked badges`}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Mission statement */}
      <div className="px-4 pb-8">
        <Card className="p-4 border-border/50 bg-gradient-to-br from-card to-primary/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="font-semibold text-sm mb-1">Your Impact</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Every species you discover spreads awareness. By learning about {stats.speciesFound} species, you&apos;ve
                taken the first step toward protecting Earth&apos;s biodiversity.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
