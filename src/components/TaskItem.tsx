"use client";

import React, { useState, useEffect } from "react";
import { DeepDiveTopic } from "@/types/roadmap";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Save,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

interface TaskItemProps {
  topic?: DeepDiveTopic;
  task?: DeepDiveTopic; // backwards-compatible prop name
  phaseId: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({ topic, task, phaseId }) => {
  const item = topic || task;
  const {
    isMounted,
    isCommander,
    completedTaskIds,
    toggleTopic,
    topicDetails,
    setTopicNotes,
    setTopicProofOfWork,
    addToast,
  } = useRoadmap();

  const details = item ? topicDetails[item.id] || {} : {};
  const currentNotes = details.userNotes ?? item?.userNotes ?? "";
  const currentProofUrl = details.proofOfWorkUrl ?? item?.proofOfWorkUrl ?? "";

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesInput, setNotesInput] = useState(currentNotes);
  const [proofUrlInput, setProofUrlInput] = useState(currentProofUrl);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotesInput(currentNotes);
    setProofUrlInput(currentProofUrl);
  }, [currentNotes, currentProofUrl]);

  if (!item) return null;

  const isChecked = isMounted ? completedTaskIds.has(item.id) : false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTopic(item.id, phaseId);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCommander) return;

    setTopicNotes(item.id, notesInput.trim());
    setTopicProofOfWork(item.id, proofUrlInput.trim());
    setIsSaved(true);
    soundFx.playSuccess();
    addToast({
      type: "success",
      title: "TELEMETRY LOGGED",
      description: "Topic notes and proof-of-work saved.",
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div
      className={`rounded-lg border transition-all ${
        isChecked
          ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.12)]"
          : "bg-slate-900/40 border-slate-800/80 hover:border-cyan-500/30"
      }`}
    >
      {/* Topic Row */}
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox with Neon Cyber Check Effect */}
        <button
          data-testid="task-checkbox"
          type="button"
          role="checkbox"
          aria-checked={isChecked}
          aria-label={
            isCommander
              ? isChecked
                ? `Mark topic "${item.topicTitle}" incomplete`
                : `Mark topic "${item.topicTitle}" completed`
              : `Topic locked, Commander authentication required`
          }
          onClick={handleCheckboxClick}
          className={`mt-0.5 relative w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
            isChecked
              ? "bg-[#10b981] border-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.85)] scale-105"
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

        {/* Topic Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`text-xs sm:text-sm font-mono leading-relaxed transition-colors ${
                isChecked
                  ? "line-through text-slate-400 font-medium"
                  : "text-slate-100 font-semibold hover:text-cyan-300"
              }`}
            >
              {item.topicTitle}
            </h4>

            {/* Proof of work indicator if set */}
            {currentProofUrl && !isNotesOpen && (
              <a
                href={currentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0 shadow-sm"
                title="View proof-of-work link"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden sm:inline">PROOF</span>
              </a>
            )}
          </div>
        </div>

        {/* User Notes Toggle Button */}
        <button
          data-testid="topic-notes-toggle-btn"
          type="button"
          onClick={() => {
            soundFx.playBlip(600);
            setIsNotesOpen(!isNotesOpen);
          }}
          aria-expanded={isNotesOpen}
          aria-label={`Toggle telemetry notes for topic: ${item.topicTitle}`}
          className={`p-1 rounded text-xs font-mono transition-colors shrink-0 flex items-center gap-1 ${
            isNotesOpen || currentNotes
              ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/30"
              : "text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800"
          }`}
          title="Toggle notes and proof-of-work"
        >
          <FileText className="w-3.5 h-3.5" />
          {isNotesOpen ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* User Notes & Proof of Work Drawer */}
      {isNotesOpen && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/80 space-y-2.5 animate-in fade-in duration-150">
          {isCommander ? (
            <form onSubmit={handleSaveDetails} className="space-y-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span>Personal Engineering Notes</span>
                </label>
                <textarea
                  data-testid="topic-notes-input"
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record insights, debugging caveats, or operational notes..."
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-emerald-400" />
                  <span>Proof-of-Work URL (GitHub Commit, PR, or Demo)</span>
                </label>
                <input
                  data-testid="topic-proof-input"
                  type="url"
                  value={proofUrlInput}
                  onChange={(e) => setProofUrlInput(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  data-testid="topic-save-btn"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 border border-cyan-300 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSaved ? "SAVED" : "SAVE TELEMETRY"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-xs font-mono">
              {currentNotes ? (
                <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">ENGINEER NOTES:</span>
                  {currentNotes}
                </div>
              ) : (
                <p className="text-slate-500 italic">No notes recorded for this topic.</p>
              )}

              {currentProofUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-400">Proof of Work:</span>
                  <a
                    href={currentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>{currentProofUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
