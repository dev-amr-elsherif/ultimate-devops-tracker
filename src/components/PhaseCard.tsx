"use client";

import React, { useState } from "react";
import { Phase } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import { TaskItem } from "./TaskItem";
import { MilestoneCard } from "./MilestoneCard";
import {
  Terminal,
  Server,
  GitBranch,
  ShieldCheck,
  Box,
  Cloud,
  Cpu,
  Boxes,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderTree,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface PhaseCardProps {
  phase: Phase;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Server,
  GitBranch,
  ShieldCheck,
  Box,
  Cloud,
  Cpu,
  Boxes,
  Activity,
  Zap,
};

export const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => {
  const { completedTaskIds } = useRoadmap();

  // Calculate phase tasks metrics
  const phaseTasks = phase.modules.flatMap((m) => m.tasks);
  const totalPhaseTasks = phaseTasks.length;
  const completedPhaseTasks = phaseTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const phasePercent =
    totalPhaseTasks > 0 ? Math.round((completedPhaseTasks / totalPhaseTasks) * 100) : 0;
  const isPhaseCompleted = totalPhaseTasks > 0 && completedPhaseTasks === totalPhaseTasks;

  // Accordion state for modules: open first module by default
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    [phase.modules[0]?.id || ""]: true,
  });

  const toggleModule = (modId: string) => {
    soundFx.playBlip(600);
    setOpenModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const IconComponent = ICON_MAP[phase.iconName] || Terminal;
  const isParallel = phase.mode.startsWith("Parallel");

  return (
    <div
      id={phase.id}
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 cyber-card border ${
        isPhaseCompleted
          ? "border-emerald-500/50 bg-slate-950/90 shadow-[0_0_25px_rgba(0,255,157,0.15)] border-glow-green"
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
              isPhaseCompleted
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                : isParallel
                ? "bg-violet-950/40 border-violet-500/40 text-violet-300"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
            }`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                PHASE {phase.phaseNumber}
              </span>

              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isParallel
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                }`}
              >
                {phase.mode}
              </span>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {phase.duration}
              </span>

              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                RANK: {phase.rankBadge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              {phase.title}
              {isPhaseCompleted && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 inline animate-pulse" />
              )}
            </h2>
            <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
              {phase.subtitle}
            </p>
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
                  isPhaseCompleted
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.5)]"
                    : "bg-gradient-to-r from-cyan-500 to-teal-400"
                }`}
                style={{ width: `${phasePercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
            {completedPhaseTasks}/{totalPhaseTasks} Tasks
          </span>
        </div>
      </div>

      {/* Description & Track Details */}
      <div className="py-3 text-xs text-slate-300 leading-relaxed">
        <p>{phase.description}</p>
        {phase.trackInfo && (
          <div className="mt-2 p-2 rounded bg-violet-950/30 border border-violet-500/30 font-mono text-[11px] text-violet-300">
            ⚡ <strong>TRACK SCHEDULE:</strong> {phase.trackInfo}
          </div>
        )}
      </div>

      {/* Modules Accordion */}
      <div className="space-y-3 mt-2">
        {phase.modules.map((mod) => {
          const modCompleted = mod.tasks.filter((t) => completedTaskIds.has(t.id)).length;
          const isOpen = !!openModules[mod.id];

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                aria-expanded={isOpen}
                aria-controls={`module-tasks-${mod.id}`}
                aria-label={`Toggle Module ${mod.code}: ${mod.title}`}
                className="w-full flex items-center justify-between p-3.5 cursor-pointer bg-slate-900/80 hover:bg-slate-800/80 select-none transition-colors text-left focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        MODULE {mod.code}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        {mod.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {modCompleted}/{mod.tasks.length} Done
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Module Tasks List */}
              {isOpen && (
                <div id={`module-tasks-${mod.id}`} className="p-3.5 space-y-2.5 bg-slate-950/40 border-t border-slate-800/80">
                  {mod.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} phaseId={phase.id} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Milestones */}
      {phase.milestones.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
            <span>⚔ PHASE MILESTONES & CAPSTONE DELIVERABLES</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {phase.milestones.map((ms) => (
              <MilestoneCard key={ms.id} milestone={ms} phaseId={phase.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
