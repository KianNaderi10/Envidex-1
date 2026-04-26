"use client";

import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Award, Flame, Leaf, Star, Shield, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEnvidexStore } from "@/lib/store";
import { mockSpeciesDatabase } from "@/lib/mock-species";
import { isThreatened } from "@/lib/conservation";
import { motion, useAnimationControls } from "framer-motion";
import Link from "next/link";

const BADGES = [
  {
    id: "first-scan",
    name: "First Discovery",
    description: "Identify your first species",
    icon: "🔭",
    requirement: (count: number) => count >= 1,
  },
  {
    id: "conservationist",
    name: "Conservationist",
    description: "Discover 3 endangered species",
    icon: "🌿",
    requirement: (_: number, endangered: number) => endangered >= 3,
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Collect 5 different species",
    icon: "🗺️",
    requirement: (count: number) => count >= 5,
  },
  {
    id: "champion",
    name: "Champion",
    description: "Collect all species in the database",
    icon: "🏆",
    requirement: (count: number) => count >= mockSpeciesDatabase.length,
  },
  {
    id: "botanist",
    name: "Botanist",
    description: "Discover a plant species",
    icon: "🌱",
    requirement: (_: number, __: number, plants: number) => plants >= 1,
  },
  {
    id: "guardian",
    name: "Guardian",
    description: "Discover 5 threatened species",
    icon: "🛡️",
    requirement: (_: number, endangered: number) => endangered >= 5,
  },
];

function BadgeCard({ badge, index }: { badge: typeof BADGES[0] & { earned: boolean }; index: number }) {
  const controls = useAnimationControls();

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
            badge.earned ? "bg-primary/10 border-primary/30" : "bg-card/30 opacity-50 grayscale"
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
            <span className="text-2xl">{badge.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-xs leading-tight">{badge.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
              {badge.earned && (
                <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                  <Star className="h-2.5 w-2.5" /> Earned
                </span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { collection } = useEnvidexStore();

  const displayName = useMemo(() => {
    return session?.user?.name?.trim() || "Explorer";
  }, [session?.user?.name]);

  const stats = useMemo(() => {
    const speciesFound = collection.length;
    const endangeredFound = collection.filter((e) => {
      const s = mockSpeciesDatabase.find((sp) => sp.id === e.speciesId);
      return s && isThreatened(s.conservationStatus);
    }).length;
    const plantsFound = collection.filter((e) => {
      const s = mockSpeciesDatabase.find((sp) => sp.id === e.speciesId);
      return s?.kingdom === "Plantae";
    }).length;

    return { speciesFound, endangeredFound, plantsFound };
  }, [collection]);

  const badges = BADGES.map((badge) => ({
    ...badge,
    earned: badge.requirement(stats.speciesFound, stats.endangeredFound, stats.plantsFound),
  }));

  const earnedCount = badges.filter((b) => b.earned).length;
  const level = Math.floor(stats.speciesFound / 2) + 1;
  const xpForNext = (level * 2) - stats.speciesFound;

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
            {session?.user?.image ? (
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
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Discovered", value: stats.speciesFound, icon: Leaf, color: "text-primary" },
            { label: "Endangered", value: stats.endangeredFound, icon: Shield, color: "text-amber-400" },
            { label: "Badges", value: earnedCount, icon: Star, color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 bg-card/60 border-border/50 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Badges</h2>
          <span className="text-xs text-muted-foreground ml-auto">{earnedCount}/{badges.length} earned</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((badge, i) => (
            <BadgeCard key={badge.id} badge={badge} index={i} />
          ))}
        </div>
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
