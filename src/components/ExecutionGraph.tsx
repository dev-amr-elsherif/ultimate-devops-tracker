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
    const p = ROADMAP_PHASES.find((item) => item.id === phaseId);
    if (!p) return false;
    const taskIds = p.modules.flatMap((m) => m.tasks.map((t) => t.id));
    return taskIds.length > 0 && taskIds.every((id) => completedTaskIds.has(id));
  };

  const asciiGraph = `
+---------------------------------------------------------------------------------------------+
|               ULTIMATE DEVOPS & CLOUD ARCHITECTURE EXECUTION TOPOLOGY                       |
+---------------------------------------------------------------------------------------------+
                                      
  [ PHASE 0: Terminal & OS Primitives ] (2 Wks)
                    │
                    ▼
  [ PHASE 1: Linux Admin & Networking ] (3 Wks)
                    │
                    ├─────────────────────────────────────────┐
                    ▼ (Morning Track)                         ▼ (Evening Track)
        [ PHASE 2: Git Internals & PRs ]          [ PHASE 3: Bash & Python Automation ]
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼ (Convergence)
                         [ PHASE 4: Web Servers & Hardening ] (2 Wks)
                                         │
                                         ▼
                         [ PHASE 5: Container Arch & Docker ] (3 Wks)
                                         │
                    ├────────────────────┴────────────────────┐
                    ▼ (Morning Track)                         ▼ (Evening Track)
        [ PHASE 6: AWS Cloud Architecture ]       [ PHASE 7: GitHub Actions CI/CD ]
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼ (Convergence)
                         [ PHASE 8: Infrastructure as Code ] (Terraform - 3 Wks)
                                         │
                                         ▼
                         [ PHASE 9: Container Orchestration ] (Kubernetes - 4 Wks)
                                         │
                                         ▼
                         [ PHASE 10: Full-Stack Observability ] (Prometheus/Grafana - 3 Wks)
                                         │
                                         ▼
                         [ PHASE 11: Production Hardening & Chaos ] (2 Wks)
                                         │
                                         ▼
                 =================================================
                 [ GRADUATION CAPSTONE: MULTI-TIER CLOUD SYSTEM  ]
                 =================================================
`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-4">
      <div className="rounded-xl cyber-card border border-cyan-500/20 bg-slate-950/80 p-4">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Execution Architecture & Dependency Graph
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

        {viewMode === "ascii" ? (
          <div
            tabIndex={0}
            role="region"
            aria-label="ASCII Execution Topology"
            className="overflow-x-auto bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-400/90 leading-tight focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            <pre>{asciiGraph}</pre>
          </div>
        ) : (
          <div className="overflow-x-auto py-2">
            <div className="min-w-[860px] flex flex-col items-center gap-3">
              {/* Step 0 */}
              <div className="flex items-center gap-2">
                <NodeChip
                  id="phase-0"
                  label="Phase 0: Terminal & OS Primitives"
                  tag="Sequential // 2 Wks"
                  completed={isPhaseDone("phase-0")}
                />
              </div>

              <DownArrow />

              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <NodeChip
                  id="phase-1"
                  label="Phase 1: Linux Admin & Core Networking"
                  tag="Sequential // 3 Wks"
                  completed={isPhaseDone("phase-1")}
                />
              </div>

              <DownArrow />

              {/* Parallel Tracks 2 & 3 */}
              <div className="w-full max-w-2xl p-3 rounded-lg border border-violet-500/30 bg-violet-950/10 flex flex-col items-center">
                <div className="text-[10px] font-mono text-violet-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                  Parallel Execution Track 1 (3 Weeks Total)
                </div>
                <div className="flex items-center justify-center gap-6 w-full">
                  <div className="flex-1">
                    <NodeChip
                      id="phase-2"
                      label="Track A (Morning): Git & GitHub"
                      tag="Branching & Internals"
                      completed={isPhaseDone("phase-2")}
                      variant="violet"
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500 font-bold">+</span>
                  <div className="flex-1">
                    <NodeChip
                      id="phase-3"
                      label="Track B (Evening): Bash & Python Automation"
                      tag="CLI & Scripting"
                      completed={isPhaseDone("phase-3")}
                      variant="violet"
                    />
                  </div>
                </div>
              </div>

              <DownArrow />

              {/* Step 4 */}
              <div className="flex items-center gap-2">
                <NodeChip
                  id="phase-4"
                  label="Phase 4: Web Servers, Proxies, TLS & SSH Hardening"
                  tag="Convergence // 2 Wks"
                  completed={isPhaseDone("phase-4")}
                />
              </div>

              <DownArrow />

              {/* Step 5 */}
              <div className="flex items-center gap-2">
                <NodeChip
                  id="phase-5"
                  label="Phase 5: Container Architecture & Docker Deep-Dive"
                  tag="Sequential // 3 Wks"
                  completed={isPhaseDone("phase-5")}
                />
              </div>

              <DownArrow />

              {/* Parallel Tracks 6 & 7 */}
              <div className="w-full max-w-2xl p-3 rounded-lg border border-violet-500/30 bg-violet-950/10 flex flex-col items-center">
                <div className="text-[10px] font-mono text-violet-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
                  Parallel Execution Track 2 (4 Weeks Total)
                </div>
                <div className="flex items-center justify-center gap-6 w-full">
                  <div className="flex-1">
                    <NodeChip
                      id="phase-6"
                      label="Track A (Morning): AWS Cloud Infrastructure"
                      tag="VPC, IAM & EC2"
                      completed={isPhaseDone("phase-6")}
                      variant="violet"
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500 font-bold">+</span>
                  <div className="flex-1">
                    <NodeChip
                      id="phase-7"
                      label="Track B (Evening): GitHub Actions CI/CD"
                      tag="Pipelines & Registry"
                      completed={isPhaseDone("phase-7")}
                      variant="violet"
                    />
                  </div>
                </div>
              </div>

              <DownArrow />

              {/* Steps 8, 9, 10, 11 */}
              <div className="grid grid-cols-4 gap-3 w-full max-w-4xl">
                <NodeChip
                  id="phase-8"
                  label="Phase 8: Terraform"
                  tag="IaC & Remote State"
                  completed={isPhaseDone("phase-8")}
                />
                <NodeChip
                  id="phase-9"
                  label="Phase 9: Kubernetes"
                  tag="Fleets & Helm"
                  completed={isPhaseDone("phase-9")}
                />
                <NodeChip
                  id="phase-10"
                  label="Phase 10: Observability"
                  tag="Prometheus/Grafana"
                  completed={isPhaseDone("phase-10")}
                />
                <NodeChip
                  id="phase-11"
                  label="Phase 11: DevSecOps"
                  tag="Chaos & CIS Audit"
                  completed={isPhaseDone("phase-11")}
                />
              </div>

              <DownArrow />

              {/* Graduation Capstone */}
              <div className="p-3.5 rounded-xl border border-emerald-500/50 bg-emerald-950/30 text-center w-full max-w-xl shadow-[0_0_20px_rgba(0,255,157,0.15)] border-glow-green">
                <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  GRADUATION CAPSTONE DEFENSE TRIAL
                </div>
                <div className="text-xs text-slate-300 font-mono mt-1">
                  Production Multi-Tier Cloud Delivery System (EKS, Terraform, CI/CD, Observability)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NodeChip: React.FC<{
  id: string;
  label: string;
  tag: string;
  completed: boolean;
  variant?: "cyan" | "violet";
}> = ({ label, tag, completed, variant = "cyan" }) => {
  return (
    <div
      className={`px-3 py-2 rounded-lg border text-center transition-all ${
        completed
          ? "bg-emerald-950/40 border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(0,255,157,0.2)]"
          : variant === "violet"
          ? "bg-slate-900/80 border-violet-500/30 text-violet-200"
          : "bg-slate-900/80 border-cyan-500/30 text-cyan-200"
      }`}
    >
      <div className="flex items-center justify-center gap-1.5">
        {completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
        <span className="text-xs font-mono font-bold tracking-tight truncate">{label}</span>
      </div>
      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{tag}</div>
    </div>
  );
};

const DownArrow: React.FC = () => (
  <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500/60 to-cyan-500/20 my-0.5" />
);
