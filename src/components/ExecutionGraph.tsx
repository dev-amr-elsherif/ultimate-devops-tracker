"use client";

import React, { useState } from "react";
import { useRoadmap } from "@/context/RoadmapContext";
import { ROADMAP_PHASES } from "@/data/roadmapData";
import { Network, CheckCircle2 } from "lucide-react";
import { soundFx } from "@/lib/audio";

export const ExecutionGraph: React.FC = () => {
  const { completedTaskIds } = useRoadmap();
  const [viewMode, setViewMode] = useState<"svg" | "ascii">("svg");

  const isPhaseDone = (phaseId: string) => {
    const p = ROADMAP_PHASES.find((item) => item.phaseId === phaseId);
    if (!p) return false;
    const topicIds = p.deepDiveTopics.flatMap((m) => m.topics.map((t) => t.id));
    return topicIds.length > 0 && topicIds.every((id) => completedTaskIds.has(id));
  };

  const asciiGraph = `
+-------------------------------------------------------------------------------------------------+
|            DEVOPS & CLOUD ENGINEERING COMPREHENSIVE MASTER ROADMAP (2026)                       |
|                 SEQUENTIAL FOUNDATIONS WITH CONCURRENT PARALLEL TRACKS                          |
+-------------------------------------------------------------------------------------------------+
                                       
     [ PHASE 01: Linux OS Primitives, Kernel Introspection & Networking ] (Sequential)
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼ (Concurrent Parallel Track)
                         │                         [ PHASE 02: Git SCM & Python Automation ]
                         │                                         │
                         ▼ (Sequential Progression)                │
     [ PHASE 03: SSH Hardening, Nginx & Modern TLS Termination ]   │
                         │                                         │
                         ▼                                         │
     [ PHASE 04: Container Runtime Primitives & Docker Arch ]      │
                         │                                         │
                         ├────────────────────┬────────────────────┘
                         ▼                    ▼ (Parallel Tracks)
     [ PHASE 05: AWS Cloud & Terraform ]  [ PHASE 06: DevSecOps Delivery & GitHub Actions ]
                         │                    │
                         └──────────┬─────────┘
                                    ▼ (Convergence)
     [ PHASE 07: Container Orchestration with Kubernetes & Helm ] (Sequential)
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼ (Concurrent Parallel Track)
                         │                         [ PHASE 08: Observability & GitOps Delivery ]
                         │                                         │
                         ▼ (Convergence to Defense)                │
                         └────────────────────┬────────────────────┘
                                              ▼
     =============================================================================================
     [ PHASE 09: ENTERPRISE HARDENING, SECRET MGMT, CHAOS ENGINEERING & CAPSTONE DEFENSE ]
     =============================================================================================
`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-4">
      <div className="rounded-xl cyber-card border border-cyan-500/20 bg-slate-950/80 p-4">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Execution Topology & Dependency Matrix (9-Phase Master Architecture)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playBlip(750);
                setViewMode("svg");
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === "svg"
                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] font-bold"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              VISUAL GRAPH
            </button>
            <button
              onClick={() => {
                soundFx.playBlip(650);
                setViewMode("ascii");
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === "ascii"
                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] font-bold"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              RAW ASCII
            </button>
          </div>
        </div>

        {/* Display modes */}
        {viewMode === "ascii" ? (
          <pre className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto selection:bg-cyan-500/30">
            {asciiGraph}
          </pre>
        ) : (
          <div className="p-3 sm:p-5 rounded-lg bg-slate-900/40 border border-slate-800 overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-center gap-3 font-mono text-xs">
              {/* Phase 01 */}
              <div
                className={`w-96 p-2.5 rounded-lg border text-center transition-all ${
                  isPhaseDone("phase-01")
                    ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 border-cyan-500/40 text-cyan-200"
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span>Phase 01: Linux OS Primitives & Networking</span>
                  {isPhaseDone("phase-01") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400">Sequential Foundation</div>
              </div>

              {/* Fork 1: Phase 02 (Parallel) & Phase 03 (Sequential) */}
              <div className="text-cyan-500 text-sm">↓</div>
              <div className="grid grid-cols-2 gap-8 w-[720px]">
                {/* Phase 03 */}
                <div
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isPhaseDone("phase-03")
                      ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-slate-900 border-cyan-500/40 text-cyan-200"
                  }`}
                >
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <span>Phase 03: SSH, Nginx & TLS</span>
                    {isPhaseDone("phase-03") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-cyan-400">Sequential Foundation</div>
                </div>

                {/* Phase 02 */}
                <div
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isPhaseDone("phase-02")
                      ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-slate-900 border-violet-500/40 text-violet-200"
                  }`}
                >
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <span>Phase 02: Git SCM & Python Automation</span>
                    {isPhaseDone("phase-02") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-violet-400">Parallel with Phase 01</div>
                </div>
              </div>

              {/* Phase 04 */}
              <div className="text-cyan-500 text-sm">↓</div>
              <div
                className={`w-96 p-2.5 rounded-lg border text-center transition-all ${
                  isPhaseDone("phase-04")
                    ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 border-cyan-500/40 text-cyan-200"
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span>Phase 04: Container Primitives & Docker</span>
                  {isPhaseDone("phase-04") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400">Sequential Foundation</div>
              </div>

              {/* Fork 2: Phase 05 & Phase 06 */}
              <div className="text-cyan-500 text-sm">↓</div>
              <div className="grid grid-cols-2 gap-8 w-[720px]">
                <div
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isPhaseDone("phase-05")
                      ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-slate-900 border-violet-500/40 text-violet-200"
                  }`}
                >
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <span>Phase 05: AWS Cloud & Terraform</span>
                    {isPhaseDone("phase-05") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-violet-400">Parallel with Phase 04</div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isPhaseDone("phase-06")
                      ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-slate-900 border-violet-500/40 text-violet-200"
                  }`}
                >
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <span>Phase 06: DevSecOps & GitHub Actions</span>
                    {isPhaseDone("phase-06") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-violet-400">Parallel with Phase 04, 05</div>
                </div>
              </div>

              {/* Convergence to Phase 07 */}
              <div className="text-cyan-500 text-sm">↓</div>
              <div
                className={`w-96 p-2.5 rounded-lg border text-center transition-all ${
                  isPhaseDone("phase-07")
                    ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 border-cyan-500/40 text-cyan-200"
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span>Phase 07: Kubernetes & Helm Orchestration</span>
                  {isPhaseDone("phase-07") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400">Sequential Fleet Foundation</div>
              </div>

              {/* Phase 08 (Parallel with Phase 07) */}
              <div className="text-cyan-500 text-sm">↓</div>
              <div
                className={`w-96 p-2.5 rounded-lg border text-center transition-all ${
                  isPhaseDone("phase-08")
                    ? "bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-slate-900 border-violet-500/40 text-violet-200"
                }`}
              >
                <div className="font-bold flex items-center justify-center gap-1.5">
                  <span>Phase 08: Observability, RED Stack & GitOps</span>
                  {isPhaseDone("phase-08") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-violet-400">Parallel with Phase 07</div>
              </div>

              {/* Final Convergence: Phase 09 Enterprise Defense */}
              <div className="text-emerald-500 text-sm">↓</div>
              <div
                className={`w-[520px] p-3 rounded-xl border text-center transition-all ${
                  isPhaseDone("phase-09")
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-slate-950 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                }`}
              >
                <div className="font-bold tracking-wider flex items-center justify-center gap-1.5">
                  <span>Phase 09: Enterprise Hardening, Chaos Resiliency & Capstone Defense</span>
                  {isPhaseDone("phase-09") && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Multi-Tier Microservices • KMS/SOPS • Chaos Mesh • CIS Benchmark Defense
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
