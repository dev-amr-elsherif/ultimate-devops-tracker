"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import { ROADMAP_PHASES, Task } from "@/data/roadmapData";
import { soundFx } from "@/lib/audio";
import {
  DriveUser,
  DriveSyncStatus,
  SESSION_TOKEN_KEY,
  SESSION_USER_KEY,
  initiateGoogleAuth,
  pullFromDrive,
  pushToDrive,
  disconnectDrive,
} from "@/lib/googleDriveSync";

export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  return mounted;
}

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

export interface TelemetrySnapshot {
  version: string;
  exportedAt: string;
  clearanceRank: string;
  progressPercentage: number;
  completedTaskIds: string[];
  completedMilestoneIds: string[];
}

interface RoadmapContextType {
  isMounted: boolean;
  isCommander: boolean;
  isPasscodeModalOpen: boolean;
  setIsPasscodeModalOpen: (open: boolean) => void;
  isSnapshotModalOpen: boolean;
  setIsSnapshotModalOpen: (open: boolean) => void;
  authenticateCommander: (passcode: string) => boolean;
  revokeCommander: () => void;

  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  toggleTask: (taskId: string, phaseId: string) => void;
  toggleMilestone: (milestoneId: string, phaseId: string) => void;
  resetProgress: () => void;
  exportSnapshot: () => void;
  importSnapshot: (snapshotInput: string | TelemetrySnapshot) => boolean;

  // Google Drive Cloud Sync
  driveSyncStatus: DriveSyncStatus;
  driveUser: DriveUser | null;
  driveLastSyncedAt: string | null;
  connectDrive: () => Promise<void>;
  disconnectDriveSession: () => void;
  syncDriveManual: () => Promise<void>;

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
  const isMounted = useIsMounted();

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
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => soundFx.isMuted());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Google Drive Cloud Sync state
  const [driveSyncStatus, setDriveSyncStatus] = useState<DriveSyncStatus>("disconnected");
  const [driveUser, setDriveUser] = useState<DriveUser | null>(null);
  const [driveLastSyncedAt, setDriveLastSyncedAt] = useState<string | null>(null);
  const driveAccessTokenRef = useRef<string | null>(null);
  const autoPushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Restore Drive session from sessionStorage after initial mount
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
      const savedUserStr = sessionStorage.getItem(SESSION_USER_KEY);
      if (savedToken) {
        driveAccessTokenRef.current = savedToken;
        let parsedUser: DriveUser | null = null;
        if (savedUserStr) {
          try {
            parsedUser = JSON.parse(savedUserStr);
          } catch {}
        }
        queueMicrotask(() => {
          if (parsedUser) setDriveUser(parsedUser);
          setDriveSyncStatus("synced");
        });
      }
    } catch {}
  }, []);

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

  // Compute Telemetry
  const allTasks: Task[] = useMemo(
    () => ROADMAP_PHASES.flatMap((p) => p.modules.flatMap((m) => m.tasks)),
    []
  );
  const totalTasks = allTasks.length;
  const completedTasksCount = completedTaskIds.size;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const allMilestones = useMemo(() => ROADMAP_PHASES.flatMap((p) => p.milestones), []);
  const totalMilestones = allMilestones.length;
  const completedMilestonesCount = completedMilestoneIds.size;

  // Operational Phases (all tasks in phase completed)
  const operationalPhasesCount = ROADMAP_PHASES.filter((phase) => {
    const phaseTaskIds = phase.modules.flatMap((m) => m.tasks.map((t) => t.id));
    return phaseTaskIds.length > 0 && phaseTaskIds.every((id) => completedTaskIds.has(id));
  }).length;

  // Dynamic Clearance Rank
  const clearanceRank = useMemo(() => {
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
  }, [completionPercentage]);

  // Export Snapshot JSON
  const exportSnapshot = useCallback(() => {
    soundFx.playBlip(980);
    const data: TelemetrySnapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      clearanceRank: clearanceRank.title,
      progressPercentage: completionPercentage,
      completedTaskIds: Array.from(completedTaskIds),
      completedMilestoneIds: Array.from(completedMilestoneIds),
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
  }, [completedTaskIds, completedMilestoneIds, clearanceRank.title, completionPercentage, addToast]);

  // Ingest / Import Snapshot JSON
  const importSnapshot = useCallback(
    (snapshotInput: string | TelemetrySnapshot): boolean => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to ingest telemetry snapshots.",
        });
        setIsPasscodeModalOpen(true);
        return false;
      }

      try {
        let data: TelemetrySnapshot;
        if (typeof snapshotInput === "string") {
          data = JSON.parse(snapshotInput.trim());
        } else {
          data = snapshotInput;
        }

        if (!data || typeof data !== "object") {
          throw new Error("Invalid snapshot format: Expected a JSON object.");
        }

        if (!Array.isArray(data.completedTaskIds) || !Array.isArray(data.completedMilestoneIds)) {
          throw new Error("Invalid payload: Missing completedTaskIds or completedMilestoneIds arrays.");
        }

        const nextTasks = new Set(data.completedTaskIds.filter((id) => typeof id === "string"));
        const nextMilestones = new Set(data.completedMilestoneIds.filter((id) => typeof id === "string"));

        setCompletedTaskIds(nextTasks);
        setCompletedMilestoneIds(nextMilestones);
        saveProgress(nextTasks, nextMilestones);

        triggerCelebration();
        addToast({
          type: "success",
          title: "TELEMETRY INGESTED",
          description: `Successfully restored ${nextTasks.size} tasks and ${nextMilestones.size} milestones from snapshot.`,
        });
        setIsSnapshotModalOpen(false);
        return true;
      } catch (err) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "INGEST FAILED",
          description: err instanceof Error ? err.message : "Malformed telemetry JSON snapshot.",
        });
        return false;
      }
    },
    [isCommander, addToast, saveProgress, triggerCelebration, setIsPasscodeModalOpen]
  );

  // Google Drive Connection & Ingest
  const connectDrive = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.trim() === "" || clientId.includes("your-google-client-id")) {
      soundFx.playAccessDenied();
      addToast({
        type: "denied",
        title: "GOOGLE CLIENT ID NOT CONFIGURED",
        description:
          "Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment (.env.local) to activate Google Drive cloud sync.",
      });
      return;
    }

    setDriveSyncStatus("connecting");
    soundFx.playBlip(600);

    try {
      const { accessToken, user } = await initiateGoogleAuth(clientId);
      driveAccessTokenRef.current = accessToken;
      setDriveUser(user);

      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, accessToken);
        if (user) {
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        }
      } catch {}

      setDriveSyncStatus("syncing");
      addToast({
        type: "info",
        title: "GOOGLE DRIVE CONNECTED",
        description: `Connected as ${user?.email || user?.name || "Authenticated User"}. Accessing appDataFolder...`,
      });

      // Try pulling from drive
      const remoteSnapshot = await pullFromDrive(accessToken);

      if (remoteSnapshot) {
        const remoteTasks = remoteSnapshot.completedTaskIds || [];
        const remoteMilestones = remoteSnapshot.completedMilestoneIds || [];

        setCompletedTaskIds((prevTasks) => {
          const mergedTasks = new Set([...Array.from(prevTasks), ...remoteTasks]);
          setCompletedMilestoneIds((prevMilestones) => {
            const mergedMilestones = new Set([...Array.from(prevMilestones), ...remoteMilestones]);
            saveProgress(mergedTasks, mergedMilestones);
            return mergedMilestones;
          });
          return mergedTasks;
        });

        triggerCelebration();
        addToast({
          type: "success",
          title: "CLOUD TELEMETRY SYNCED",
          description: "Telemetry synchronized from Google Drive appDataFolder.",
        });
      } else {
        // No remote file found: upload current local telemetry
        const snapshot: TelemetrySnapshot = {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          clearanceRank: clearanceRank.title,
          progressPercentage: completionPercentage,
          completedTaskIds: Array.from(completedTaskIds),
          completedMilestoneIds: Array.from(completedMilestoneIds),
        };
        await pushToDrive(accessToken, snapshot);
        addToast({
          type: "success",
          title: "INITIAL TELEMETRY UPLOADED",
          description: "Local roadmap state saved to Google Drive appDataFolder.",
        });
      }

      setDriveSyncStatus("synced");
      setDriveLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setDriveSyncStatus("disconnected");
      soundFx.playAccessDenied();
      const msg = err instanceof Error ? err.message : "Failed to authenticate with Google.";
      addToast({
        type: "denied",
        title: "DRIVE SYNC FAILED",
        description: msg,
      });
    }
  }, [
    addToast,
    clearanceRank.title,
    completionPercentage,
    completedTaskIds,
    completedMilestoneIds,
    saveProgress,
    triggerCelebration,
  ]);

  // Disconnect Drive
  const disconnectDriveSession = useCallback(() => {
    disconnectDrive(driveAccessTokenRef.current || undefined);
    driveAccessTokenRef.current = null;
    setDriveSyncStatus("disconnected");
    setDriveUser(null);
    soundFx.playBlip(400);
    addToast({
      type: "info",
      title: "DRIVE DISCONNECTED",
      description: "Google Drive session terminated. Local telemetry retained.",
    });
  }, [addToast]);

  // Manual Trigger to Push & Pull Drive Telemetry
  const syncDriveManual = useCallback(async () => {
    const token = driveAccessTokenRef.current;
    if (!token) {
      return connectDrive();
    }

    setDriveSyncStatus("syncing");
    soundFx.playBlip(750);

    try {
      const remote = await pullFromDrive(token);
      let tasksToPush = completedTaskIds;
      let milestonesToPush = completedMilestoneIds;

      if (remote) {
        tasksToPush = new Set([...Array.from(completedTaskIds), ...(remote.completedTaskIds || [])]);
        milestonesToPush = new Set([
          ...Array.from(completedMilestoneIds),
          ...(remote.completedMilestoneIds || []),
        ]);
        setCompletedTaskIds(tasksToPush);
        setCompletedMilestoneIds(milestonesToPush);
        saveProgress(tasksToPush, milestonesToPush);
      }

      const snapshot: TelemetrySnapshot = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        clearanceRank: clearanceRank.title,
        progressPercentage: totalTasks > 0 ? Math.round((tasksToPush.size / totalTasks) * 100) : 0,
        completedTaskIds: Array.from(tasksToPush),
        completedMilestoneIds: Array.from(milestonesToPush),
      };

      await pushToDrive(token, snapshot);

      setDriveSyncStatus("synced");
      setDriveLastSyncedAt(new Date().toLocaleTimeString());
      soundFx.playCommanderUnlock();
      addToast({
        type: "success",
        title: "MANUAL SYNC COMPLETE",
        description: "Google Drive appDataFolder updated with latest telemetry.",
      });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        disconnectDriveSession();
        addToast({
          type: "denied",
          title: "SESSION EXPIRED",
          description: "Google Drive session token expired. Please reconnect.",
        });
      } else {
        setDriveSyncStatus("synced");
        addToast({
          type: "denied",
          title: "SYNC ERROR",
          description: err instanceof Error ? err.message : "Failed to sync with Google Drive.",
        });
      }
    }
  }, [
    completedTaskIds,
    completedMilestoneIds,
    clearanceRank.title,
    totalTasks,
    saveProgress,
    addToast,
    connectDrive,
    disconnectDriveSession,
  ]);

  // Debounced background auto-push whenever tasks or milestones change in Commander Mode
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isCommander || driveSyncStatus !== "synced" || !driveAccessTokenRef.current) {
      return;
    }

    if (autoPushTimerRef.current) {
      clearTimeout(autoPushTimerRef.current);
    }

    autoPushTimerRef.current = setTimeout(async () => {
      const token = driveAccessTokenRef.current;
      if (!token) return;

      try {
        setDriveSyncStatus("syncing");
        const snapshot: TelemetrySnapshot = {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          clearanceRank: clearanceRank.title,
          progressPercentage: completionPercentage,
          completedTaskIds: Array.from(completedTaskIds),
          completedMilestoneIds: Array.from(completedMilestoneIds),
        };
        await pushToDrive(token, snapshot);
        setDriveSyncStatus("synced");
        setDriveLastSyncedAt(new Date().toLocaleTimeString());
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          disconnectDriveSession();
        } else {
          setDriveSyncStatus("synced");
        }
      }
    }, 1500);

    return () => {
      if (autoPushTimerRef.current) {
        clearTimeout(autoPushTimerRef.current);
      }
    };
  }, [
    completedTaskIds,
    completedMilestoneIds,
    isCommander,
    driveSyncStatus,
    clearanceRank.title,
    completionPercentage,
    disconnectDriveSession,
  ]);

  return (
    <RoadmapContext.Provider
      value={{
        isMounted,
        isCommander,
        isPasscodeModalOpen,
        setIsPasscodeModalOpen,
        isSnapshotModalOpen,
        setIsSnapshotModalOpen,
        authenticateCommander,
        revokeCommander,
        completedTaskIds,
        completedMilestoneIds,
        toggleTask,
        toggleMilestone,
        resetProgress,
        exportSnapshot,
        importSnapshot,
        driveSyncStatus,
        driveUser,
        driveLastSyncedAt,
        connectDrive,
        disconnectDriveSession,
        syncDriveManual,
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
