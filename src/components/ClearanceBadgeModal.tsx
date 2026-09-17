"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { X, Download, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import { soundFx } from "@/lib/audio";
import { renderClearanceBadgeCanvas } from "@/lib/canvasId";

const ENGINEER_NAME = "Amr Fathy Elsherif";

export const ClearanceBadgeModal: React.FC = () => {
  const {
    isBadgeModalOpen,
    setIsBadgeModalOpen,
    completionPercentage,
    completedTasksCount,
    totalTasks,
    totalMilestones,
    completedMilestonesCount,
    clearanceRank,
    addToast,
    isCommander,
    customAvatarUrl,
    updateCustomAvatar,
  } = useRoadmap();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

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
    return () => {
      cleanupCanvas();
    };
  }, [cleanupCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBadgeModalOpen) closeDialog();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBadgeModalOpen, closeDialog]);

  const renderBadge = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      await renderClearanceBadgeCanvas(canvas, {
        engineerName: ENGINEER_NAME,
        globalProgress: completionPercentage,
        completedItems: completedTasksCount,
        totalItems: totalTasks,
        verifiedArtifacts: completedMilestonesCount,
        customAvatarUrl,
      });
    } catch (err) {
      console.error("Failed to render canvas badge:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [
    completionPercentage,
    completedTasksCount,
    totalTasks,
    completedMilestonesCount,
    customAvatarUrl,
  ]);

  useEffect(() => {
    if (isBadgeModalOpen) {
      const timer = setTimeout(() => {
        renderBadge();
      }, 50);
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
            curriculum progress, completed topics, defended milestones, and verified proof-of-work
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
              <span className="text-emerald-400 font-bold block">{completedMilestonesCount} / {totalMilestones} Verified</span>
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