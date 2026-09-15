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
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

export const HeaderHUD: React.FC = () => {
  const {
    isMounted,
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
    driveSyncStatus,
    driveUser,
    driveLastSyncedAt,
    connectDrive,
    disconnectDriveSession,
    syncDriveManual,
  } = useRoadmap();

  // Guard against SSR / Client hydration mismatch for localStorage state
  const safePercentage = isMounted ? completionPercentage : 0;
  const safeTasksCount = isMounted ? completedTasksCount : 0;
  const safePhasesCount = isMounted ? operationalPhasesCount : 0;
  const safeMilestonesCount = isMounted ? completedMilestonesCount : 0;
  const safeIsCommander = isMounted ? isCommander : false;
  const safeRank = isMounted
    ? clearanceRank
    : { title: "Cadet", level: 1, color: "text-slate-400", badge: "CR-01 // CADET" };
  const safeDriveStatus = isMounted ? driveSyncStatus : "disconnected";

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
          <span className="text-slate-400" suppressHydrationWarning>
            SECURITY CLEARANCE: <strong className={safeRank.color}>{safeRank.badge}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400" suppressHydrationWarning>
            CLOUD SYNC:{" "}
            <strong
              className={
                safeDriveStatus === "synced"
                  ? "text-emerald-400"
                  : safeDriveStatus === "connecting" || safeDriveStatus === "syncing"
                  ? "text-cyan-400"
                  : "text-slate-500"
              }
            >
              {safeDriveStatus.toUpperCase()}
            </strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400" suppressHydrationWarning>
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
          <div
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20 shadow-inner"
          >
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Progress</span>
              <span suppressHydrationWarning className="text-xs font-mono font-bold text-cyan-300">
                {safePercentage}%
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${safePercentage}%` }}
              />
            </div>
          </div>

          {/* Operational Phases */}
          <div
            suppressHydrationWarning
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Phases Complete</span>
              <span suppressHydrationWarning className="text-xs font-mono font-bold text-emerald-300">
                {safePhasesCount} <span className="text-slate-500 font-normal">/ 12</span>
              </span>
            </div>
          </div>

          {/* Tasks Done */}
          <div
            suppressHydrationWarning
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                safeIsCommander ? "bg-emerald-400" : "bg-cyan-400"
              } animate-pulse`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {safeIsCommander ? "Tasks Completed" : "Tasks Locked"}
              </span>
              <span suppressHydrationWarning className="text-xs font-mono font-bold text-slate-200">
                {safeTasksCount} <span className="text-slate-500 font-normal">/ {totalTasks}</span>
              </span>
            </div>
          </div>

          {/* Milestones Achieved */}
          <div
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20"
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Milestones</span>
              <span suppressHydrationWarning className="text-xs font-mono font-bold text-amber-300">
                {safeMilestonesCount} <span className="text-slate-500 font-normal">/ {totalMilestones}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Audio + Drive Sync + Commander Mode Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Google Drive Cloud Sync Widget */}
          {safeDriveStatus === "disconnected" && (
            <button
              data-testid="drive-connect-btn"
              onClick={connectDrive}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-all font-mono text-xs shadow-sm group"
              title="Connect Google Drive to enable cloud telemetry sync (appDataFolder)"
            >
              <Cloud className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden xl:inline font-semibold tracking-wider">[ ☁️ CONNECT DRIVE ]</span>
              <span className="xl:hidden font-semibold tracking-wider">DRIVE</span>
            </button>
          )}

          {(safeDriveStatus === "connecting" || safeDriveStatus === "syncing") && (
            <div
              data-testid="drive-syncing-indicator"
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs animate-pulse"
              title="Synchronizing telemetry with Google Drive..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span className="hidden xl:inline font-semibold tracking-wider">
                {safeDriveStatus === "connecting" ? "[ ☁️ AUTHENTICATING... ]" : "[ ☁️ SYNCING... ]"}
              </span>
              <span className="xl:hidden font-semibold tracking-wider">SYNCING</span>
            </div>
          )}

          {safeDriveStatus === "synced" && (
            <div
              data-testid="drive-synced-widget"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/40 font-mono text-xs shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              {driveUser?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={driveUser.picture}
                  alt={driveUser.name || "User"}
                  className="w-5 h-5 rounded-full border border-emerald-400/60 mr-0.5"
                />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-400 mr-0.5" />
              )}
              <button
                data-testid="drive-sync-manual-btn"
                onClick={syncDriveManual}
                className="flex items-center gap-1.5 px-1 py-1 text-emerald-300 hover:text-cyan-200 transition-colors group"
                title={`Drive Synced${driveUser?.email ? ` (${driveUser.email})` : ""}${driveLastSyncedAt ? ` at ${driveLastSyncedAt}` : ""}. Click to force sync.`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xl:inline font-semibold tracking-wider">[ ☁️ DRIVE SYNCED ]</span>
                <span className="xl:hidden font-semibold tracking-wider">SYNCED</span>
              </button>
              <button
                data-testid="drive-disconnect-btn"
                onClick={disconnectDriveSession}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-0.5"
                title="Disconnect Google Drive"
                aria-label="Disconnect Google Drive"
              >
                <CloudOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
          {safeIsCommander ? (
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
