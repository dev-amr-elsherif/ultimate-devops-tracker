"use client";

import React, { useState } from "react";
import { PERIPHERAL_TECHNOLOGY_RADAR } from "@/data/roadmapData";
import { Compass, BookOpen, Cpu, Shield, Layers, Network, Sparkles } from "lucide-react";
import { soundFx } from "@/lib/audio";

export const PeripheralRadar: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const getDomainIcon = (domain: string) => {
    if (domain.includes("Design")) return <Layers className="w-4 h-4 text-cyan-400" />;
    if (domain.includes("Algorithms")) return <Cpu className="w-4 h-4 text-amber-400" />;
    if (domain.includes("Distributed")) return <Network className="w-4 h-4 text-violet-400" />;
    if (domain.includes("MLOps")) return <Sparkles className="w-4 h-4 text-emerald-400" />;
    return <Shield className="w-4 h-4 text-rose-400" />;
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl cyber-card border border-cyan-500/20 bg-slate-950/85 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-mono text-slate-100 tracking-wide">
                  PERIPHERAL TECHNOLOGY RADAR
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  COMPLEMENTARY CORE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Adjacent domains, specialized curricula & architecture reference standards
              </p>
            </div>
          </div>
        </div>

        {/* Radar Matrix Table & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PERIPHERAL_TECHNOLOGY_RADAR.map((item) => {
            const isSelected = selectedDomain === item.domain;

            return (
              <div
                key={item.domain}
                onClick={() => {
                  soundFx.playBlip(700);
                  setSelectedDomain(isSelected ? null : item.domain);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : "bg-slate-900/60 border-slate-800 hover:border-cyan-500/40"
                }`}
              >
                {/* Card Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getDomainIcon(item.domain)}
                    <h4 className="text-sm font-bold font-mono text-slate-100">
                      {item.domain}
                    </h4>
                  </div>
                  {item.sourceDoc && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 flex items-center gap-1 shrink-0">
                      <BookOpen className="w-3 h-3" />
                      {item.sourceDoc}
                    </span>
                  )}
                </div>

                {/* Core Focus */}
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {item.coreFocus}
                </p>

                {/* Recommended Tools */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-mono text-slate-400 mr-1 font-semibold">STACK:</span>
                  {item.recommendedTools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {/* Relevance & Action */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400">DevOps Impact:</strong> {item.devopsRelevance}
                  </div>
                  <div className="text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                    <strong className="text-amber-400">Action Plan:</strong> {item.suggestedAction}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
