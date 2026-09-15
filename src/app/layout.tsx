import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RoadmapProvider } from "@/context/RoadmapContext";
import { CyberCanvas } from "@/components/CyberCanvas";
import { ToastContainer } from "@/components/Toast";
import { PasscodeModal } from "@/components/PasscodeModal";
import { SnapshotModal } from "@/components/SnapshotModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate DevOps & Cloud Engineering Master Roadmap (Zero-to-Hero)",
  description:
    "Interactive mission command terminal & curriculum tracker for DevOps, Linux, AWS, Kubernetes, Terraform, CI/CD, and Observability.",
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

          {/* Modal & Toast Alerts */}
          <PasscodeModal />
          <SnapshotModal />
          <ToastContainer />
        </RoadmapProvider>
      </body>
    </html>
  );
}
