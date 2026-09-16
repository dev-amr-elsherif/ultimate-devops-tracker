"use client";

import React from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Volume2,
  VolumeX,
  Lock,
  Unlock,
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
  const safeIsCommander = isMounted ? isCommander : false;
  const safeDriveStatus = isMounted ? driveSyncStatus : "disconnected";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl py-3 sm:py-4 px-3 sm:px-6 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* 1. Left Section: Restore Original Cyber Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs sm:text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0">
            &gt;_
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base font-mono font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline">ULTIMATE DEVOPS TRACKER</span>
                <span className="sm:hidden">DEVOPS</span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-semibold tracking-wider shrink-0">
                  PRO-SPEC
                </span>
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 hidden sm:block truncate">
              Zero-to-Hero Cloud Architecture &amp; Systems Mastery
            </p>
          </div>
        </div>

        {/* 2. Middle Section: Ultra-minimal Telemetry Readout */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-cyan-500/20 font-mono text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">PROGRESS:</span>
            <span className="text-cyan-300 font-bold" suppressHydrationWarning>
              {safePercentage}%
            </span>
            <div className="w-16 lg:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ width: `${safePercentage}%` }}
              />
            </div>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span suppressHydrationWarning>
              {safeIsCommander ? "Tasks Completed" : "Tasks Locked"}:
            </span>
            <span className="text-slate-200 font-bold" suppressHydrationWarning>
              {safeTasksCount} / {totalTasks}
            </span>
          </div>
        </div>

        {/* 3. Right Section: Sleek Action Controls Cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 border border-cyan-500/30 bg-slate-900/60 rounded-lg p-1 shrink-0">
          {/* 1. [ 🪪 ID CLEARANCE ] */}
          <button
            data-testid="clearance-badge-btn"
            aria-label="Generate Holographic Clearance ID Badge"
            onClick={() => {
              soundFx.playBlip(900);
              setIsBadgeModalOpen(true);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            title="Generate Holographic Clearance ID Badge"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline tracking-wider">[ 🪪 ID CLEARANCE ]</span>
          </button>

          {/* 2. [ ☁️ CONNECT DRIVE ] / [ ☁️ DRIVE CONNECTED ] */}
          {safeDriveStatus === "disconnected" && (
            <button
              data-testid="drive-connect-btn"
              aria-label="Connect Google Drive for cloud telemetry sync"
              onClick={connectDrive}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md hover:bg-cyan-950/50 text-slate-400 hover:text-cyan-300 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Connect Google Drive to enable cloud telemetry sync (appDataFolder)"
            >
              <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline tracking-wider">[ ☁️ CONNECT DRIVE ]</span>
            </button>
          )}

          {safeDriveStatus === "connecting" && (
            <div
              data-testid="drive-syncing-indicator"
              aria-label="Connecting to Google Drive"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-cyan-300 font-mono text-xs animate-pulse"
              title="Connecting to Google Drive..."
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
              <span className="hidden sm:inline tracking-wider">[ ☁️ AUTHENTICATING... ]</span>
            </div>
          )}

          {(safeDriveStatus === "synced" || safeDriveStatus === "syncing") && (
            <div
              data-testid="drive-synced-widget"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md font-mono text-xs text-emerald-300"
            >
              {driveUser?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={driveUser.picture}
                  alt={driveUser.name || "User"}
                  className="w-4 h-4 rounded-full border border-emerald-400/60 mr-0.5"
                />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400 mr-0.5 shrink-0" />
              )}
              <button
                data-testid="drive-sync-manual-btn"
                aria-label="Synchronize telemetry with Google Drive"
                onClick={syncDriveManual}
                disabled={safeDriveStatus === "syncing"}
                className={`flex items-center gap-1 px-1 sm:px-1.5 py-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
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
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                    <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ SYNCING... ]</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ DRIVE CONNECTED ]</span>
                  </>
                )}
              </button>
              <button
                data-testid="drive-disconnect-btn"
                onClick={disconnectDriveSession}
                className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors ml-0.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                title="Disconnect Google Drive"
                aria-label="Disconnect Google Drive"
              >
                <CloudOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. Audio Mute Toggle [ 🔊 / 🔇 ] */}
          <button
            onClick={() => {
              toggleAudioMute();
              soundFx.playBlip(700);
            }}
            className={`p-1.5 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              isAudioMuted
                ? "text-slate-500 hover:text-slate-300"
                : "text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40"
            }`}
            title={isAudioMuted ? "Audio Synthesizer Muted (Click to Unmute)" : "Audio Synthesizer Active (Click to Mute)"}
            aria-label="Toggle Sound"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* 4. Security Lock [ 🔒 OBSERVER MODE UNLOCK ] / [ 🔓 COMMANDER ACTIVE ] */}
          {safeIsCommander ? (
            <button
              data-testid="mode-toggle-btn"
              onClick={revokeCommander}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-100 transition-all font-mono text-xs font-bold border border-emerald-500/30 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              title="Click to switch back to Observer Mode"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline tracking-wider">[ 🔓 COMMANDER</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200">
                ACTIVE
              </span>
              <span className="hidden sm:inline">]</span>
            </button>
          ) : (
            <button
              data-testid="mode-toggle-btn"
              onClick={() => {
                soundFx.playBlip(900);
                setIsPasscodeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              title="Click or press Ctrl+Shift+A to authenticate as Commander"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline tracking-wider">[ 🔒 OBSERVER MODE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                UNLOCK
              </span>
              <span className="hidden sm:inline">]</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
