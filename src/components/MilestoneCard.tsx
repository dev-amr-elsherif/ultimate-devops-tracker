"use client";

import React, { useState } from "react";
import { Milestone } from "@/data/roadmapData";
import { useRoadmap } from "@/context/RoadmapContext";
import {
  Trophy,
  Check,
  CheckCheck,
  Copy,
  Terminal,
  Shield,
  Lock,
  ExternalLink,
  Globe,
  Wrench,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { soundFx } from "@/lib/audio";

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface MilestoneCardProps {
  milestone: Milestone;
  phaseId: string;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, phaseId }) => {
  const {
    isCommander,
    completedMilestoneIds,
    toggleMilestone,
    addToast,
    projectArtifacts,
    setProjectArtifact,
  } = useRoadmap();
  const [copied, setCopied] = useState(false);

  const isCompleted = completedMilestoneIds.has(milestone.id);
  const artifact = projectArtifacts[milestone.id] || projectArtifacts[milestone.slug];
  const hasArtifact = Boolean(
    artifact && (artifact.repoUrl?.trim() || artifact.liveUrl?.trim() || artifact.notes?.trim())
  );

  // Artifact Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [repoInput, setRepoInput] = useState(artifact?.repoUrl || "");
  const [liveInput, setLiveInput] = useState(artifact?.liveUrl || "");
  const [notesInput, setNotesInput] = useState(artifact?.notes || "");
  const [urlError, setUrlError] = useState<string | null>(null);

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

  const handleOpenDrawer = () => {
    setRepoInput(artifact?.repoUrl || "");
    setLiveInput(artifact?.liveUrl || "");
    setNotesInput(artifact?.notes || "");
    setUrlError(null);
    soundFx.playBlip(700);
    setIsDrawerOpen(true);
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true;
    return /^https?:\/\//i.test(url.trim());
  };

  const handleSaveArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim() && !isValidUrl(repoInput)) {
      setUrlError("Repository URL must begin with http:// or https://");
      soundFx.playAccessDenied();
      return;
    }
    if (liveInput.trim() && !isValidUrl(liveInput)) {
      setUrlError("Live Demo URL must begin with http:// or https://");
      soundFx.playAccessDenied();
      return;
    }

    setUrlError(null);
    setProjectArtifact(milestone.id, {
      repoUrl: repoInput.trim() || undefined,
      liveUrl: liveInput.trim() || undefined,
      notes: notesInput.trim() || undefined,
    });
    setIsDrawerOpen(false);
  };

  return (
    <div
      data-testid={`milestone-card-${milestone.slug}`}
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
              <span className="text-xs font-mono text-slate-400 font-medium">[{milestone.slug}]</span>
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
          aria-label={
            isCommander
              ? isCompleted
                ? `Mark milestone ${milestone.title} incomplete`
                : `Defend and record milestone ${milestone.title}`
              : `Milestone ${milestone.title} locked, Commander authentication required`
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
            isCompleted
              ? "bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              : isCommander
              ? "bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-amber-950/40 hover:border-amber-400"
              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-rose-500/40 cursor-not-allowed"
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
              <Lock className="w-3 h-3 text-slate-400" />
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

      {/* Proof-of-Work Artifact Locker */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 mb-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {hasArtifact ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                [ 🛡️ VERIFIED ARTIFACT ]
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                <Clock className="w-3.5 h-3.5" />
                [ ⏳ AWAITING DEPLOYMENT ]
              </span>
            )}

            {/* Direct Evidence Links */}
            {hasArtifact && (
              <div className="flex items-center gap-2">
                {artifact?.repoUrl && (
                  <a
                    href={artifact.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="artifact-repo-link"
                    aria-label={`View GitHub Repository for ${milestone.title}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-cyan-200 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                    title="View GitHub Repository"
                  >
                    <GithubIcon className="w-3 h-3" />
                    <span>[ ⌥ REPO ]</span>
                  </a>
                )}
                {artifact?.liveUrl && (
                  <a
                    href={artifact.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="artifact-live-link"
                    aria-label={`View Live Demonstration for ${milestone.title}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-emerald-300 hover:text-emerald-200 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                    title="View Live Demonstration"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>[ ↗ DEMO ]</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Commander Mode Action Button */}
          {isCommander && (
            <button
              type="button"
              onClick={isDrawerOpen ? () => setIsDrawerOpen(false) : handleOpenDrawer}
              data-testid="artifact-attach-btn"
              aria-label={hasArtifact ? `Edit artifact evidence for ${milestone.title}` : `Attach evidence for ${milestone.title}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 hover:bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 text-amber-300 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <Wrench className="w-3 h-3" />
              <span>{hasArtifact ? "[ EDIT ARTIFACT ]" : "[ ⚙️ ATTACH EVIDENCE ]"}</span>
            </button>
          )}
        </div>

        {/* Notes Preview if available */}
        {hasArtifact && artifact?.notes && !isDrawerOpen && (
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60 leading-relaxed">
            <span className="text-amber-400 font-bold">NOTE: </span>
            {artifact.notes}
          </div>
        )}

        {/* Inline Cyber Evidence Configuration Form */}
        {isCommander && isDrawerOpen && (
          <form onSubmit={handleSaveArtifact} className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              PROOF-OF-WORK CONFIGURATION // {milestone.slug}
            </div>

            {urlError && (
              <div className="text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/60 px-2 py-1 rounded">
                {urlError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                GitHub Repository URL *
              </label>
              <div className="relative">
                <GithubIcon className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="url"
                  data-testid="artifact-repo-input"
                  placeholder="https://github.com/username/project-repo"
                  value={repoInput}
                  onChange={(e) => {
                    setRepoInput(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Live Demo URL (Optional)
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="url"
                  data-testid="artifact-live-input"
                  placeholder="https://my-app.cloud.run.app"
                  value={liveInput}
                  onChange={(e) => {
                    setLiveInput(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Implementation Notes / Architecture Highlights (Optional)
              </label>
              <textarea
                data-testid="artifact-notes-input"
                rows={2}
                placeholder="Key architectural decisions, performance benchmarks, or deployment commands..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setUrlError(null);
                }}
                className="px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                data-testid="artifact-save-btn"
                className="px-3 py-1 rounded text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              >
                SAVE ARTIFACT
              </button>
            </div>
          </form>
        )}
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
              aria-label={copied ? "Code copied to clipboard" : `Copy ${milestone.verificationCommand ? "verification command" : "starter blueprint"} for ${milestone.title}`}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none rounded px-1"
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

          <pre
            tabIndex={0}
            role="region"
            aria-label={`Code blueprint for ${milestone.title}`}
            className="p-3 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-48 selection:bg-amber-500/30 selection:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
          >
            <code>{milestone.codeTemplate || milestone.verificationCommand}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
