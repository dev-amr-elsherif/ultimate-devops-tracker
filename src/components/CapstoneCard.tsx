"use client";

import React, { useState } from "react";
import { GRADUATION_CAPSTONE } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Trophy,
  Layers,
  Terminal,
  Copy,
  CheckCheck,
  Zap,
  Check,
  Lock,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

export const CapstoneCard: React.FC = () => {
  const { isCommander, addToast } = useRoadmap();
  const [copied, setCopied] = useState(false);
  const [completedCriteria, setCompletedCriteria] = useState<Set<number>>(new Set());

  const handleToggleCriteria = (idx: number) => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      addToast({
        type: "denied",
        title: "ACCESS DENIED",
        description: "Commander Mode required to record capstone defense marks.",
      });
      return;
    }

    setCompletedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        soundFx.playToggle(false);
      } else {
        next.add(idx);
        soundFx.playToggle(true);
        if (next.size === GRADUATION_CAPSTONE.defenseCriteria.length) {
          soundFx.playMilestoneCelebration();
          addToast({
            type: "milestone",
            title: "GRADUATION CAPSTONE DEFENDED",
            description: "Mastery credentials achieved! You are a certified DevOps Engineer.",
          });
        }
      }
      return next;
    });
  };

  const handleCopyRepo = () => {
    soundFx.playBlip(1000);
    navigator.clipboard.writeText(GRADUATION_CAPSTONE.sampleRepoStructure).then(() => {
      setCopied(true);
      addToast({
        type: "info",
        title: "REPOSITORY STRUCTURE COPIED",
        description: "Capstone directory layout copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl cyber-card border border-emerald-500/40 bg-slate-950/95 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,255,157,0.1)] border-glow-green">
        {/* Capstone Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,157,0.4)]">
              <Trophy className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 tracking-wider uppercase">
                  {GRADUATION_CAPSTONE.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {"// THE DEFINITIVE TRIAL OF ARCHITECTURAL COMPETENCE"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
                {GRADUATION_CAPSTONE.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {GRADUATION_CAPSTONE.description}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Architectural Pillars */}
        <div className="mt-6 mb-8">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            MULTI-TIER ARCHITECTURE SPECIFICATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRADUATION_CAPSTONE.architectureComponents.map((comp) => (
              <div
                key={comp.layer}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all"
              >
                <div className="text-xs font-mono font-bold text-emerald-400 mb-1.5">
                  {comp.layer}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {comp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {comp.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Defense Criteria & Repo Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defense Checklist */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                LIVE CAPSTONE DEFENSE VERIFICATION GATES
              </h4>
              <div className="space-y-2.5">
                {GRADUATION_CAPSTONE.defenseCriteria.map((crit, idx) => {
                  const done = completedCriteria.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleCriteria(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        done
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                          : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 text-slate-300"
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                          done
                            ? "bg-emerald-500 border-emerald-400 text-slate-950"
                            : isCommander
                            ? "border-slate-600 bg-slate-900"
                            : "border-slate-700 bg-slate-900 cursor-not-allowed"
                        }`}
                      >
                        {done ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : !isCommander ? (
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                        ) : null}
                      </div>
                      <span className="text-xs font-mono leading-relaxed">{crit}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>
                VERIFIED GATES: {completedCriteria.size} / {GRADUATION_CAPSTONE.defenseCriteria.length}
              </span>
              <span className="text-emerald-400 font-bold">
                {completedCriteria.size === GRADUATION_CAPSTONE.defenseCriteria.length
                  ? "ALL DEFENSE GATES PASSED"
                  : "PENDING DEFENSE EVALUATION"}
              </span>
            </div>
          </div>

          {/* Sample Repository Tree */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                production-cloud-system/
              </span>
              <button
                type="button"
                onClick={handleCopyRepo}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors p-1"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY TREE</span>
                  </>
                )}
              </button>
            </div>
            <pre
              tabIndex={0}
              role="region"
              aria-label="Repository directory tree structure"
              className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto selection:bg-cyan-500/30 selection:text-white leading-relaxed flex-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <code>{GRADUATION_CAPSTONE.sampleRepoStructure}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
