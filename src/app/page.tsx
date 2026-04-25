import Link from "next/link";
import { Camera, Leaf, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockSpeciesDatabase } from "@/lib/mock-species";
import { StatusBadge } from "@/components/status-badge";
import { isThreatened } from "@/lib/conservation";

const featuredSpecies = mockSpeciesDatabase.filter((s) =>
  isThreatened(s.conservationStatus)
).slice(0, 3);

const stats = [
  { label: "Species Tracked", value: "8.7M", icon: Leaf },
  { label: "Endangered", value: "44,000+", icon: TrendingUp },
  { label: "Scans Today", value: "12,847", icon: Zap },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-12 pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.12_155/0.3),transparent_70%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Envidex</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3">
            Discover &<br />
            <span className="text-primary">Protect</span> Earth
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Identify any species with your camera. Learn their story. Join the mission to keep them alive.
          </p>
          <Link
            href="/scan"
            className="mt-6 inline-flex items-center gap-2.5 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 font-semibold text-sm shadow-lg shadow-primary/25 active:scale-95 transition-transform"
          >
            <Camera className="h-4 w-4" />
            Scan a Species
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-3 bg-card/60 border-border/50 text-center">
              <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
              <div className="text-base font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured endangered species */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Need Urgent Help</h2>
          <Link href="/collection" className="text-xs text-primary">View all →</Link>
        </div>
        <div className="space-y-3">
          {featuredSpecies.map((species) => (
            <Link key={species.id} href={`/species/${species.id}`}>
              <Card className="overflow-hidden border-border/50 bg-card/60 active:scale-[0.98] transition-transform">
                <div className="flex items-stretch">
                  <div
                    className="w-20 shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl"
                    aria-hidden
                  >
                    {species.kingdom === "Animalia" ? "🦁" : "🌿"}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-semibold text-sm leading-tight truncate">{species.commonName}</p>
                        <p className="text-[11px] text-muted-foreground italic truncate">{species.scientificName}</p>
                      </div>
                      <StatusBadge status={species.conservationStatus} size="sm" className="shrink-0" />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {species.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Gamification CTA */}
      <div className="px-4 pb-8">
        <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Build your Field Guide</h3>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                Scan species to collect them. Unlock badges and become a conservation champion.
              </p>
              <Link
                href="/scan"
                className="text-xs font-semibold text-primary"
              >
                Start collecting →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
