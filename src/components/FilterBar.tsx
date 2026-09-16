"use client";

import React from "react";
import { useRoadmap, FilterCategory } from "@/context/RoadmapContext";
import { Search, Download, RotateCcw, Filter, Layers, Zap, Trophy, Upload } from "lucide-react";
import { soundFx } from "@/lib/audio";

export const FilterBar: React.FC = () => {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    isCommander,
    exportSnapshot,
    resetProgress,
    setIsPasscodeModalOpen,
    setIsSnapshotModalOpen,
  } = useRoadmap();

  const handleFilterClick = (cat: FilterCategory) => {
    soundFx.playBlip(620);
    setActiveFilter(cat);
  };

  const handleResetClick = () => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      setIsPasscodeModalOpen(true);
      return;
    }
    if (confirm("WARNING: Are you certain you wish to purge all recorded roadmap telemetry? This cannot be undone.")) {
      resetProgress();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 backdrop-blur-md">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands, modules, tags (e.g. bash, docker, eks, iptables)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300 font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter categories buttons */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Roadmap filter options">
          <button
            onClick={() => handleFilterClick("all")}
            aria-pressed={activeFilter === "all"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              activeFilter === "all"
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            ALL PHASES
          </button>

          <button
            onClick={() => handleFilterClick("sequential")}
            aria-pressed={activeFilter === "sequential"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              activeFilter === "sequential"
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-bold"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            SEQUENTIAL ONLY
          </button>

          <button
            onClick={() => handleFilterClick("parallel")}
            aria-pressed={activeFilter === "parallel"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none ${
              activeFilter === "parallel"
                ? "bg-violet-500/20 border border-violet-400 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)] font-bold"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            PARALLEL TRACKS
          </button>

          <button
            onClick={() => handleFilterClick("milestones")}
            aria-pressed={activeFilter === "milestones"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeFilter === "milestones"
                ? "bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            MILESTONES ONLY
          </button>
        </div>

        {/* Snapshot export, ingest & reset utilities */}
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
          <button
            data-testid="export-snapshot-btn"
            onClick={exportSnapshot}
            aria-label="Export and download JSON snapshot of current progress"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            title="Download JSON Snapshot of current progress"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT</span>
          </button>

          <button
            data-testid="ingest-snapshot-btn"
            onClick={() => {
              soundFx.playBlip(750);
              setIsSnapshotModalOpen(true);
            }}
            aria-label="Ingest or import JSON telemetry snapshot"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            title="Ingest / Import JSON Telemetry Snapshot"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">INGEST</span>
          </button>

          <button
            data-testid="reset-progress-btn"
            onClick={handleResetClick}
            aria-label="Purge progress metrics (Requires Commander Mode)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-mono text-xs transition-all focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            title="Purge progress metrics (Requires Commander Mode)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
