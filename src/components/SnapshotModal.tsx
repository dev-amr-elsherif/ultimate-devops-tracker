"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRoadmap, TelemetrySnapshot, RoadmapFullSnapshot } from "@/context/RoadmapContext";
import { Upload, FileUp, X, CheckCircle2, AlertTriangle, FileJson, ShieldAlert } from "lucide-react";
import { soundFx } from "@/lib/audio";

function isFullSnapshot(snapshot: TelemetrySnapshot): snapshot is RoadmapFullSnapshot {
  return "schemaVersion" in snapshot && snapshot.schemaVersion === "2.1.0";
}

export const SnapshotModal: React.FC = () => {
  const {
    isSnapshotModalOpen,
    setIsSnapshotModalOpen,
    isCommander,
    connectDrive,
    importSnapshot,
    promptResetProgress,
  } = useRoadmap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSnapshotModalOpen) {
        setIsSnapshotModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSnapshotModalOpen, setIsSnapshotModalOpen]);

  if (!isSnapshotModalOpen) return null;

  return (
    <SnapshotDialog
      isCommander={isCommander}
      onClose={() => setIsSnapshotModalOpen(false)}
      onPromptAuth={() => {
        setIsSnapshotModalOpen(false);
        connectDrive();
      }}
      onPromptReset={() => {
        setIsSnapshotModalOpen(false);
        promptResetProgress();
      }}
      onImport={importSnapshot}
    />
  );
};

interface SnapshotDialogProps {
  isCommander: boolean;
  onClose: () => void;
  onPromptAuth: () => void;
  onPromptReset: () => void;
  onImport: (input: string | TelemetrySnapshot) => boolean;
}

const SnapshotDialog: React.FC<SnapshotDialogProps> = ({
  isCommander,
  onClose,
  onPromptAuth,
  onPromptReset,
  onImport,
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedPreview, setParsedPreview] = useState<TelemetrySnapshot | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleJsonChange = (text: string) => {
    setJsonInput(text);
    if (!text.trim()) {
      setParsedPreview(null);
      setParseError(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid snapshot format: Expected a JSON object.");
      }

      let taskIds: string[] | undefined;
      let milestoneIds: string[] | undefined;

      if (parsed.state && typeof parsed.state === "object") {
        if (Array.isArray(parsed.state.completedTaskIds)) taskIds = parsed.state.completedTaskIds;
        if (Array.isArray(parsed.state.completedMilestoneIds)) milestoneIds = parsed.state.completedMilestoneIds;
      }

      if (!taskIds) {
        if (Array.isArray(parsed.completedTaskIds)) taskIds = parsed.completedTaskIds;
        else if (Array.isArray(parsed.completedTasks)) taskIds = parsed.completedTasks;
      }

      if (!milestoneIds) {
        if (Array.isArray(parsed.completedMilestoneIds)) milestoneIds = parsed.completedMilestoneIds;
        else if (Array.isArray(parsed.completedMilestones)) milestoneIds = parsed.completedMilestones;
      }

      if (!taskIds || !milestoneIds) {
        throw new Error("Missing completedTaskIds or completedMilestoneIds arrays.");
      }

      setParsedPreview(parsed);
      setParseError(null);
    } catch (err) {
      setParsedPreview(null);
      setParseError(err instanceof Error ? err.message : "Invalid JSON syntax.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playBlip(750);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleJsonChange(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCommander) {
      onPromptAuth();
      return;
    }
    if (!parsedPreview) return;
    onImport(parsedPreview);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-xl cyber-card border border-cyan-500/40 shadow-2xl bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400">
                Telemetry Snapshot Ingest
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                DATA RESTORATION PROTOCOL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCommander && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2 text-rose-300 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <span className="font-bold">COMMANDER CLEARANCE REQUIRED:</span> You can preview
              snapshots, but must authenticate as Commander to ingest and persist state.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload JSON snapshot file"
            className="border-2 border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-900/60 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-cyan-950/20 group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileJson className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
            <div className="text-xs font-mono text-slate-300 group-hover:text-cyan-200">
              {fileName ? (
                <span className="text-cyan-300 font-bold">Selected: {fileName}</span>
              ) : (
                <span>Click to browse or drop .json snapshot file</span>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Supports Full Telemetry Snapshot v2.1.0 & Legacy Payloads
            </div>
          </div>

          {/* Raw JSON Textarea */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              OR PASTE RAW JSON SNAPSHOT PAYLOAD:
            </label>
            <textarea
              data-testid="snapshot-textarea"
              rows={4}
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder='{"version": "1.0", "completedTaskIds": ["task-0.1.1"], ...}'
              className="w-full p-3 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg text-xs font-mono text-cyan-200 placeholder:text-slate-600 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Parse error warning */}
          {parseError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>SCHEMA ERROR: {parseError}</span>
            </div>
          )}

          {/* Snapshot Preview Metadata */}
          {parsedPreview && (() => {
            let taskCount = 0;
            let milestoneCount = 0;
            let rank = "Cadet";
            let progress = 0;
            let schema = "1.0";

            if (isFullSnapshot(parsedPreview)) {
              taskCount = parsedPreview.state.completedTaskIds.length;
              milestoneCount = parsedPreview.state.completedMilestoneIds.length;
              rank = parsedPreview.telemetry.clearanceRank;
              progress = parsedPreview.telemetry.completionPercentage;
              schema = parsedPreview.schemaVersion;
            } else {
              taskCount =
                parsedPreview.completedTaskIds?.length ??
                parsedPreview.completedTasks?.length ??
                parsedPreview.state?.completedTaskIds?.length ??
                0;
              milestoneCount =
                parsedPreview.completedMilestoneIds?.length ??
                parsedPreview.completedMilestones?.length ??
                parsedPreview.state?.completedMilestoneIds?.length ??
                0;
              rank = parsedPreview.clearanceRank || "N/A";
              progress = parsedPreview.progressPercentage ?? 0;
              schema = parsedPreview.schemaVersion || parsedPreview.version || "1.0";
            }

            return (
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="text-cyan-400 font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>VALID SNAPSHOT DETECTED</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">
                    v{schema}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Tasks: </span>
                    <span className="text-slate-200 font-bold">{taskCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Milestones: </span>
                    <span className="text-slate-200 font-bold">{milestoneCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Rank: </span>
                    <span className="text-amber-400 font-bold">{rank}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Progress: </span>
                    <span className="text-emerald-400 font-bold">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 font-mono text-xs text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              CANCEL
            </button>

            {isCommander ? (
              <button
                data-testid="snapshot-submit-btn"
                type="submit"
                disabled={!parsedPreview}
                aria-label="Ingest and apply telemetry snapshot"
                className={`flex-1 py-2.5 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  parsedPreview
                    ? "border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
                    : "border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed"
                }`}
              >
                <Upload className="w-4 h-4" />
                INGEST TELEMETRY
              </button>
            ) : (
              <button
                type="button"
                onClick={onPromptAuth}
                className="flex-1 py-2.5 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              >
                UNLOCK COMMANDER MODE
              </button>
            )}
          </div>
        </form>

        {/* Danger Zone: Purge Telemetry */}
        <div className="mt-5 pt-4 border-t border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>DANGER ZONE</span>
          </div>
          <button
            data-testid="reset-progress-btn"
            type="button"
            onClick={() => {
              onClose();
              onPromptReset();
            }}
            aria-label="Purge progress metrics (Requires Commander Mode)"
            className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 font-mono text-xs transition-all focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            title="Purge progress metrics (Requires Commander Mode)"
          >
            PURGE TELEMETRY
          </button>
        </div>
      </div>
    </div>
  );
};
