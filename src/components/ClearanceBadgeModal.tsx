"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { X, Download, ShieldCheck, RefreshCw } from "lucide-react";
import { soundFx } from "@/lib/audio";
import QRCode from "qrcode";

export const ClearanceBadgeModal: React.FC = () => {
  const {
    isBadgeModalOpen,
    setIsBadgeModalOpen,
    completionPercentage,
    completedTasksCount,
    totalTasks,
    completedMilestonesCount,
    totalMilestones,
    operationalPhasesCount,
    clearanceRank,
    projectArtifacts,
    addToast,
  } = useRoadmap();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute verified artifacts count
  const verifiedArtifactsCount = Object.values(projectArtifacts).filter(
    (a) => a.repoUrl?.trim() || a.liveUrl?.trim()
  ).length;

  const cleanupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const closeDialog = useCallback(() => {
    soundFx.playBlip(600);
    cleanupCanvas();
    setIsBadgeModalOpen(false);
  }, [cleanupCanvas, setIsBadgeModalOpen]);

  // Clean up canvas memory on unmount
  useEffect(() => {
    return () => {
      cleanupCanvas();
    };
  }, [cleanupCanvas]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBadgeModalOpen) {
        closeDialog();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBadgeModalOpen, closeDialog]);

  // Generate SHA-like deterministic fingerprint
  const generateFingerprint = useCallback(() => {
    const seed = `AMR-ELSHERIF-${completionPercentage}-${completedTasksCount}-${verifiedArtifactsCount}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    const hex = hash.toString(16).toUpperCase().padStart(8, "0");
    return `SHA256: 7F4B-${hex.slice(0, 4)}-${hex.slice(4, 8)}-C0DE`;
  }, [completionPercentage, completedTasksCount, verifiedArtifactsCount]);

  // Render the Canvas
  const renderBadge = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    const WIDTH = 1200;
    const HEIGHT = 630;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // 1. Deep Space Cyber Background
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGradient.addColorStop(0, "#050814");
    bgGradient.addColorStop(0.5, "#0a0f24");
    bgGradient.addColorStop(1, "#040711");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Subtle Radial Glow in Center
    const radialGlow = ctx.createRadialGradient(400, 300, 50, 400, 300, 600);
    radialGlow.addColorStop(0, "rgba(0, 240, 255, 0.08)");
    radialGlow.addColorStop(0.5, "rgba(0, 255, 157, 0.03)");
    radialGlow.addColorStop(1, "transparent");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. High-Tech Gridlines
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    ctx.lineWidth = 1;
    const GRID_STEP = 30;
    for (let x = 0; x < WIDTH; x += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < HEIGHT; y += GRID_STEP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    // 3. CRT Scanlines Effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let y = 0; y < HEIGHT; y += 4) {
      ctx.fillRect(0, y, WIDTH, 1.5);
    }

    // 4. Cyber Border & Glow
    ctx.save();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 240, 255, 0.6)";
    ctx.shadowBlur = 15;
    ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);
    ctx.restore();

    ctx.strokeStyle = "rgba(0, 255, 157, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, WIDTH - 52, HEIGHT - 52);

    // Corner Tech Reticles & Bracket Accents
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#00ff9d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.lineTo(0, 0);
      ctx.lineTo(24, 0);
      ctx.stroke();

      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    };

    drawCorner(20, 20, 0);
    drawCorner(WIDTH - 20, 20, Math.PI / 2);
    drawCorner(WIDTH - 20, HEIGHT - 20, Math.PI);
    drawCorner(20, HEIGHT - 20, (Math.PI * 3) / 2);

    // 5. Header Ribbon
    ctx.fillStyle = "rgba(10, 20, 40, 0.85)";
    ctx.fillRect(40, 40, WIDTH - 80, 56);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, WIDTH - 80, 56);

    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("CLASSIFIED TELEMETRY DOSSIER // SECURITY CLEARANCE RECORD", 55, 62);

    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.fillText("PROTOCOL: ZERO-TO-HERO CLOUD INFRASTRUCTURE SPECIFICATION v2.4", 55, 82);

    // Header Status Pill
    ctx.fillStyle = "rgba(0, 255, 157, 0.15)";
    ctx.strokeStyle = "#00ff9d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(WIDTH - 220, 48, 160, 28, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#00ff9d";
    ctx.fillText("● ID VERIFIED", WIDTH - 195, 66);

    // 6. Identity & Subject Block
    // Hexagonal / Tech Shield Icon
    const avatarX = 65;
    const avatarY = 135;
    const avatarSize = 95;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 240, 255, 0.4)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Initials Monogram inside Avatar
    ctx.font = "bold 42px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("AE", avatarX + avatarSize / 2, avatarY + 62);
    ctx.textAlign = "left";

    // Subject Name & Role
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Amr Elsherif", 185, 172);

    ctx.font = "bold 16px 'Courier New', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("DevOps & Cloud Systems Architect", 185, 198);

    // Clearance Level Badge
    ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(185, 208, 330, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`MASTER CLEARANCE: LEVEL ${clearanceRank.level} // ${clearanceRank.title.toUpperCase()}`, 198, 226);

    // 7. Telemetry Metrics Matrix (4 Cyber Cards)
    const metrics = [
      {
        label: "CURRICULUM PROGRESS",
        value: `${completionPercentage}%`,
        sub: `${operationalPhasesCount} / 12 Phases Fully Defended`,
        color: "#00f0ff",
        glow: "rgba(0, 240, 255, 0.2)",
      },
      {
        label: "GRANULAR TASKS",
        value: `${completedTasksCount} / ${totalTasks}`,
        sub: "Interactive CLI & Config Protocols",
        color: "#38bdf8",
        glow: "rgba(56, 189, 248, 0.2)",
      },
      {
        label: "PROJECT MILESTONES",
        value: `${completedMilestonesCount} / ${totalMilestones}`,
        sub: "Production Defense Artifacts",
        color: "#fbbf24",
        glow: "rgba(251, 191, 36, 0.2)",
      },
      {
        label: "PROOF-OF-WORK EVIDENCE",
        value: `${verifiedArtifactsCount} / 13`,
        sub: "GitHub Repositories & Live Demos",
        color: "#00ff9d",
        glow: "rgba(0, 255, 157, 0.2)",
      },
    ];

    const cardStartX = 40;
    const cardStartY = 265;
    const cardWidth = 260;
    const cardHeight = 115;
    const cardGap = 20;

    metrics.forEach((m, idx) => {
      const cx = cardStartX + idx * (cardWidth + cardGap);
      const cy = cardStartY;

      // Card Background
      ctx.fillStyle = "rgba(10, 16, 32, 0.75)";
      ctx.strokeStyle = "rgba(30, 41, 59, 0.9)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardWidth, cardHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Top Accent Line
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy);
      ctx.lineTo(cx + 60, cy);
      ctx.stroke();

      // Metric Label
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fillText(m.label, cx + 14, cy + 24);

      // Metric Value
      ctx.save();
      ctx.font = "bold 28px 'Courier New', monospace";
      ctx.fillStyle = m.color;
      ctx.shadowColor = m.glow;
      ctx.shadowBlur = 8;
      ctx.fillText(m.value, cx + 14, cy + 62);
      ctx.restore();

      // Subtitle
      ctx.font = "10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
      ctx.fillText(m.sub, cx + 14, cy + 86);

      // Mini Progress indicator for progress card
      if (idx === 0) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(cx + 14, cy + 96, cardWidth - 28, 6);
        ctx.fillStyle = "#00f0ff";
        ctx.fillRect(cx + 14, cy + 96, ((cardWidth - 28) * completionPercentage) / 100, 6);
      }
    });

    // 8. Bottom Panel: Cryptographic Signature & QR Verification Code
    const bottomY = 410;
    const bottomHeight = 175;

    ctx.fillStyle = "rgba(8, 13, 27, 0.85)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(40, bottomY, WIDTH - 80, bottomHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Left info in bottom panel
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#00ff9d";
    ctx.fillText("CRYPTOGRAPHIC CLEARANCE VERIFICATION RECORD", 65, bottomY + 32);

    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "rgba(203, 213, 225, 0.9)";
    ctx.fillText(generateFingerprint(), 65, bottomY + 58);

    const now = new Date();
    const timestampStr = `TIMESTAMP: ${now.toISOString().replace("T", " ").slice(0, 19)} UTC`;
    ctx.fillText(timestampStr, 65, bottomY + 80);

    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.fillText("ARCHITECTURE SPECIFICATION // 132 TASKS • 12 PHASES • 13 MILESTONES", 65, bottomY + 104);

    ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
    ctx.fillText("HOST: DEV-AMR-ELSHERIF / ULTIMATE-DEVOPS-TRACKER", 65, bottomY + 126);

    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "rgba(100, 116, 139, 0.8)";
    ctx.fillText("PRODUCED BY DEVOPS COMMAND CENTER // SECURE BROWSER PERSISTENCE ENGINE", 65, bottomY + 148);

    // Generate & Draw Live QR Code
    try {
      const liveOrigin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://dev-amr-elsherif.github.io/ultimate-devops-tracker";

      const qrDataUrl = await QRCode.toDataURL(liveOrigin, {
        margin: 1,
        width: 140,
        color: {
          dark: "#00f0ff",
          light: "#050814",
        },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });

      const qrX = WIDTH - 220;
      const qrY = bottomY + 18;
      ctx.drawImage(qrImg, qrX, qrY, 140, 140);

      // QR Frame
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 2, qrY - 2, 144, 144);

      // QR Label
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = "#00f0ff";
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VERIFY LIVE", qrX + 70, bottomY + 170);
      ctx.textAlign = "left";
    } catch {
      // Fallback if QR fails
    }

    setIsGenerating(false);
  }, [
    completionPercentage,
    completedTasksCount,
    totalTasks,
    completedMilestonesCount,
    totalMilestones,
    clearanceRank,
    operationalPhasesCount,
    verifiedArtifactsCount,
    generateFingerprint,
  ]);

  // Trigger render when modal opens
  useEffect(() => {
    if (isBadgeModalOpen) {
      const timer = setTimeout(() => {
        renderBadge();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isBadgeModalOpen, renderBadge]);

  // Export PNG handler with memory-safe ObjectURL lifecycle
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundFx.playSuccess();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `devops-clearance-id-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");

    addToast({
      type: "success",
      title: "CLEARANCE CREDENTIAL GENERATED",
      description: "Holographic ID badge saved as high-resolution PNG.",
    });
  };

  if (!isBadgeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-wider">
                  CREDENTIAL DOSSIER
                </span>
                <span className="text-xs font-mono text-slate-500">[1200 x 630 px]</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold font-mono text-slate-100 mt-0.5">
                Holographic Clearance ID Generator
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="badge-modal-close-btn"
            onClick={closeDialog}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Canvas Preview */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Generate and export your official cyber-themed credential badge showcasing your live
            curriculum progress, completed tasks, defended milestones, and verified proof-of-work
            artifacts. Formatted for LinkedIn, Twitter / X, and portfolio embeds.
          </p>

          {/* Canvas Wrapper */}
          <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-slate-950">
            {isGenerating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm font-mono text-xs text-cyan-300 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>SYNTHESIZING HOLOGRAPHIC BADGE...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              data-testid="badge-canvas"
              className="w-full h-auto block"
              style={{ maxHeight: "420px", objectFit: "contain" }}
            />
          </div>

          {/* Metadata Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Subject</span>
              <span className="text-slate-200 font-bold truncate block">Amr Elsherif</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Clearance</span>
              <span className="text-amber-400 font-bold truncate block">
                LEVEL {clearanceRank.level} ({clearanceRank.title})
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Progress</span>
              <span className="text-cyan-400 font-bold block">{completionPercentage}% Completed</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Verified Proof</span>
              <span className="text-emerald-400 font-bold block">{verifiedArtifactsCount} Artifacts</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-t border-slate-800">
          <button
            type="button"
            onClick={renderBadge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REGENERATE</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeDialog}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs transition-colors"
            >
              DISMISS
            </button>
            <button
              type="button"
              data-testid="badge-download-btn"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_18px_rgba(0,240,255,0.35)]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>[ 💾 DOWNLOAD CREDENTIAL PNG ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
