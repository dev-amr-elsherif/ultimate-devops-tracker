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
  Upload,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

export const FloatingDock: React.FC = () => {
  const {
    isMounted,
    isCommander,
    setIsBadgeModalOpen,
    setIsSnapshotModalOpen,
    revokeCommander,
    isAudioMuted,
    toggleAudioMute,
    driveSyncStatus,
    driveUser,
    driveLastSyncedAt,
    connectDrive,
    disconnectDriveSession,
    syncDriveManual,
  } = useRoadmap();

  const safeIsCommander = isMounted ? isCommander : false;
  const safeDriveStatus = isMounted ? driveSyncStatus : "disconnected";

  return (
    <nav
      aria-label="Quick Actions Dock"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] sm:max-w-none transition-all"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 md:p-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] whitespace-nowrap">
        {/* 1. Holographic Clearance ID Button */}
        <button
          data-testid="clearance-badge-btn"
          aria-label="Generate Holographic Clearance ID Badge"
          onClick={() => {
            soundFx.playBlip(900);
            setIsBadgeModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
          title="Generate Holographic Clearance ID Badge"
        >
          <CreditCard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline tracking-wider">[ 🪪 ID CLEARANCE ]</span>
          <span className="sm:hidden tracking-wider text-[11px]">[ 🪪 ID ]</span>
        </button>

        {/* 2. Google Drive & Identity Sync */}
        {safeDriveStatus === "disconnected" && (
          <button
            data-testid="drive-connect-btn"
            aria-label="Connect Google Drive for cloud telemetry sync"
            onClick={connectDrive}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
            title="Connect Google Drive to enable cloud telemetry sync (appDataFolder)"
          >
            <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline tracking-wider">[ ☁️ CONNECT DRIVE ]</span>
            <span className="sm:hidden tracking-wider text-[11px]">[ ☁️ DRIVE ]</span>
          </button>
        )}

        {safeDriveStatus === "connecting" && (
          <div
            data-testid="drive-syncing-indicator"
            aria-label="Connecting to Google Drive"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-cyan-300 font-mono text-xs animate-pulse whitespace-nowrap shrink-0"
            title="Connecting to Google Drive..."
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
            <span className="hidden sm:inline tracking-wider">[ ☁️ AUTHENTICATING... ]</span>
            <span className="sm:hidden tracking-wider text-[11px]">[ ☁️ AUTH... ]</span>
          </div>
        )}

        {(safeDriveStatus === "synced" || safeDriveStatus === "syncing") && (
          <div
            data-testid="drive-synced-widget"
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl font-mono text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 whitespace-nowrap shrink-0"
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
              className={`flex items-center gap-1 px-1 sm:px-1.5 py-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none whitespace-nowrap ${
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
                  <span className="sm:hidden font-semibold tracking-wider text-[11px]">[ SYNC... ]</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="hidden sm:inline font-semibold tracking-wider">[ ☁️ DRIVE CONNECTED ]</span>
                  <span className="sm:hidden font-semibold tracking-wider text-[11px]">[ CONNECTED ]</span>
                </>
              )}
            </button>
            <button
              data-testid="drive-disconnect-btn"
              onClick={disconnectDriveSession}
              className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors ml-0.5 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              title="Disconnect Google Drive"
              aria-label="Disconnect Google Drive"
            >
              <CloudOff className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Snapshot Ingest Button */}
        <button
          data-testid="snapshot-dock-btn"
          aria-label="Ingest or import JSON telemetry snapshot"
          onClick={() => {
            soundFx.playBlip(750);
            setIsSnapshotModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
          title="Ingest / Import JSON Telemetry Snapshot"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline tracking-wider">[ 💾 SNAPSHOT ]</span>
          <span className="sm:hidden tracking-wider text-[11px]">[ 💾 ]</span>
        </button>

        {/* 4. Security Clearance Lock / Indicator */}
        {safeIsCommander ? (
          <button
            data-testid="mode-toggle-btn"
            onClick={revokeCommander}
            aria-label="Commander Mode Active. Click to revoke clearance."
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-emerald-100 transition-all font-mono text-xs font-bold border border-emerald-500/30 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none whitespace-nowrap shrink-0"
            title="Click to revoke Commander access and return to Observer Mode"
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
            onClick={connectDrive}
            aria-label="Observer Mode. Click to authenticate Commander via Google Identity."
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
            title="Click to authenticate as Commander with authorized Google account"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="tracking-wider text-[11px] sm:text-xs">
              <span className="hidden sm:inline">[ 🔒 </span>
              <span>OBSERVER MODE</span>
              <span className="hidden sm:inline"></span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hidden sm:inline">
              UNLOCK
            </span>
            <span className="hidden sm:inline">]</span>
          </button>
        )}

        {/* 5. Audio Mute Toggle */}
        <button
          onClick={() => {
            toggleAudioMute();
            soundFx.playBlip(700);
          }}
          className={`p-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none shrink-0 ${
            isAudioMuted
              ? "text-slate-400 hover:text-slate-200"
              : "text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40"
          }`}
          title={isAudioMuted ? "Audio Synthesizer Muted (Click to Unmute)" : "Audio Synthesizer Active (Click to Mute)"}
          aria-label="Toggle Sound"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
};
