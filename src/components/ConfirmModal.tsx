"use client";

import React, { useEffect } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { soundFx } from "@/lib/audio";

export const ConfirmModal: React.FC = () => {
  const { isResetModalOpen, setIsResetModalOpen, resetProgress } = useRoadmap();

  // Play synthesized error/warning audio FX when opened
  useEffect(() => {
    if (isResetModalOpen) {
      soundFx.playErrorBuzz();
    }
  }, [isResetModalOpen]);

  // Keyboard navigation: Escape key dismisses modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isResetModalOpen) {
        setIsResetModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetModalOpen, setIsResetModalOpen]);

  if (!isResetModalOpen) return null;

  const handleCancel = () => {
    soundFx.playBlip(500);
    setIsResetModalOpen(false);
  };

  const handleConfirm = () => {
    resetProgress();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="purge-dialog-title"
      aria-describedby="purge-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#050814]/95 backdrop-blur-xl border border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.25)] animate-in zoom-in-95 duration-200">
        {/* Header reticle & close button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/50 text-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.4)] shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3
                id="purge-dialog-title"
                className="text-xs sm:text-sm font-mono font-bold tracking-wider text-rose-400 uppercase"
              >
                CRITICAL TELEMETRY PURGE PROTOCOL
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                IRREVERSIBLE SYSTEM ACTION // AUTHORIZATION REQUIRED
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            aria-label="Close purge confirmation dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div id="purge-dialog-description" className="space-y-3 mb-6 font-mono text-xs text-slate-300">
          <p className="leading-relaxed">
            You are about to purge all local mission progress. This operation will irrevocably zero out:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <li>132 tracked engineering task completions</li>
            <li>13 defended milestone project certifications</li>
            <li>All attached Proof-of-Work artifact evidence &amp; URLs</li>
            <li>Local browser telemetry caches &amp; execution logs</li>
          </ul>
          <p className="text-[11px] text-rose-400 font-semibold">
            WARNING: This telemetry data cannot be recovered unless backed up to Google Drive or exported as a JSON snapshot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            data-testid="cancel-purge-btn"
            type="button"
            onClick={handleCancel}
            aria-label="Cancel and abort telemetry purge"
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 font-mono text-xs text-slate-300 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            [ CANCEL / ABORT ]
          </button>
          <button
            data-testid="confirm-purge-btn"
            type="button"
            onClick={handleConfirm}
            aria-label="Confirm and purge all roadmap telemetry data"
            className="flex-1 py-2.5 rounded-xl border border-rose-500 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            [ PURGE ALL DATA ]
          </button>
        </div>
      </div>
    </div>
  );
};
