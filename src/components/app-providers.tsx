"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MotionConfig } from "framer-motion";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </SessionProvider>
    </MotionConfig>
  );
}
