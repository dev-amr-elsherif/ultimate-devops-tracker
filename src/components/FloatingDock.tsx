"use client";

import React from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Volume2,
  VolumeX,
  Lock,
  ShieldCheck,
  Cloud,
  Loader2,
  LogOut,
  CreditCard,
  Database,
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
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
          title="Generate Holographic Clearance ID Badge"
        >
          <CreditCard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline tracking-wider">ID Clearance</span>
          <span className="sm:hidden tracking-wider text-[11px]">ID</span>
        </button>

        {/* 2. Unified Identity & Drive Sync Pill */}
        {safeIsCommander ? (
          /* State B: Authenticated Commander */
          <div
            data-testid="drive-synced-widget"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] whitespace-nowrap shrink-0 transition-all"
          >
            {driveUser?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={driveUser.picture}
                alt={driveUser.name || "Commander"}
                className="w-5 h-5 rounded-full border border-emerald-400/80 shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-900/80 border border-emerald-400/80 flex items-center justify-center shrink-0 text-[10px] font-bold text-emerald-200">
                {driveUser?.name ? driveUser.name.charAt(0).toUpperCase() : "C"}
              </div>
            )}
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <button
              data-testid="drive-sync-manual-btn"
              onClick={syncDriveManual}
              disabled={safeDriveStatus === "syncing"}
              aria-label="Synchronize telemetry with Google Drive"
              className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                safeDriveStatus === "syncing"
                  ? "text-cyan-300 cursor-wait"
                  : "text-emerald-300 hover:text-emerald-100"
              }`}
              title={
                safeDriveStatus === "syncing"
                  ? "Synchronizing telemetry with Google Drive..."
                  : `Commander Active${driveUser?.email ? ` (${driveUser.email})` : ""}${
                      driveLastSyncedAt ? ` • Last backup: ${driveLastSyncedAt}` : ""
                    }. Click to backup telemetry to Drive.`
              }
            >
              <span className="font-bold tracking-wider text-emerald-200 text-xs hidden sm:inline">
                Commander
              </span>
              <span className="font-bold tracking-wider text-emerald-200 text-[11px] sm:hidden">
                Cmdr
              </span>
              {safeDriveStatus === "syncing" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0 ml-0.5" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-400 hover:text-cyan-300 shrink-0 ml-0.5" />
              )}
            </button>
            <button
              data-testid="drive-disconnect-btn"
              onClick={revokeCommander}
              aria-label="Disconnect session and revert to Observer Mode"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              title="Disconnect session and revert to Observer Mode"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : safeDriveStatus === "synced" || safeDriveStatus === "syncing" || driveUser ? (
          /* State C: Authenticated Non-Commander (Guest Google Account) */
          <div
            data-testid="drive-synced-widget"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs text-slate-300 bg-slate-900/70 border border-cyan-500/30 whitespace-nowrap shrink-0 transition-all"
          >
            {driveUser?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={driveUser.picture}
                alt={driveUser.name || "User"}
                className="w-5 h-5 rounded-full border border-cyan-400/60 shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-cyan-400/60 flex items-center justify-center shrink-0 text-[10px] font-bold text-cyan-300">
                {driveUser?.name ? driveUser.name.charAt(0).toUpperCase() : "O"}
              </div>
            )}
            <button
              data-testid="drive-sync-manual-btn"
              onClick={syncDriveManual}
              disabled={safeDriveStatus === "syncing"}
              aria-label="Synchronize telemetry with Google Drive"
              className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                safeDriveStatus === "syncing"
                  ? "text-cyan-300 cursor-wait"
                  : "text-slate-300 hover:text-cyan-200"
              }`}
              title={
                safeDriveStatus === "syncing"
                  ? "Synchronizing telemetry with Google Drive..."
                  : `Drive Connected${driveUser?.email ? ` (${driveUser.email})` : ""}${
                      driveLastSyncedAt ? ` • Last backup: ${driveLastSyncedAt}` : ""
                    }. Click to backup telemetry to Drive.`
              }
            >
              <span className="font-semibold tracking-wider text-slate-300 text-xs">
                Observer
              </span>
              {safeDriveStatus === "syncing" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0 ml-0.5" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-cyan-400 hover:text-cyan-200 shrink-0 ml-0.5" />
              )}
            </button>
            <button
              data-testid="drive-disconnect-btn"
              onClick={disconnectDriveSession}
              aria-label="Disconnect Google Drive"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
              title="Disconnect Google Drive"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : safeDriveStatus === "connecting" ? (
          /* State A (Connecting): Authenticating */
          <div
            data-testid="drive-syncing-indicator"
            aria-label="Connecting to Google Drive"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-cyan-300 font-mono text-xs animate-pulse whitespace-nowrap shrink-0"
            title="Connecting to Google Drive..."
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
            <span className="hidden sm:inline tracking-wider">AUTHENTICATING...</span>
            <span className="sm:hidden tracking-wider text-[11px]">AUTH...</span>
          </div>
        ) : (
          /* State A: Logged Out / Observer (Default) */
          <button
            data-testid="auth-mode-btn"
            aria-label="Observer Mode. Click to sign in with Google."
            onClick={connectDrive}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
            title="Observer Mode. Click to sign in with Google."
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="tracking-wider text-[11px] sm:text-xs">Observer Mode</span>
          </button>
        )}

        {/* 3. Snapshot Ingest Button */}
        <button
          data-testid="snapshot-dock-btn"
          aria-label="Ingest or import JSON telemetry snapshot"
          onClick={() => {
            soundFx.playBlip(750);
            setIsSnapshotModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/50 text-slate-300 hover:text-cyan-300 transition-all font-mono text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap shrink-0"
          title="Ingest / Import JSON Telemetry Snapshot"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline tracking-wider">Snapshot</span>
          <span className="sm:hidden tracking-wider text-[11px]">Snapshot</span>
        </button>

        {/* 4. Audio Mute Toggle */}
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
          title={
            isAudioMuted
              ? "Audio Synthesizer Muted (Click to Unmute)"
              : "Audio Synthesizer Active (Click to Mute)"
          }
          aria-label="Toggle Sound"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
};
