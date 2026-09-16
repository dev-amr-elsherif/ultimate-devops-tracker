"use client";

import React, { useMemo } from "react";
import { ROADMAP_PHASES } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import { HeaderHUD } from "@/components/HeaderHUD";
import { ExecutionGraph } from "@/components/ExecutionGraph";
import { FilterBar } from "@/components/FilterBar";
import { PhaseCard } from "@/components/PhaseCard";
import { CapstoneCard } from "@/components/CapstoneCard";
import {
  Terminal,
  Sparkles,
  SearchX,
} from "lucide-react";

export default function Home() {
  const { activeFilter, searchQuery } = useRoadmap();

  // Filter and search logic
  const filteredPhases = useMemo(() => {
    return ROADMAP_PHASES.filter((phase) => {
      // Category filter
      if (activeFilter === "sequential" && phase.mode !== "Sequential") {
        return false;
      }
      if (activeFilter === "parallel" && !phase.mode.startsWith("Parallel")) {
        return false;
      }
      if (activeFilter === "milestones" && phase.milestones.length === 0) {
        return false;
      }

      // Keyword search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPhase =
          phase.title.toLowerCase().includes(q) ||
          phase.subtitle.toLowerCase().includes(q) ||
          phase.description.toLowerCase().includes(q);

        const matchesModules = phase.modules.some(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tasks.some(
              (t) =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                (t.commandSnippet && t.commandSnippet.toLowerCase().includes(q)) ||
                t.tags.some((tag) => tag.toLowerCase().includes(q))
            )
        );

        const matchesMilestones = phase.milestones.some(
          (ms) =>
            ms.title.toLowerCase().includes(q) ||
            ms.slug.toLowerCase().includes(q) ||
            ms.description.toLowerCase().includes(q) ||
            ms.deliverables.some((d) => d.toLowerCase().includes(q))
        );

        return matchesPhase || matchesModules || matchesMilestones;
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
          <span>CURRICULUM SPECIFICATION v2.4 // 29 WEEKS FULL-STACK MASTERY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-slate-100 tracking-tight">
          DevOps & Cloud Engineering{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Master Roadmap
          </span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-mono leading-relaxed">
          From Linux OS primitives and kernel namespaces to multi-cloud infrastructure,
          automated CI/CD delivery pipelines, Kubernetes fleet orchestration, and full-stack observability.
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
            <PhaseCard key={phase.id} phase={phase} />
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
            <span>ULTIMATE DEVOPS TRACKER // ZERO-TO-HERO</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>ENGINEERED FOR PRODUCTION MASTERY</span>
            <span>•</span>
            <span>DUAL OBSERVER / COMMANDER SECURITY MODEL</span>
          </div>

          <div className="text-[11px] text-slate-400">
            LOCAL STORAGE PERSISTENCE ACTIVE
          </div>
        </div>
      </footer>
    </main>
  );
}
