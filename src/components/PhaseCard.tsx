"use client";

import React, { useState } from "react";
import { Phase } from "@/types/roadmap";
import { useRoadmap } from "@/context/RoadmapContext";
import { TaskItem } from "./TaskItem";
import { MilestoneCard } from "./MilestoneCard";
import {
  Terminal,
  Cpu,
  Boxes,
  Activity,
  FolderTree,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface PhaseCardProps {
  phase: Phase;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const { isMounted, completedTaskIds, completedMilestoneIds, addToast } = useRoadmap();

  // Phase Topics Telemetry
  const phaseTopics = phase.deepDiveTopics.flatMap((m) => m.topics);
  const totalPhaseTopics = phaseTopics.length;
  const completedPhaseTopics = isMounted
    ? phaseTopics.filter((t) => completedTaskIds.has(t.id)).length
    : 0;
  const phasePercent =
    totalPhaseTopics > 0 ? Math.round((completedPhaseTopics / totalPhaseTopics) * 100) : 0;

  const isMilestoneDone = isMounted
    ? completedMilestoneIds.has(phase.phaseId) ||
      completedMilestoneIds.has(`${phase.phaseId}-milestone`) ||
      phase.milestoneDeliverables.isVerified
    : false;

  const isFullyDefended = isMounted && phasePercent === 100 && isMilestoneDone;

  // Accordion state for modules: all modules open by default for full visibility
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    phase.deepDiveTopics.forEach((_, mIdx) => {
      initialState[`${phase.phaseId}-m${mIdx}`] = true;
    });
    return initialState;
  });

  // Recon Academy Coursera Drawer State
  const [isReconOpen, setIsReconOpen] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  const toggleModule = (modKey: string) => {
    soundFx.playBlip(600);
    setOpenModules((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  const handleCopyQuery = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playBlip(900);
    navigator.clipboard.writeText(query).then(() => {
      setCopiedQuery(query);
      addToast({
        type: "info",
        title: "QUERY COPIED",
        description: `"${query}" copied to clipboard.`,
      });
      setTimeout(() => setCopiedQuery(null), 2000);
    });
  };

  const isParallel = phase.trackType === "parallel";

  return (
    <div
      id={phase.phaseId}
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 cyber-card border ${
        isFullyDefended
          ? "border-emerald-500/60 bg-slate-950/95 shadow-[0_0_30px_rgba(16,185,129,0.2)] border-glow-green"
          : isParallel
          ? "border-violet-500/30 bg-slate-950/85 hover:border-violet-500/50"
          : "border-cyan-500/25 bg-slate-950/85 hover:border-cyan-500/50"
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              isFullyDefended
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : isParallel
                ? "bg-violet-950/40 border-violet-500/40 text-violet-300"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
            }`}
          >
            {isParallel ? (
              <Boxes className="w-6 h-6" />
            ) : phase.phaseOrder === 1 ? (
              <Terminal className="w-6 h-6" />
            ) : phase.phaseOrder >= 7 ? (
              <Cpu className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
          </div>

          <div>
            {/* Meta Tags: Phase Number, Track Type, Parallel With Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                PHASE {phase.phaseOrder.toString().padStart(2, "0")}
              </span>

              {/* Track Type Badge */}
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isParallel
                    ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                    : "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                }`}
              >
                {isParallel ? "PARALLEL SPECIALIZATION" : "SEQUENTIAL FOUNDATION"}
              </span>

              {/* Glowing Cyan Badge: PARALLEL WITH: [PHASE-ID] */}
              {phase.parallelWith && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.45)]">
                  <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                  <span>PARALLEL WITH: {phase.parallelWith.toUpperCase()}</span>
                </span>
              )}

              {/* Fully Defended Badge */}
              {isFullyDefended && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% DEFENDED</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              {phase.title}
            </h2>
          </div>
        </div>

        {/* Phase Telemetry Progress Gauge */}
        <div className="flex items-center gap-4 self-end lg:self-center bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl min-w-[200px]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>PROGRESS</span>
              <span className="font-bold text-cyan-300">{phasePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isFullyDefended
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    : "bg-gradient-to-r from-cyan-500 to-teal-400"
                }`}
                style={{ width: `${phasePercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
            {completedPhaseTopics}/{totalPhaseTopics} Topics
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="py-3 text-xs text-slate-300 leading-relaxed font-mono">
        <p>{phase.description}</p>
      </div>

      {/* Coursera Certification & Resource Drawer [RECON_ACADEMY: COURSERA SOURCES] */}
      {phase.courseraSearchQueries && phase.courseraSearchQueries.length > 0 && (
        <div className="my-3 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 bg-slate-900/60 overflow-hidden transition-all duration-200">
          <button
            data-testid={`recon-drawer-toggle-${phase.phaseId}`}
            type="button"
            onClick={() => {
              soundFx.playBlip(650);
              setIsReconOpen(!isReconOpen);
            }}
            aria-expanded={isReconOpen}
            className="w-full flex items-center justify-between p-3 cursor-pointer bg-slate-900/80 hover:border-cyan-500/60 hover:bg-cyan-950/30 transition-all duration-200 text-left focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold flex-wrap">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>[RECON_ACADEMY: COURSERA SOURCES]</span>
              <span className="text-[10px] text-cyan-400/80 bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                {phase.courseraSearchQueries.length} Courses
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5 rounded tracking-wider">
                {isReconOpen ? "[CLICK TO COLLAPSE]" : "[CLICK TO EXPAND]"}
              </span>
            </div>
            <div className="text-cyan-400 flex items-center gap-1.5 font-mono text-xs">
              <span
                className={`inline-block transition-transform duration-200 ${
                  isReconOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </div>
          </button>

          {isReconOpen && (
            <div className="p-3 bg-slate-950/70 border-t border-cyan-500/20 space-y-2 animate-in fade-in duration-150">
              <p className="text-[11px] font-mono text-slate-400 mb-2">
                Curated foundational training courses mapped directly to this phase. Click any chip
                to open the search query on Coursera or use the copy button.
              </p>
              <div className="flex flex-wrap gap-2">
                {phase.courseraSearchQueries.map((query, qIdx) => {
                  const searchUrl = `https://www.coursera.org/search?query=${encodeURIComponent(
                    query
                  )}`;
                  const isCopied = copiedQuery === query;

                  return (
                    <div
                      key={qIdx}
                      className="inline-flex items-center rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 overflow-hidden text-xs font-mono shadow-sm transition-all group"
                    >
                      <a
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 text-cyan-200 hover:text-white flex items-center gap-1.5 transition-colors"
                        title={`Search "${query}" on Coursera`}
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                        <span>{query}</span>
                      </a>
                      <button
                        data-testid={`recon-copy-btn-${phase.phaseId}-${qIdx}`}
                        type="button"
                        onClick={(e) => handleCopyQuery(query, e)}
                        aria-label={`Copy Coursera query: ${query}`}
                        className="px-2 py-1.5 bg-slate-800/80 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300 border-l border-cyan-500/20 transition-colors"
                        title="Copy query to clipboard"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modules Accordion */}
      <div className="space-y-3 mt-3">
        {phase.deepDiveTopics.map((mod, mIdx) => {
          const modKey = `${phase.phaseId}-m${mIdx}`;
          const modCompleted = mod.topics.filter((t) => completedTaskIds.has(t.id)).length;
          const isOpen = !!openModules[modKey];

          return (
            <div
              key={modKey}
              className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleModule(modKey)}
                aria-expanded={isOpen}
                aria-label={`Toggle Module: ${mod.module}`}
                className="w-full flex items-center justify-between p-3.5 cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 select-none transition-colors text-left focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 mr-2">
                      MODULE {mIdx + 1}:
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {mod.module}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {modCompleted}/{mod.topics.length} Done
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Module Topics List */}
              <div
                className={`p-3.5 space-y-2.5 bg-slate-950/40 border-t border-slate-800/80 ${
                  isOpen ? "block" : "hidden"
                }`}
              >
                {mod.topics.map((topic) => (
                  <TaskItem key={topic.id} topic={topic} phaseId={phase.phaseId} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase Milestone Deliverable Card at Bottom */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <MilestoneCard
          milestoneDeliverables={phase.milestoneDeliverables}
          phaseId={phase.phaseId}
        />
      </div>
    </div>
  );
};
