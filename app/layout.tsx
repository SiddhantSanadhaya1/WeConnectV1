import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WEC-Guardian · Omni-Channel Concierge (POC)",
  description:
    "Demonstration: agentic verification concierge with vision, voice, and simulated QID anchoring.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "WEC-Guardian" },
};

export const viewport: Viewport = {
  themeColor: "#8a315f",
};

const themeScript = `
(() => {
  try {
    const saved = window.localStorage.getItem("weconnect-theme");
    const theme = saved === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
