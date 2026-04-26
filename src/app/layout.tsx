import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist_Mono, Fraunces, Finger_Paint, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { BottomNav } from "@/components/bottom-nav";
import { PageTransition } from "@/components/page-transition";

const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-geist-sans", weight: ["300", "400", "500", "600", "700"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK"] });
const fingerPaint = Finger_Paint({ subsets: ["latin"], variable: "--font-finger-paint", weight: "400" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

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
    <html lang="en" className={`${firaCode.variable} ${geistMono.variable} ${fraunces.variable} ${fingerPaint.variable} ${dmSans.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t==='light'?'light':'dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AppProviders>
          <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
            <main className="flex-1 pb-20">
              <PageTransition>{children}</PageTransition>
            </main>
            <BottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
