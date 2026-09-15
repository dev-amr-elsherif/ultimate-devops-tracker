"use client";

import React from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { ShieldAlert, CheckCircle2, Info, Trophy, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRoadmap();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isDenied = toast.type === "denied";
        const isSuccess = toast.type === "success";
        const isMilestone = toast.type === "milestone";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in slide-in-from-right-5 ${
              isDenied
                ? "bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-900/40"
                : isSuccess
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/40"
                : isMilestone
                ? "bg-cyan-950/90 border-cyan-400/60 text-cyan-100 shadow-cyan-900/40 border-glow-cyan"
                : "bg-slate-900/90 border-cyan-500/30 text-slate-200"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isDenied && <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />}
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isMilestone && <Trophy className="w-5 h-5 text-cyan-300 animate-bounce" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold tracking-wider uppercase">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
