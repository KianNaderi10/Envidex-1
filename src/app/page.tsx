"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { Camera, LogOut } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { mockSpeciesDatabase } from "@/lib/mock-species";
import { StatusBadge } from "@/components/status-badge";
import { isThreatened } from "@/lib/conservation";

const featuredSpecies = mockSpeciesDatabase.filter((s) =>
  isThreatened(s.conservationStatus)
).slice(0, 3);

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HomePage() {
  const { data: session, status } = useSession();

  const username = useMemo(() => {
    if (!session?.user?.name) return "Explorer";
    return session.user.name.split(" ")[0];
  }, [session?.user?.name]);

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

      {/* Species list */}
      <motion.div variants={fadeUp} className="px-5 mb-2">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-base font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Under threat</h2>
          <Link href="/collection" className="text-xs text-primary font-medium">See all →</Link>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border/40 bg-card/40">
          {featuredSpecies.map((species, i) => (
            <motion.div
              key={species.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: "easeOut" }}
              whileTap={{ scale: 0.98, backgroundColor: "oklch(1 0 0 / 5%)" }}
            >
              <Link
                href={`/species/${species.id}`}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors"
                style={{ borderBottom: i < featuredSpecies.length - 1 ? "1px solid oklch(1 0 0 / 6%)" : "none" }}
              >
                <div className="text-2xl w-9 text-center shrink-0 select-none">
                  {species.kingdom === "Animalia" ? "🦁" : "🌿"}
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
