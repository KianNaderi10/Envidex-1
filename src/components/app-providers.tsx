"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider delay={300}>{children}</TooltipProvider>
    </SessionProvider>
  );
}
