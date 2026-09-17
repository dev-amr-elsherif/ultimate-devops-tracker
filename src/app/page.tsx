"use client";

import React, { useMemo } from "react";
import { ROADMAP_PHASES } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import { HeaderHUD } from "@/components/HeaderHUD";
import { ExecutionGraph } from "@/components/ExecutionGraph";
import { FilterBar } from "@/components/FilterBar";
import { PhaseCard } from "@/components/PhaseCard";
import { CapstoneCard } from "@/components/CapstoneCard";
import { Terminal, Sparkles, SearchX } from "lucide-react";

export default function Home() {
  const { activeFilter, searchQuery } = useRoadmap();

  // Filter and search logic for 9-Phase Master Architecture
  const filteredPhases = useMemo(() => {
    return ROADMAP_PHASES.filter((phase) => {
      // Category filter
      if (activeFilter === "sequential" && phase.trackType !== "sequential") {
        return false;
      }
      if (activeFilter === "parallel" && phase.trackType !== "parallel") {
        return false;
      }

      // Keyword search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPhase =
          phase.title.toLowerCase().includes(q) ||
          phase.description.toLowerCase().includes(q) ||
          (phase.parallelWith && phase.parallelWith.toLowerCase().includes(q));

        const matchesModules = phase.deepDiveTopics.some(
          (m) =>
            m.module.toLowerCase().includes(q) ||
            m.topics.some(
              (t) =>
                t.topicTitle.toLowerCase().includes(q) ||
                (t.userNotes && t.userNotes.toLowerCase().includes(q))
            )
        );

        const matchesMilestone =
          phase.milestoneDeliverables.primaryProject.toLowerCase().includes(q) ||
          phase.milestoneDeliverables.description.toLowerCase().includes(q) ||
          phase.milestoneDeliverables.githubProofOfWork.some((req) =>
            req.toLowerCase().includes(q)
          );

        const matchesCoursera = phase.courseraSearchQueries.some((c) =>
          c.toLowerCase().includes(q)
        );

        return matchesPhase || matchesModules || matchesMilestone || matchesCoursera;
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  return (
    <main className="min-h-screen flex flex-col justify-between">
      {/* Top Header HUD Bar */}
      <HeaderHUD />

      {/* Hero Mission Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs mb-4 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CURRICULUM SPECIFICATION v3.0.0 // 9-PHASE MASTER ARCHITECTURE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-slate-100 tracking-tight">
          DevOps &amp; Cloud Engineering{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Master Roadmap
          </span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto font-mono leading-relaxed">
          From POSIX OS primitives and kernel virtual filesystems to cryptographic SCM, multi-AZ AWS
          infrastructure as code, Kubernetes fleet orchestration, distributed full-stack
          observability, and enterprise chaos resiliency.
        </p>
      </section>

      {/* Interactive Execution Flow Graph */}
      <ExecutionGraph />

      {/* Filter & Search Bar */}
      <FilterBar />

      {/* Main Roadmap Phases List */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {filteredPhases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl cyber-card border border-slate-800 bg-slate-950/80">
            <SearchX className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
              No Matching Protocols Found
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Adjust search keywords or reset filter chips to display roadmap phases.
            </p>
          </div>
        ) : (
          filteredPhases.map((phase) => (
            <PhaseCard key={phase.phaseId} phase={phase} />
          ))
        )}
      </section>

      {/* Graduation Capstone Project Defense */}
      {(activeFilter === "all" || activeFilter === "milestones") && (
        <CapstoneCard />
      )}

      {/* Terminal Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/90 pt-8 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8 mt-12 text-center font-mono text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-4 h-4" />
            <span>ULTIMATE DEVOPS TRACKER PRO // 9-PHASE MASTER SPEC</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>ENGINEERED FOR PRODUCTION MASTERY</span>
            <span>•</span>
            <span>DUAL OBSERVER / COMMANDER SECURITY MODEL</span>
          </div>

          <div className="text-[11px] text-slate-400">
            LOCAL STORAGE &amp; CLOUD TELEMETRY ACTIVE
          </div>
        </div>
      </footer>
    </main>
  );
}
