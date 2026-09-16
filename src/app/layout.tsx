import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoadmapProvider } from "@/context/RoadmapContext";
import { CyberCanvas } from "@/components/CyberCanvas";
import { ToastContainer } from "@/components/Toast";
import { FloatingDock } from "@/components/FloatingDock";
import { SnapshotModal } from "@/components/SnapshotModal";
import { ClearanceBadgeModal } from "@/components/ClearanceBadgeModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050814",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Ultimate DevOps & Cloud Engineering Master Roadmap (Zero-to-Hero)",
  description:
    "Interactive mission command terminal & curriculum tracker for DevOps, Linux, AWS, Kubernetes, Terraform, CI/CD, and Observability.",
  metadataBase: new URL("https://dev-amr-elsherif.github.io/ultimate-devops-tracker"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ultimate DevOps & Cloud Engineering Master Roadmap (Zero-to-Hero)",
    description:
      "29-Week Enterprise DevOps & Cloud Engineering curriculum tracker featuring 12 phases, 132 tasks, 13 project defense milestones, and live proof-of-work credentials.",
    url: "https://dev-amr-elsherif.github.io/ultimate-devops-tracker",
    siteName: "DevOps Command Center",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ultimate DevOps & Cloud Engineering Master Roadmap",
    description:
      "Interactive mission terminal tracking 132 hands-on DevOps protocols and proof-of-work project milestones.",
    creator: "@amrelsherif",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-950 text-slate-100 relative selection:bg-cyan-500/30 selection:text-white"
      >
        <RoadmapProvider>
          {/* 3D Perspective Cyber Grid & Floating Starfield Canvas */}
          <CyberCanvas />

          {/* CRT Scanline Visual Filter Overlay */}
          <div className="fixed inset-0 pointer-events-none z-10 scanline-overlay opacity-30" />

          {/* Application Content Container */}
          <div className="relative z-20 flex-1 flex flex-col">
            {children}
          </div>

          {/* Floating Actions Dock & Modals */}
          <FloatingDock />
          <SnapshotModal />
          <ClearanceBadgeModal />
          <ToastContainer />
        </RoadmapProvider>
      </body>
    </html>
  );
}
