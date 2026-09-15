"use client";

import React from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Volume2,
  VolumeX,
  Activity,
  Terminal,
  Trophy,
  CheckSquare,
  Lock,
  Unlock,
  Radio,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

export const HeaderHUD: React.FC = () => {
  const {
    isCommander,
    setIsPasscodeModalOpen,
    revokeCommander,
    completionPercentage,
    completedTasksCount,
    totalTasks,
    operationalPhasesCount,
    completedMilestonesCount,
    totalMilestones,
    clearanceRank,
    isAudioMuted,
    toggleAudioMute,
  } = useRoadmap();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top telemetry status line */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-slate-900/60 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
            LIVE TELEMETRY STREAM
          </span>
          <span className="text-slate-600">|</span>
          <span>SYSTEM PROTOCOL: ZERO-TO-HERO v2.4</span>
          <span className="text-slate-600">|</span>
          <span>TOTAL TIME BUDGET: 29 WEEKS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            SECURITY CLEARANCE: <strong className={clearanceRank.color}>{clearanceRank.badge}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            AUDIO SYNTH:{" "}
            <strong className={isAudioMuted ? "text-rose-400" : "text-emerald-400"}>
              {isAudioMuted ? "OFFLINE" : "ONLINE"}
            </strong>
          </span>
        </div>
      </div>

      {/* Main HUD Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Mission Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                ULTIMATE DEVOPS TRACKER
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                PRO-SPEC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Zero-to-Hero Cloud Architecture & Systems Mastery
            </p>
          </div>
        </div>

        {/* Telemetry HUD Blocks */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
          {/* Overall Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20 shadow-inner">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Progress</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {completionPercentage}%
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Operational Phases */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Phases Complete</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {operationalPhasesCount} <span className="text-slate-500 font-normal">/ 12</span>
              </span>
            </div>
          </div>

          {/* Tasks Done */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div
              className={`w-2 h-2 rounded-full ${
                isCommander ? "bg-emerald-400" : "bg-cyan-400"
              } animate-pulse`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {isCommander ? "Tasks Completed" : "Tasks Locked"}
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {completedTasksCount} <span className="text-slate-500 font-normal">/ {totalTasks}</span>
              </span>
            </div>
          </div>

          {/* Milestones Achieved */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Milestones</span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {completedMilestonesCount} <span className="text-slate-500 font-normal">/ {totalMilestones}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Audio + Commander Mode Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Audio toggle button */}
          <button
            onClick={() => {
              toggleAudioMute();
              soundFx.playBlip(700);
            }}
            className={`p-2 rounded-lg border transition-all ${
              isAudioMuted
                ? "bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            }`}
            title={isAudioMuted ? "Audio Synthesizer Muted (Click to Unmute)" : "Audio Synthesizer Active (Click to Mute)"}
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Commander Mode Toggle Button */}
          {isCommander ? (
            <button
              data-testid="mode-toggle-btn"
              onClick={revokeCommander}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-300 transition-all font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,255,157,0.25)]"
              title="Click to switch back to Observer Mode"
            >
              <Unlock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">COMMANDER MODE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200">
                ACTIVE
              </span>
            </button>
          ) : (
            <button
              data-testid="mode-toggle-btn"
              onClick={() => {
                soundFx.playBlip(900);
                setIsPasscodeModalOpen(true);
              }}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-400 hover:text-cyan-200 transition-all font-mono text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)]"
              title="Click or press Ctrl+Shift+A to authenticate as Commander"
            >
              <Lock className="w-4 h-4 text-cyan-400 group-hover:text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">OBSERVER MODE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                UNLOCK
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
