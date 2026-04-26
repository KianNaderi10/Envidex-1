"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { Camera, LogOut, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { mockSpeciesDatabase } from "@/lib/mock-species";
import { StatusBadge } from "@/components/status-badge";
import { isThreatened } from "@/lib/conservation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEnvidexStore } from "@/lib/store";
import type { CollectedEntry, Species } from "@/lib/types";

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

type ChallengeEntry = { id: string; title: string; description: string; icon: string; compute: (today: CollectedEntry[], week: CollectedEntry[]) => { current: number; total: number } };

const DAILY_POOL: ChallengeEntry[] = [
  { id: "d-scan", title: "First Light", description: "Identify a species today", icon: "🔭",
    compute: (today) => ({ current: Math.min(today.length, 1), total: 1 }) },
  { id: "d-double", title: "Double Take", description: "Identify 2 species today", icon: "👀",
    compute: (today) => ({ current: today.length, total: 2 }) },
  { id: "d-threatened", title: "Danger Zone", description: "Find a threatened species today", icon: "⚠️",
    compute: (today) => ({ current: Math.min(today.filter(e => isThreatened(mockSpeciesDatabase.find(s => s.id === e.speciesId)?.conservationStatus ?? "LC")).length, 1), total: 1 }) },
  { id: "d-plant", title: "Plant Hunter", description: "Discover a plant species today", icon: "🦁",
    compute: (today) => ({ current: Math.min(today.filter(e => mockSpeciesDatabase.find(s => s.id === e.speciesId)?.kingdom === "Plantae").length, 1), total: 1 }) },
  { id: "d-lc", title: "Common Ground", description: "Discover a Least Concern species today", icon: "🟢",
    compute: (today) => ({ current: Math.min(today.filter(e => mockSpeciesDatabase.find(s => s.id === e.speciesId)?.conservationStatus === "LC").length, 1), total: 1 }) },
  { id: "d-cr", title: "Critical Find", description: "Discover a critically endangered species today", icon: "🚨",
    compute: (today) => ({ current: Math.min(today.filter(e => mockSpeciesDatabase.find(s => s.id === e.speciesId)?.conservationStatus === "CR").length, 1), total: 1 }) },
];

const WEEKLY_POOL: ChallengeEntry[] = [
  { id: "w-3", title: "Weekly Explorer", description: "Find 3 species this week", icon: "🗺️",
    compute: (_t, week) => ({ current: week.length, total: 3 }) },
  { id: "w-threatened", title: "Conservation Watch", description: "Discover 2 threatened species this week", icon: "🛡️",
    compute: (_t, week) => ({ current: week.filter(e => isThreatened(mockSpeciesDatabase.find(s => s.id === e.speciesId)?.conservationStatus ?? "LC")).length, total: 2 }) },
  { id: "w-days", title: "Active Days", description: "Collect on 3 different days this week", icon: "📅",
    compute: (_t, week) => ({ current: new Set(week.map(e => new Date(e.discoveredAt).toISOString().split("T")[0])).size, total: 3 }) },
  { id: "w-cr", title: "Rare Seeker", description: "Find a critically endangered species this week", icon: "💎",
    compute: (_t, week) => ({ current: Math.min(week.filter(e => mockSpeciesDatabase.find(s => s.id === e.speciesId)?.conservationStatus === "CR").length, 1), total: 1 }) },
  { id: "w-kingdoms", title: "Kingdom Tour", description: "Discover species from 2 different kingdoms this week", icon: "🌐",
    compute: (_t, week) => ({ current: new Set(week.map(e => mockSpeciesDatabase.find(s => s.id === e.speciesId)?.kingdom).filter(Boolean)).size, total: 2 }) },
];

export default function HomePage() {
  const { data: session, status } = useSession();

  const username = useMemo(() => {
    if (!session?.user?.name) return "Explorer";
    return session.user.name.split(" ")[0];
  }, [session?.user?.name]);

  const { collection } = useEnvidexStore();

  const challenges = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const weekOfYear = Math.floor(dayOfYear / 7);
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartMs = weekStart.getTime();
    const todayEntries = collection.filter((e) => new Date(e.discoveredAt).toISOString().split("T")[0] === todayStr);
    const weekEntries = collection.filter((e) => new Date(e.discoveredAt).getTime() >= weekStartMs);
    const daily = DAILY_POOL[dayOfYear % DAILY_POOL.length];
    const weekly = WEEKLY_POOL[weekOfYear % WEEKLY_POOL.length];
    return [
      { ...daily, type: "daily" as const, prog: daily.compute(todayEntries, weekEntries) },
      { ...weekly, type: "weekly" as const, prog: weekly.compute(todayEntries, weekEntries) },
    ];
  }, [collection]);

  const recentSpecies = useMemo((): Species[] => {
    return collection
      .slice(0, 3)
      .map((e) => mockSpeciesDatabase.find((s) => s.id === e.speciesId))
      .filter((s): s is Species => s !== undefined);
  }, [collection]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-1.5 w-16 rounded-full bg-primary/30 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-primary shimmer-bg" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 pt-8 pb-2">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-bold tracking-[0.2em] uppercase text-primary"
          >
            Envidex
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          </motion.div>
        </nav>

        {/* Hero */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex-1 flex flex-col justify-center px-6 pt-8 pb-12"
        >
          <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.35_0.14_155/0.35),transparent)] pointer-events-none" />

          <motion.p variants={fadeUp} className="text-sm text-primary/70 mb-4 font-medium">
            AI-powered species identification
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-5xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The world&apos;s<br />
            wildlife,<br />
            <em className="not-italic text-primary">in your pocket.</em>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-muted-foreground text-[15px] leading-relaxed max-w-[28ch] mb-10">
            Point your camera at any animal or plant. Envidex identifies it, tells its story, and shows you how to help.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 max-w-xs">
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2.5 bg-primary text-primary-foreground rounded-2xl px-6 py-4 font-semibold text-sm shadow-lg shadow-primary/20"
              >
                <Camera className="h-4 w-4" />
                Start identifying species
              </Link>
            </motion.div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an account? <span className="text-primary ml-1">Log in →</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="border-t border-border/40 px-6 py-6 grid grid-cols-3 gap-4"
        >
          {[
            { value: "8.7M", label: "species tracked" },
            { value: "44k+", label: "endangered" },
            { value: "free", label: "always" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="text-xl font-black text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col min-h-screen"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between px-5 pt-10 pb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary/70">Envidex</p>
          <h1 className="text-2xl font-black tracking-tight mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
            Hey, {username}.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="h-9 w-9 rounded-full border border-border/60 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Scan CTA */}
      <motion.div variants={fadeUp} className="px-5 mb-8">
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
        >
          <Link
            href="/scan"
            className="relative flex flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/20 p-6 min-h-[160px]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.45_0.18_155/0.4),transparent_60%)]" />
            <motion.div
              className="absolute top-5 right-5 text-5xl opacity-60 select-none"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              🌿
            </motion.div>
            <div className="relative">
              <p className="text-xs text-primary/80 font-medium mb-1 uppercase tracking-wider">Tap to scan</p>
              <h2 className="text-2xl font-black leading-tight">Identify a<br />species now</h2>
            </div>
            <div className="absolute bottom-5 right-5">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Camera className="h-5 w-5 text-primary-foreground" />
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Challenges */}
      <motion.div variants={fadeUp} className="px-5 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Challenges</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {challenges.map((c) => {
            const done = c.prog.current >= c.prog.total;
            const pct = Math.min((c.prog.current / c.prog.total) * 100, 100);
            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  done
                    ? "border-primary/30 bg-primary/10"
                    : c.type === "daily"
                    ? "border-orange-500/20 bg-orange-500/5"
                    : "border-indigo-500/20 bg-indigo-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${
                        done ? "text-primary" : c.type === "daily" ? "text-orange-400" : "text-indigo-400"
                      }`}>
                        {c.type === "daily" ? "Today" : "This Week"}
                      </span>
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground shrink-0">{c.prog.current}/{c.prog.total}</span>
                      )}
                    </div>
                    <p className="font-semibold text-sm leading-tight">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{c.description}</p>
                    {!done && (
                      <div className="mt-2 h-1 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${c.type === "daily" ? "bg-orange-400" : "bg-indigo-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recently discovered */}
      <motion.div variants={fadeUp} className="px-5 mb-2">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-base font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Recently discovered</h2>
          {recentSpecies.length > 0 && (
            <Link href="/collection" className="text-xs text-primary font-medium">See all →</Link>
          )}
        </div>

        {recentSpecies.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/30 p-6 flex flex-col items-center text-center gap-2">
            <span className="text-3xl">🦁</span>
            <p className="text-sm font-semibold">Nothing discovered yet</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Scan your first species to start building your field guide
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-border/40 bg-card/40">
            {recentSpecies.map((species, i) => (
              <motion.div
                key={species.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: "easeOut" }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/species/${species.id}`}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors"
                  style={{ borderBottom: i < recentSpecies.length - 1 ? "1px solid oklch(1 0 0 / 6%)" : "none" }}
                >
                  <div className="text-2xl w-9 text-center shrink-0 select-none">
                    {"🦁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{species.commonName}</p>
                    <p className="text-[11px] text-muted-foreground italic truncate mt-0.5">{species.scientificName}</p>
                  </div>
                  <StatusBadge status={species.conservationStatus} size="sm" className="shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Field guide nudge */}
      <motion.div variants={fadeUp} className="px-5 mt-6 pb-8">
        <motion.div
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/30 px-4 py-4 cursor-pointer"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 1 }}
            className="text-3xl"
          >
            🏆
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Build your Field Guide</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Collect species, earn badges, track your impact.
            </p>
          </div>
          <Link href="/collection" className="shrink-0 text-xs font-bold text-primary">
            View →
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
