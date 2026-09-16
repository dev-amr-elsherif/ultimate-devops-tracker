"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { X, Download, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import { soundFx } from "@/lib/audio";
import QRCode from "qrcode";

const ENGINEER_NAME = "Amr Fathy Elsherif";

function getTierLabel(level: number): string {
  if (level >= 3) return "TIER 3: PRINCIPAL ARCHITECT";
  if (level >= 2) return "TIER 2: INFRASTRUCTURE ENGINEER";
  return "TIER 1: SYSTEMS SPECIALIST";
}

export const ClearanceBadgeModal: React.FC = () => {
  const {
    isBadgeModalOpen,
    setIsBadgeModalOpen,
    completionPercentage,
    completedTasksCount,
    totalTasks,
    totalMilestones,
    operationalPhasesCount,
    clearanceRank,
    projectArtifacts,
    addToast,
    isCommander,
    customAvatarUrl,
    updateCustomAvatar,
  } = useRoadmap();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const verifiedArtifactsCount = Object.values(projectArtifacts).filter(
    (a) => a.repoUrl?.trim() || a.liveUrl?.trim()
  ).length;

  const cleanupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const closeDialog = useCallback(() => {
    soundFx.playBlip(600);
    cleanupCanvas();
    setIsBadgeModalOpen(false);
  }, [cleanupCanvas, setIsBadgeModalOpen]);

  useEffect(() => {
    return () => { cleanupCanvas(); };
  }, [cleanupCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBadgeModalOpen) closeDialog();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBadgeModalOpen, closeDialog]);

  const generateFingerprint = useCallback(() => {
    const seed = `AFE-${completionPercentage}-${completedTasksCount}-${verifiedArtifactsCount}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    const hex = hash.toString(16).toUpperCase().padStart(8, "0");
    return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-C0DE`;
  }, [completionPercentage, completedTasksCount, verifiedArtifactsCount]);

  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) => {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
  };

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

    // 1. Background
    const bgGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bgGradient.addColorStop(0, "#050814");
    bgGradient.addColorStop(0.5, "#0a0f24");
    bgGradient.addColorStop(1, "#040711");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const radialGlow = ctx.createRadialGradient(200, 315, 30, 200, 315, 450);
    radialGlow.addColorStop(0, "rgba(0, 240, 255, 0.10)");
    radialGlow.addColorStop(0.5, "rgba(0, 255, 157, 0.04)");
    radialGlow.addColorStop(1, "transparent");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Grid
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    ctx.lineWidth = 1;
    const GRID_STEP = 30;
    for (let x = 0; x < WIDTH; x += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < HEIGHT; y += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }

    // 3. CRT Scanlines
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    for (let y = 0; y < HEIGHT; y += 4) ctx.fillRect(0, y, WIDTH, 1.5);

    // 4. Borders
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

    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(angle);
      ctx.strokeStyle = "#00ff9d"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, 0); ctx.lineTo(24, 0); ctx.stroke();
      ctx.fillStyle = "#00f0ff"; ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    };
    drawCorner(20, 20, 0);
    drawCorner(WIDTH - 20, 20, Math.PI / 2);
    drawCorner(WIDTH - 20, HEIGHT - 20, Math.PI);
    drawCorner(20, HEIGHT - 20, (Math.PI * 3) / 2);

    // 5. Header Ribbon
    ctx.fillStyle = "rgba(10, 20, 40, 0.88)";
    ctx.fillRect(40, 40, WIDTH - 80, 54);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, WIDTH - 80, 54);

    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("CLASSIFIED TELEMETRY DOSSIER // SECURITY CLEARANCE RECORD", 55, 61);
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.fillText("PROTOCOL: ZERO-TO-HERO CLOUD INFRASTRUCTURE SPECIFICATION v2.4", 55, 82);

    ctx.fillStyle = "rgba(0, 255, 157, 0.15)";
    ctx.strokeStyle = "#00ff9d";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, WIDTH - 220, 47, 160, 28, 4);
    ctx.fill(); ctx.stroke();
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#00ff9d";
    ctx.fillText("● ID VERIFIED", WIDTH - 196, 65);

    // 6. Circular Avatar
    const avatarCX = 130;
    const avatarCY = 190;
    const avatarR = 72;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(0, 240, 255, 0.4)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.clip();

    if (customAvatarUrl) {
      try {
        const img = new Image();
        img.src = customAvatarUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          setTimeout(() => reject(), 3000);
        });
        ctx.drawImage(img, avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
      } catch {
        ctx.fillStyle = "rgba(10, 16, 36, 1)";
        ctx.fillRect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
        ctx.font = "bold 40px 'Courier New', monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("AFE", avatarCX, avatarCY + 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }
    } else {
      ctx.fillStyle = "rgba(10, 16, 36, 1)";
      ctx.fillRect(avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
      ctx.font = "bold 40px 'Courier New', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AFE", avatarCX, avatarCY + 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    // 7. Identity Block
    const idX = 230;
    const idY = 130;

    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(ENGINEER_NAME, idX, idY);

    ctx.font = "bold 15px 'Courier New', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("DevOps & Cloud Systems Architect", idX, idY + 28);

    ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, idX, idY + 40, 390, 28, 6);
    ctx.fill(); ctx.stroke();
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(
      `MASTER CLEARANCE: LEVEL ${clearanceRank.level} // ${clearanceRank.title.toUpperCase()}`,
      idX + 12, idY + 59
    );

    const tierLabel = getTierLabel(clearanceRank.level);
    ctx.fillStyle = "rgba(0, 240, 255, 0.10)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, idX, idY + 76, 310, 24, 4);
    ctx.fill(); ctx.stroke();
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "#67e8f9";
    ctx.fillText(tierLabel, idX + 10, idY + 92);

    // Tech chip row
    const chips = ["AWS", "KUBERNETES", "TERRAFORM", "PROMETHEUS", "DOCKER"];
    let chipX = idX;
    const chipY = idY + 110;
    for (const chip of chips) {
      const chipW = chip.length * 8.5 + 16;
      ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, chipX, chipY, chipW, 20, 4);
      ctx.fill(); ctx.stroke();
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fillText(chip, chipX + 8, chipY + 13);
      chipX += chipW + 6;
    }

    // 8. Three Metric Pillars
    const pillars = [
      {
        label: "PROGRESS",
        value: `${completionPercentage}%`,
        sub: `${operationalPhasesCount}/12 Phases`,
        color: "#00f0ff",
        glow: "rgba(0, 240, 255, 0.18)",
        showBar: true,
      },
      {
        label: "CORE TASKS",
        value: `${completedTasksCount}/${totalTasks}`,
        sub: "CLI & Config Protocols",
        color: "#38bdf8",
        glow: "rgba(56, 189, 248, 0.18)",
        showBar: false,
      },
      {
        label: "VERIFIED ARTIFACTS",
        value: `${verifiedArtifactsCount}/${totalMilestones}`,
        sub: "GitHub & Live Demos",
        color: "#00ff9d",
        glow: "rgba(0, 255, 157, 0.18)",
        showBar: false,
      },
    ];

    const pillarStartX = 40;
    const pillarStartY = 295;
    const pillarW = 365;
    const pillarH = 115;
    const pillarGap = 25;

    for (let idx = 0; idx < pillars.length; idx++) {
      const p = pillars[idx];
      const cx = pillarStartX + idx * (pillarW + pillarGap);
      const cy = pillarStartY;

      ctx.fillStyle = "rgba(10, 16, 32, 0.78)";
      ctx.strokeStyle = "rgba(30, 41, 59, 0.9)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, cx, cy, pillarW, pillarH, 8);
      ctx.fill(); ctx.stroke();

      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 80, cy);
      ctx.stroke();

      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fillText(p.label, cx + 14, cy + 24);

      ctx.save();
      ctx.font = "bold 34px 'Courier New', monospace";
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 10;
      ctx.fillText(p.value, cx + 14, cy + 68);
      ctx.restore();

      ctx.font = "10px 'Courier New', monospace";
      ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
      ctx.fillText(p.sub, cx + 14, cy + 90);

      if (p.showBar) {
        const barX = cx + 14;
        const barY = cy + 100;
        const barW = pillarW - 28;
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(barX, barY, barW, 6);
        ctx.fillStyle = p.color;
        ctx.fillRect(barX, barY, (barW * completionPercentage) / 100, 6);
      }
    }

    // 9. Bottom Panel
    const bottomY = 432;
    const bottomH = 165;

    ctx.fillStyle = "rgba(8, 13, 27, 0.85)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, 40, bottomY, WIDTH - 80, bottomH, 8);
    ctx.fill(); ctx.stroke();

    const fingerprint = generateFingerprint();
    const now = new Date();
    const issuedStr = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#00ff9d";
    ctx.fillText("CRYPTOGRAPHIC CLEARANCE VERIFICATION RECORD", 62, bottomY + 28);

    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "rgba(203, 213, 225, 0.9)";
    ctx.fillText(`ID: DEV-AFE-2026`, 62, bottomY + 52);
    ctx.fillText(`SHA256: 7F4B-${fingerprint}`, 62, bottomY + 72);
    ctx.fillText(`ISSUED: ${issuedStr}`, 62, bottomY + 92);

    ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
    ctx.fillText("HOST: DEV-AMR-ELSHERIF / ULTIMATE-DEVOPS-TRACKER", 62, bottomY + 114);

    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "rgba(100, 116, 139, 0.8)";
    ctx.fillText(
      "ARCHITECTURE: 132 TASKS • 12 PHASES • 13 MILESTONES • GRADUATION CAPSTONE",
      62, bottomY + 136
    );
    ctx.fillText(
      "PRODUCED BY DEVOPS COMMAND CENTER // SECURE BROWSER PERSISTENCE ENGINE",
      62, bottomY + 152
    );

    // QR Code
    try {
      const liveOrigin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://dev-amr-elsherif.github.io/ultimate-devops-tracker";

      const qrDataUrl = await QRCode.toDataURL(liveOrigin, {
        margin: 1,
        width: 130,
        color: { dark: "#00f0ff", light: "#050814" },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); });

      const qrX = WIDTH - 208;
      const qrY = bottomY + 14;
      ctx.drawImage(qrImg, qrX, qrY, 130, 130);

      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 2, qrY - 2, 134, 134);

      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillStyle = "#00f0ff";
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VERIFY LIVE TELEMETRY", qrX + 65, bottomY + 158);
      ctx.textAlign = "left";
    } catch {
      // Fallback if QR fails silently
    }

    setIsGenerating(false);
  }, [
    completionPercentage,
    completedTasksCount,
    totalTasks,
    totalMilestones,
    clearanceRank,
    operationalPhasesCount,
    verifiedArtifactsCount,
    customAvatarUrl,
    generateFingerprint,
  ]);

  useEffect(() => {
    if (isBadgeModalOpen) {
      const timer = setTimeout(() => { renderBadge(); }, 50);
      return () => clearTimeout(timer);
    }
  }, [isBadgeModalOpen, renderBadge]);

  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isCommander) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const offscreen = document.createElement("canvas");
          offscreen.width = 256;
          offscreen.height = 256;
          const offCtx = offscreen.getContext("2d");
          if (!offCtx) return;

          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          offCtx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);

          const dataUrl = offscreen.toDataURL("image/jpeg", 0.88);
          updateCustomAvatar(dataUrl);
          addToast({
            type: "success",
            title: "AVATAR UPDATED",
            description: "Custom photo synchronized to clearance ID engine.",
          });
          setTimeout(() => renderBadge(), 80);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [isCommander, updateCustomAvatar, addToast, renderBadge]
  );

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
        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Generate and export your official cyber-themed credential badge showcasing live
            curriculum progress, completed tasks, defended milestones, and verified proof-of-work
            artifacts. Formatted for LinkedIn, X, and portfolio embeds.
          </p>

          {/* Avatar Upload Row — Commander only */}
          {isCommander && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20">
              <div
                className="relative flex-shrink-0 cursor-pointer"
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => fileInputRef.current?.click()}
                title="Upload custom avatar"
              >
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.3)] overflow-hidden bg-slate-800 flex items-center justify-center">
                  {customAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customAvatarUrl}
                      alt="Commander avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-sm font-bold text-slate-300">AFE</span>
                  )}
                </div>
                {avatarHover && (
                  <div className="absolute inset-0 rounded-full bg-slate-950/75 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-cyan-300" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-slate-200">{ENGINEER_NAME}</p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Click avatar to upload a custom photo (JPG, PNG, WebP). Auto-cropped to 256x256.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          )}

          {/* Canvas Preview */}
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
              <span className="text-slate-200 font-bold truncate block">{ENGINEER_NAME}</span>
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

        {/* Modal Footer */}
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
              <span>DOWNLOAD CREDENTIAL PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};