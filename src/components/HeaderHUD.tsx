"use client";

import React from "react";
import { useRoadmap } from "@/context/RoadmapContext";

export const HeaderHUD: React.FC = () => {
  const {
    isMounted,
    isCommander,
    completionPercentage,
    completedTasksCount,
    totalTasks,
  } = useRoadmap();

  // Guard against SSR / Client hydration mismatch for localStorage state
  const safePercentage = isMounted ? completionPercentage : 0;
  const safeTasksCount = isMounted ? completedTasksCount : 0;
  const safeIsCommander = isMounted ? isCommander : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl py-2.5 sm:py-3 px-3 sm:px-6 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Left Section: Sleek Cyber Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0">
            &gt;_
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-[11px] sm:text-sm md:text-base font-mono font-bold tracking-tight text-white whitespace-nowrap flex items-center gap-1 sm:gap-2">
                <span>ULTIMATE DEVOPS TRACKER</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-semibold tracking-wider shrink-0">
                  PRO-SPEC
                </span>
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 hidden lg:block whitespace-nowrap">
              Zero-to-Hero Cloud Architecture &amp; Systems Mastery
            </p>
          </div>
        </div>

        {/* 2. Right Section: Unified Minimal High-Tech Telemetry Readout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/70 border border-cyan-500/20 font-mono text-[11px] sm:text-xs shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-slate-400">PROGRESS:</span>
            <span className="text-cyan-300 font-bold" suppressHydrationWarning>
              {safePercentage}%
            </span>
            <div className="hidden sm:block w-16 lg:w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ width: `${safePercentage}%` }}
              />
            </div>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span suppressHydrationWarning>
              {safeIsCommander ? "Tasks Completed" : "Tasks Locked"}:
            </span>
            <span className="text-slate-200 font-bold" suppressHydrationWarning>
              {safeTasksCount} / {totalTasks}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
