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
  CreditCard,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

export const HeaderHUD: React.FC = () => {
  const {
    isMounted,
    isCommander,
    setIsPasscodeModalOpen,
    setIsBadgeModalOpen,
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
              {safeDriveStatus === "synced"
                ? "CONNECTED"
                : safeDriveStatus === "syncing"
                ? "SYNCING"
                : safeDriveStatus === "connecting"
                ? "AUTHENTICATING"
                : "DISCONNECTED"}
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

      {/* Main Command Center Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
        {/* Left: Branding & Core Mode */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base lg:text-lg font-mono font-bold tracking-tight text-white flex items-center gap-1.5">
                <span className="hidden xs:inline sm:inline">DEVOPS ARCHITECT</span>
                <span className="sm:hidden xs:hidden">DEVOPS</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-normal shrink-0">
                  v2.4
                </span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block truncate">
              Continuous Zero-to-Hero Cloud Infrastructure Roadmap
            </p>
          </div>
        </div>

        {/* Center: Real-time Telemetry Stats (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Overall Completion Progress */}
          <div
            suppressHydrationWarning
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20"
          >
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col min-w-[120px]">
              <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                <span>Progress</span>
                <span suppressHydrationWarning className="text-cyan-300 font-bold">{safePercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  style={{ width: `${safePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Operational Phases Count */}
          <div
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/20"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400">Phases Online</span>
              <span suppressHydrationWarning className="text-xs font-mono font-bold text-emerald-300">
                {safePhasesCount} <span className="text-slate-500 font-normal">/ 12</span>
              </span>
            </div>
          </div>

          {/* Granular Tasks Count */}
          <div
            suppressHydrationWarning
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/20"
          >
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
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

        {/* Action Controls: Badge + Drive Sync + Audio + Commander Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Holographic Clearance ID Generator Button */}
          <button
            data-testid="clearance-badge-btn"
            aria-label="Generate Holographic Clearance ID Badge"
            onClick={() => {
              soundFx.playBlip(900);
              setIsBadgeModalOpen(true);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 transition-all font-mono text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none group"
            title="Generate Holographic Clearance ID Badge for LinkedIn & Portfolio"
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline font-semibold tracking-wider">[ 🪪 ID CLEARANCE ]</span>
            <span className="sm:hidden font-mono">[ 🪪 ID ]</span>
          </button>

          {/* Google Drive Cloud Sync Widget */}
          {safeDriveStatus === "disconnected" && (
            <button
              data-testid="drive-connect-btn"
              aria-label="Connect Google Drive for cloud telemetry sync"
              onClick={connectDrive}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-all font-mono text-xs shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none group"
              title="Connect Google Drive to enable cloud telemetry sync (appDataFolder)"
            >
              <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ CONNECT DRIVE ]</span>
            </button>
          )}

          {safeDriveStatus === "connecting" && (
            <div
              data-testid="drive-syncing-indicator"
              aria-label="Connecting to Google Drive"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs animate-pulse"
              title="Connecting to Google Drive..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ AUTHENTICATING... ]</span>
            </div>
          )}

          {(safeDriveStatus === "synced" || safeDriveStatus === "syncing") && (
            <div
              data-testid="drive-synced-widget"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/40 font-mono text-xs shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              {driveUser?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={driveUser.picture}
                  alt={driveUser.name || "User"}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-emerald-400/60 mr-0.5"
                />
              ) : (
                <Cloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 mr-0.5" />
              )}
              <button
                data-testid="drive-sync-manual-btn"
                aria-label="Synchronize telemetry with Google Drive"
                onClick={syncDriveManual}
                disabled={safeDriveStatus === "syncing"}
                className={`flex items-center gap-1 sm:gap-1.5 px-1 py-1 transition-colors group focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  safeDriveStatus === "syncing"
                    ? "text-cyan-300 cursor-wait"
                    : "text-emerald-300 hover:text-cyan-200"
                }`}
                title={
                  safeDriveStatus === "syncing"
                    ? "Synchronizing telemetry with Google Drive..."
                    : `Drive Connected${driveUser?.email ? ` (${driveUser.email})` : ""}${
                        driveLastSyncedAt ? ` • Last backup: ${driveLastSyncedAt}` : ""
                      }. Click to backup telemetry.`
                }
              >
                {safeDriveStatus === "syncing" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ SYNCING... ]</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ DRIVE CONNECTED ]</span>
                  </>
                )}
              </button>
              <button
                data-testid="drive-disconnect-btn"
                onClick={disconnectDriveSession}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-0.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
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
            className={`p-1.5 sm:p-2 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              isAudioMuted
                ? "bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            }`}
            title={isAudioMuted ? "Audio Synthesizer Muted (Click to Unmute)" : "Audio Synthesizer Active (Click to Mute)"}
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Commander Mode Toggle Button */}
          {safeIsCommander ? (
            <button
              data-testid="mode-toggle-btn"
              onClick={revokeCommander}
              className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-950/40 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-300 transition-all font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,255,157,0.25)] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              title="Click to switch back to Observer Mode"
            >
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
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
              className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-400 hover:text-cyan-200 transition-all font-mono text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.15)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Click or press Ctrl+Shift+A to authenticate as Commander"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-cyan-200 group-hover:scale-110 transition-transform shrink-0" />
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
