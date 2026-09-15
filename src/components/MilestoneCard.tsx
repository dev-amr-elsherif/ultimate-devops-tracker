"use client";

import React, { useState } from "react";
import { Milestone } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import { Trophy, Check, CheckCheck, Copy, Terminal, Shield, Lock } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface MilestoneCardProps {
  milestone: Milestone;
  phaseId: string;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, phaseId }) => {
  const { isCommander, completedMilestoneIds, toggleMilestone, addToast } = useRoadmap();
  const [copied, setCopied] = useState(false);

  const isCompleted = completedMilestoneIds.has(milestone.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMilestone(milestone.id, phaseId);
  };

  const handleCopy = () => {
    if (!milestone.codeTemplate && !milestone.verificationCommand) return;
    const textToCopy = milestone.verificationCommand || milestone.codeTemplate || "";
    soundFx.playBlip(950);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      addToast({
        type: "info",
        title: "TEMPLATE COPIED",
        description: "Milestone code/command copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div
      className={`rounded-xl p-4 border transition-all relative overflow-hidden ${
        isCompleted
          ? "bg-amber-950/30 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] border-glow-amber"
          : "bg-slate-950/80 border-amber-500/30 hover:border-amber-400/50"
      }`}
    >
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg border ${
              isCompleted
                ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "bg-amber-950/40 border-amber-500/30 text-amber-400"
            }`}
          >
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold tracking-wider uppercase">
                PROJECT MILESTONE
              </span>
              <span className="text-xs font-mono text-slate-500">[{milestone.slug}]</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold font-mono text-slate-100 mt-0.5">
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* Milestone Completion Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
            isCompleted
              ? "bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              : isCommander
              ? "bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-amber-950/40 hover:border-amber-400"
              : "bg-slate-900/80 border-slate-800 text-slate-500 hover:border-rose-500/40 cursor-not-allowed"
          }`}
          title={
            isCommander
              ? isCompleted
                ? "Mark Incomplete"
                : "Defend & Record Milestone"
              : "Observer Mode: Commander Authentication Required"
          }
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>DEFENDED</span>
            </>
          ) : !isCommander ? (
            <>
              <Lock className="w-3 h-3 text-slate-500" />
              <span>LOCKED</span>
            </>
          ) : (
            <span>DEFEND MILESTONE</span>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-3">
        {milestone.description}
      </p>

      {/* Deliverables checklist */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/90 mb-3">
        <div className="text-[11px] font-mono font-bold text-amber-300/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          KEY DELIVERABLES & DEFENSE CRITERIA
        </div>
        <ul className="space-y-1.5">
          {milestone.deliverables.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
              <span className="text-amber-400 shrink-0 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Code Template / Verification Command preview */}
      {(milestone.codeTemplate || milestone.verificationCommand) && (
        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Terminal className="w-3.5 h-3.5" />
              {milestone.verificationCommand ? "Verification Command" : "Starter Blueprint"}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-48 selection:bg-amber-500/30 selection:text-white">
            <code>{milestone.codeTemplate || milestone.verificationCommand}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
