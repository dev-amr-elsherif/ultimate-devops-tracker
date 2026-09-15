"use client";

import React, { useState } from "react";
import { Task } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import { Check, Copy, CheckCheck, Lock, ChevronDown, ChevronUp, Terminal, ShieldCheck } from "lucide-react";
import { soundFx } from "@/lib/audio";

interface TaskItemProps {
  task: Task;
  phaseId: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, phaseId }) => {
  const { isCommander, completedTaskIds, toggleTask, addToast } = useRoadmap();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isChecked = completedTaskIds.has(task.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id, phaseId);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.commandSnippet) return;

    soundFx.playBlip(1000);
    navigator.clipboard.writeText(task.commandSnippet).then(() => {
      setCopied(true);
      addToast({
        type: "info",
        title: "COMMAND COPIED",
        description: "Snippet copied to system clipboard.",
      });
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div
      className={`rounded-lg border transition-all ${
        isChecked
          ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_10px_rgba(0,255,157,0.08)]"
          : "bg-slate-900/40 border-slate-800/80 hover:border-cyan-500/30"
      }`}
    >
      {/* Task Header Bar */}
      <div
        onClick={() => {
          soundFx.playBlip(550);
          setIsExpanded(!isExpanded);
        }}
        className="flex items-start gap-3.5 p-3.5 cursor-pointer select-none"
      >
        {/* Checkbox */}
        <button
          data-testid="task-checkbox"
          type="button"
          onClick={handleCheckboxClick}
          className={`mt-0.5 relative w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
            isChecked
              ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(0,255,157,0.6)]"
              : isCommander
              ? "border-slate-600 bg-slate-950/60 hover:border-cyan-400"
              : "border-slate-700 bg-slate-950/80 hover:border-rose-500/60 cursor-not-allowed"
          }`}
          title={
            isCommander
              ? isChecked
                ? "Mark Incomplete"
                : "Mark Completed"
              : "Observer Mode: Commander Authentication Required"
          }
        >
          {isChecked ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : !isCommander ? (
            <Lock className="w-2.5 h-2.5 text-slate-500" />
          ) : null}
        </button>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-xs sm:text-sm font-mono font-semibold transition-colors ${
                isChecked
                  ? "line-through text-slate-400"
                  : "text-slate-100 group-hover:text-cyan-300"
              }`}
            >
              {task.title}
            </h4>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700 text-cyan-400/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Expand / Collapse Chevron */}
        <div className="text-slate-500 hover:text-cyan-400 p-1">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Collapsible Details Drawer: Snippet & Acceptance Criteria */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
          {/* Code Snippet Box */}
          {task.commandSnippet && (
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="w-3.5 h-3.5" />
                  {task.snippetLanguage || "bash"}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors p-1"
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

              <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto selection:bg-cyan-500/30 selection:text-white leading-relaxed">
                <code>{task.commandSnippet}</code>
              </pre>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-300 uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                ACCEPTANCE CRITERIA
              </div>
              <ul className="space-y-1">
                {task.acceptanceCriteria.map((crit, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-400 font-mono"
                  >
                    <span className="text-cyan-400 shrink-0">▸</span>
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
