import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Envidex — Species Discovery",
  description: "Identify, collect, and learn about Earth's endangered species",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f1f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <TooltipProvider delay={300}>
          <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
