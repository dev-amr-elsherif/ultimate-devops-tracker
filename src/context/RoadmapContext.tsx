"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { ROADMAP_PHASES, Task } from "@/data/roadmapData";
import { soundFx } from "@/lib/audio";

export interface ToastMessage {
  id: string;
  type: "denied" | "success" | "info" | "milestone";
  title: string;
  description?: string;
}

export type FilterCategory = "all" | "sequential" | "parallel" | "milestones";

export interface RoadmapProgressState {
  completedTaskIds: string[];
  completedMilestoneIds: string[];
  notes: Record<string, string>;
  lastUpdated: string;
}

interface RoadmapContextType {
  isCommander: boolean;
  isPasscodeModalOpen: boolean;
  setIsPasscodeModalOpen: (open: boolean) => void;
  authenticateCommander: (passcode: string) => boolean;
  revokeCommander: () => void;

  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  toggleTask: (taskId: string, phaseId: string) => void;
  toggleMilestone: (milestoneId: string, phaseId: string) => void;
  resetProgress: () => void;
  exportSnapshot: () => void;

  // Telemetry metrics
  totalTasks: number;
  completedTasksCount: number;
  completionPercentage: number;
  totalMilestones: number;
  completedMilestonesCount: number;
  operationalPhasesCount: number;
  clearanceRank: {
    title: string;
    level: number;
    color: string;
    badge: string;
  };

  // Filters & Search
  activeFilter: FilterCategory;
  setActiveFilter: (filter: FilterCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Audio mute state
  isAudioMuted: boolean;
  toggleAudioMute: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const STORAGE_KEY = "devops_roadmap_progress";
const AUTH_KEY = "devops_commander_session";
const MASTER_PASSCODE = "admin123";

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialize state from storage on first render
  const [isCommander, setIsCommander] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(AUTH_KEY) === "authenticated";
    } catch {
      return false;
    }
  });

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: RoadmapProgressState = JSON.parse(saved);
        if (Array.isArray(parsed.completedTaskIds)) {
          return new Set(parsed.completedTaskIds);
        }
      }
    } catch {}
    return new Set();
  });

  const [completedMilestoneIds, setCompletedMilestoneIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: RoadmapProgressState = JSON.parse(saved);
        if (Array.isArray(parsed.completedMilestoneIds)) {
          return new Set(parsed.completedMilestoneIds);
        }
      }
    } catch {}
    return new Set();
  });

  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => soundFx.isMuted());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Listen for keyboard shortcut Ctrl + Shift + A to open Passcode Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        soundFx.playBlip(1100);
        setIsPasscodeModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save progress changes
  const saveProgress = useCallback((tasks: Set<string>, milestones: Set<string>) => {
    try {
      const payload: RoadmapProgressState = {
        completedTaskIds: Array.from(tasks),
        completedMilestoneIds: Array.from(milestones),
        notes: {},
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore write errors
    }
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerCelebration = useCallback(() => {
    soundFx.playMilestoneCelebration();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00f0ff", "#00ff9d", "#f59e0b", "#8b5cf6"],
      });
    } catch {
      // Ignore confetti failure
    }
  }, []);

  // Authenticate Commander
  const authenticateCommander = useCallback((passcode: string): boolean => {
    if (passcode.trim() === MASTER_PASSCODE) {
      setIsCommander(true);
      try {
        sessionStorage.setItem(AUTH_KEY, "authenticated");
      } catch {}
      soundFx.playCommanderUnlock();
      addToast({
        type: "success",
        title: "COMMANDER MODE ACTIVATED",
        description: "Clearance override verified. Full operational control granted.",
      });
      setIsPasscodeModalOpen(false);
      return true;
    } else {
      soundFx.playAccessDenied();
      return false;
    }
  }, [addToast]);

  const revokeCommander = useCallback(() => {
    setIsCommander(false);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {}
    soundFx.playBlip(440);
    addToast({
      type: "info",
      title: "OBSERVER MODE RESTORED",
      description: "Terminal restricted to public view-only telemetry.",
    });
  }, [addToast]);

  const toggleAudioMute = useCallback(() => {
    const nextMute = soundFx.toggleMute();
    setIsAudioMuted(nextMute);
  }, []);

  // Task check toggle logic with dual security
  const toggleTask = useCallback(
    (taskId: string, phaseId: string) => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to alter telemetry state.",
        });
        return;
      }

      setCompletedTaskIds((prev) => {
        const next = new Set(prev);
        const wasChecked = next.has(taskId);
        if (wasChecked) {
          next.delete(taskId);
          soundFx.playToggle(false);
        } else {
          next.add(taskId);
          soundFx.playToggle(true);

          // Check if this action completed all tasks in the phase
          const targetPhase = ROADMAP_PHASES.find((p) => p.id === phaseId);
          if (targetPhase) {
            const phaseTasks = targetPhase.modules.flatMap((m) => m.tasks.map((t) => t.id));
            const allComplete = phaseTasks.every((id) => next.has(id));
            if (allComplete) {
              triggerCelebration();
              addToast({
                type: "milestone",
                title: "PHASE FULLY OPERATIONAL",
                description: `${targetPhase.title} is now 100% complete!`,
              });
            }
          }
        }
        saveProgress(next, completedMilestoneIds);
        return next;
      });
    },
    [isCommander, addToast, completedMilestoneIds, saveProgress, triggerCelebration]
  );

  // Milestone toggle logic
  const toggleMilestone = useCallback(
    (milestoneId: string, phaseId: string) => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to verify milestones.",
        });
        return;
      }

      setCompletedMilestoneIds((prev) => {
        const next = new Set(prev);
        const wasCompleted = next.has(milestoneId);
        if (wasCompleted) {
          next.delete(milestoneId);
          soundFx.playToggle(false);
        } else {
          next.add(milestoneId);
          triggerCelebration();
          const targetPhase = ROADMAP_PHASES.find((p) => p.id === phaseId);
          const ms = targetPhase?.milestones.find((m) => m.id === milestoneId);
          addToast({
            type: "milestone",
            title: "PROJECT MILESTONE DEFENDED",
            description: ms ? ms.title : "Milestone successfully recorded!",
          });
        }
        saveProgress(completedTaskIds, next);
        return next;
      });
    },
    [isCommander, addToast, completedTaskIds, saveProgress, triggerCelebration]
  );

  // Reset Progress
  const resetProgress = useCallback(() => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      return;
    }
    setCompletedTaskIds(new Set());
    setCompletedMilestoneIds(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    soundFx.playBlip(300);
    addToast({
      type: "info",
      title: "TELEMETRY PURGED",
      description: "All roadmap progress metrics have been reset to zero.",
    });
  }, [isCommander, addToast]);

  // Export Snapshot JSON
  const exportSnapshot = useCallback(() => {
    soundFx.playBlip(980);
    const data: RoadmapProgressState = {
      completedTaskIds: Array.from(completedTaskIds),
      completedMilestoneIds: Array.from(completedMilestoneIds),
      notes: {},
      lastUpdated: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devops-roadmap-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: "success",
      title: "SNAPSHOT EXPORTED",
      description: "Roadmap telemetry JSON successfully downloaded.",
    });
  }, [completedTaskIds, completedMilestoneIds, addToast]);

  // Compute Telemetry
  const allTasks: Task[] = ROADMAP_PHASES.flatMap((p) => p.modules.flatMap((m) => m.tasks));
  const totalTasks = allTasks.length;
  const completedTasksCount = completedTaskIds.size;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const allMilestones = ROADMAP_PHASES.flatMap((p) => p.milestones);
  const totalMilestones = allMilestones.length;
  const completedMilestonesCount = completedMilestoneIds.size;

  // Operational Phases (all tasks in phase completed)
  const operationalPhasesCount = ROADMAP_PHASES.filter((phase) => {
    const phaseTaskIds = phase.modules.flatMap((m) => m.tasks.map((t) => t.id));
    return phaseTaskIds.length > 0 && phaseTaskIds.every((id) => completedTaskIds.has(id));
  }).length;

  // Dynamic Clearance Rank
  const getClearanceRank = () => {
    if (completionPercentage >= 75) {
      return { title: "DevOps Lead", level: 4, color: "text-emerald-400", badge: "CR-04 // DEVOPS LEAD" };
    }
    if (completionPercentage >= 50) {
      return { title: "Cloud Architect", level: 3, color: "text-cyan-400", badge: "CR-03 // CLOUD ARCHITECT" };
    }
    if (completionPercentage >= 25) {
      return { title: "SysAdmin", level: 2, color: "text-amber-400", badge: "CR-02 // SYSADMIN" };
    }
    return { title: "Cadet", level: 1, color: "text-slate-400", badge: "CR-01 // CADET" };
  };

  const clearanceRank = getClearanceRank();

  return (
    <RoadmapContext.Provider
      value={{
        isCommander,
        isPasscodeModalOpen,
        setIsPasscodeModalOpen,
        authenticateCommander,
        revokeCommander,
        completedTaskIds,
        completedMilestoneIds,
        toggleTask,
        toggleMilestone,
        resetProgress,
        exportSnapshot,
        totalTasks,
        completedTasksCount,
        completionPercentage,
        totalMilestones,
        completedMilestonesCount,
        operationalPhasesCount,
        clearanceRank,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        isAudioMuted,
        toggleAudioMute,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error("useRoadmap must be used within a RoadmapProvider");
  }
  return context;
};
