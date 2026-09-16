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
import {
  FullRoadmapArchive,
  generateCompleteArchive,
  downloadArchiveFile,
  parseRoadmapPayload,
} from "@/lib/snapshotEngine";

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

export interface ProjectArtifact {
  repoUrl?: string;
  liveUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface RoadmapProgressState {
  completedTaskIds: string[];
  completedMilestoneIds: string[];
  notes: Record<string, string>;
  projectArtifacts?: Record<string, ProjectArtifact>;
  lastUpdated: string;
}

interface RoadmapContextType {
  isMounted: boolean;
  isCommander: boolean;
  isSnapshotModalOpen: boolean;
  setIsSnapshotModalOpen: (open: boolean) => void;
  isBadgeModalOpen: boolean;
  setIsBadgeModalOpen: (open: boolean) => void;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  promptResetProgress: () => void;
  logoutCommander: () => void;
  revokeCommander: () => void;
  setTestCommander: (enabled: boolean) => void;

  // Custom avatar (Commander-only upload)
  customAvatarUrl: string | null;
  updateCustomAvatar: (dataUrl: string) => void;

  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  toggleTask: (taskId: string, phaseId: string) => void;
  toggleMilestone: (milestoneId: string, phaseId: string) => void;
  resetProgress: () => void;
  exportRoadmapArchive: () => void;
  ingestRoadmapArchive: (snapshotInput: string | Record<string, any>) => boolean;

  // Proof-of-Work Artifact Locker
  projectArtifacts: Record<string, ProjectArtifact>;
  setProjectArtifact: (milestoneId: string, artifact: Partial<ProjectArtifact>) => void;

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
const ALT_STORAGE_KEY = "devops_roadmap_state";
const ARTIFACTS_STORAGE_KEY = "devops_roadmap_artifacts";
const AVATAR_STORAGE_KEY = "devops_roadmap_avatar";
export const TASK_DETAILS_STORAGE_KEY = "devops_roadmap_task_details";
export const AUTHORIZED_COMMANDERS = [
  "dev.amrelsherif@gmail.com",
  "amrelsherif.swe@gmail.com",
  "amrelsherif.ops@gmail.com",
];

export const isEmailAuthorized = (email?: string | null): boolean => {
  if (!email) return false;
  return AUTHORIZED_COMMANDERS.includes(email.toLowerCase().trim());
};

export const checkCommanderStatus = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    if (
      localStorage.getItem("devops_test_commander") === "true" ||
      sessionStorage.getItem("devops_test_commander") === "true"
    ) {
      return true;
    }
    const savedUserStr = sessionStorage.getItem(SESSION_USER_KEY);
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      return isEmailAuthorized(parsed?.email);
    }
  } catch {}
  return false;
};

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMounted = useIsMounted();

  // Initialize Commander state via Google Identity session or test hook
  const [isCommander, setIsCommander] = useState<boolean>(() => checkCommanderStatus());

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY);
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
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY);
      if (saved) {
        const parsed: RoadmapProgressState = JSON.parse(saved);
        if (Array.isArray(parsed.completedMilestoneIds)) {
          return new Set(parsed.completedMilestoneIds);
        }
      }
    } catch {}
    return new Set();
  });

  const [projectArtifacts, setProjectArtifacts] = useState<Record<string, ProjectArtifact>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch {}
    return {};
  });

  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => soundFx.isMuted());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Google Drive Cloud Sync state
  const [driveSyncStatus, setDriveSyncStatus] = useState<DriveSyncStatus>("disconnected");
  const [driveUser, setDriveUser] = useState<DriveUser | null>(null);
  const [driveLastSyncedAt, setDriveLastSyncedAt] = useState<string | null>(null);
  const driveAccessTokenRef = useRef<string | null>(null);

  // Custom avatar URL (Commander-only upload, persisted to localStorage)
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(AVATAR_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Restore Drive session and Commander state from storage after initial mount
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
          if (parsedUser) {
            setDriveUser(parsedUser);
            if (isEmailAuthorized(parsedUser.email)) {
              setIsCommander(true);
            }
          }
          setDriveSyncStatus("synced");
        });
      }
    } catch {}
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
      localStorage.setItem(ALT_STORAGE_KEY, JSON.stringify(payload));
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

  // Programmatic Test Hook for Automated Testing (Playwright)
  const setTestCommander = useCallback(
    (enabled: boolean) => {
      try {
        if (enabled) {
          localStorage.setItem("devops_test_commander", "true");
          sessionStorage.setItem("devops_test_commander", "true");
        } else {
          localStorage.removeItem("devops_test_commander");
          sessionStorage.removeItem("devops_test_commander");
        }
      } catch {}
      setIsCommander(enabled);
      if (enabled) {
        soundFx.playCommanderUnlock();
        addToast({
          type: "success",
          title: "COMMANDER CLEARANCE ACTIVE",
          description: "Authorization verified. Master write access enabled.",
        });
      } else {
        soundFx.playBlip(440);
        addToast({
          type: "info",
          title: "OBSERVER MODE RESTORED",
          description: "Terminal restricted to public view-only telemetry.",
        });
      }
    },
    [addToast]
  );

  // Expose test helper on window for browser-level Playwright execution
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __setTestCommander?: (enabled: boolean) => void }).__setTestCommander =
        setTestCommander;
    }
  }, [setTestCommander]);

  const toggleAudioMute = useCallback(() => {
    const nextMute = soundFx.toggleMute();
    setIsAudioMuted(nextMute);
  }, []);

  const updateCustomAvatar = useCallback(
    (dataUrl: string) => {
      if (!isCommander) return;
      setCustomAvatarUrl(dataUrl);
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
      } catch {
        // Ignore quota errors for large data URLs
      }
    },
    [isCommander]
  );

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

  // Proof-of-Work Artifact Locker
  const setProjectArtifact = useCallback(
    (milestoneId: string, artifact: Partial<ProjectArtifact>) => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to attach or edit milestone artifacts.",
        });
        return;
      }

      setProjectArtifacts((prev) => {
        const existing = prev[milestoneId] || {};
        const updated: ProjectArtifact = {
          ...existing,
          ...artifact,
          updatedAt: new Date().toISOString(),
        };

        const next = {
          ...prev,
          [milestoneId]: updated,
        };

        try {
          localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage write error
        }

        soundFx.playSuccess();
        addToast({
          type: "success",
          title: "ARTIFACT SECURED: Project evidence linked",
          description: "Proof-of-work artifact recorded for this milestone.",
        });

        return next;
      });
    },
    [isCommander, addToast]
  );

  // Prompt Reset Progress (Triggers Cyberpunk Confirmation Modal)
  const promptResetProgress = useCallback(() => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      addToast({
        type: "denied",
        title: "ACCESS DENIED",
        description: "Commander Mode authentication required to purge telemetry.",
      });
      return;
    }
    soundFx.playErrorBuzz();
    setIsResetModalOpen(true);
  }, [isCommander, addToast]);

  // Reset Progress
  const resetProgress = useCallback(() => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      return;
    }
    setCompletedTaskIds(new Set());
    setCompletedMilestoneIds(new Set());
    setProjectArtifacts({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ALT_STORAGE_KEY);
      localStorage.removeItem(ARTIFACTS_STORAGE_KEY);
      localStorage.removeItem(TASK_DETAILS_STORAGE_KEY);
    } catch {}
    setIsResetModalOpen(false);
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

  // Export Roadmap Archive (v3.0.0 FullRoadmapArchive)
  const exportRoadmapArchive = useCallback(() => {
    soundFx.playBlip(980);
    const taskDetails: Record<string, any> = {};
    try {
      const savedDetailsStr = localStorage.getItem(TASK_DETAILS_STORAGE_KEY);
      if (savedDetailsStr) {
        Object.assign(taskDetails, JSON.parse(savedDetailsStr));
      }
    } catch {}

    const archive = generateCompleteArchive({
      completedTaskIds,
      completedMilestoneIds,
      taskDetails,
      artifacts: projectArtifacts,
      userEmail: driveUser?.email,
      isCommander,
      avatarUrl: customAvatarUrl,
      completionPercentage,
    });
    downloadArchiveFile(archive);
    addToast({
      type: "success",
      title: "SNAPSHOT EXPORTED",
      description: "Complete curriculum archive JSON (v3.0.0) with live tree state downloaded.",
    });
  }, [
    completedTaskIds,
    completedMilestoneIds,
    projectArtifacts,
    driveUser?.email,
    isCommander,
    customAvatarUrl,
    completionPercentage,
    addToast,
  ]);

  // Ingest Roadmap Archive JSON
  const ingestRoadmapArchive = useCallback(
    (snapshotInput: string | Record<string, any>): boolean => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to ingest telemetry snapshots.",
        });
        return false;
      }

      try {
        let raw: unknown;
        if (typeof snapshotInput === "string") {
          raw = JSON.parse(snapshotInput.trim());
        } else {
          raw = snapshotInput;
        }

        if (!raw || typeof raw !== "object") {
          throw new Error("Invalid snapshot format: Expected a JSON object.");
        }

        const {
          taskIds,
          milestoneIds,
          artifacts: artifactsMap,
          taskDetails: taskDetailsMap,
          customAvatarUrl: importedAvatar,
        } = parseRoadmapPayload(raw);

        if (!taskIds || !milestoneIds) {
          throw new Error("Missing completedTaskIds or completedMilestoneIds arrays.");
        }

        const nextTasks = new Set(taskIds.filter((id) => typeof id === "string"));
        const nextMilestones = new Set(milestoneIds.filter((id) => typeof id === "string"));

        setCompletedTaskIds(nextTasks);
        setCompletedMilestoneIds(nextMilestones);
        saveProgress(nextTasks, nextMilestones);

        if (importedAvatar) {
          setCustomAvatarUrl(importedAvatar);
          try {
            localStorage.setItem(AVATAR_STORAGE_KEY, importedAvatar);
          } catch {}
        }

        if (artifactsMap && typeof artifactsMap === "object") {
          setProjectArtifacts(artifactsMap);
          try {
            localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(artifactsMap));
          } catch {}
        }

        if (taskDetailsMap && Object.keys(taskDetailsMap).length > 0) {
          try {
            localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(taskDetailsMap));
          } catch {}
        }

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
    [
      isCommander,
      saveProgress,
      triggerCelebration,
      addToast,
      setIsSnapshotModalOpen,
    ]
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

      const isAuth = isEmailAuthorized(user?.email);
      setIsCommander(isAuth);

      try {
        sessionStorage.setItem(SESSION_TOKEN_KEY, accessToken);
        if (user) {
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
        }
      } catch {}

      setDriveSyncStatus("syncing");
      if (isAuth) {
        soundFx.playCommanderUnlock();
        addToast({
          type: "success",
          title: "COMMANDER CLEARANCE GRANTED",
          description: `Master access unlocked for authorized Commander: ${user?.email}`,
        });
      } else {
        addToast({
          type: "info",
          title: "OBSERVER ACCESS ONLY",
          description: `Signed in as ${user?.email || "Authenticated User"}. Read-only telemetry privileges.`,
        });
      }

      // Try pulling from drive
      const remoteSnapshot = await pullFromDrive(accessToken);

      if (remoteSnapshot) {
        const { taskIds: remoteTasks, milestoneIds: remoteMilestones, artifacts: remoteArtifacts } =
          parseRoadmapPayload(remoteSnapshot);

        const safeRemoteTasks = remoteTasks || [];
        const safeRemoteMilestones = remoteMilestones || [];

        setCompletedTaskIds((prevTasks) => {
          const mergedTasks = new Set([...Array.from(prevTasks), ...safeRemoteTasks]);
          setCompletedMilestoneIds((prevMilestones) => {
            const mergedMilestones = new Set([...Array.from(prevMilestones), ...safeRemoteMilestones]);
            saveProgress(mergedTasks, mergedMilestones);
            return mergedMilestones;
          });
          return mergedTasks;
        });

        if (remoteArtifacts && Object.keys(remoteArtifacts).length > 0) {
          setProjectArtifacts((prevArtifacts) => {
            const mergedArtifacts = { ...prevArtifacts, ...remoteArtifacts };
            try {
              localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(mergedArtifacts));
            } catch {}
            return mergedArtifacts;
          });
        }

        triggerCelebration();
        addToast({
          type: "success",
          title: "CLOUD TELEMETRY SYNCED",
          description: "Telemetry synchronized from Google Drive appDataFolder.",
        });
      } else {
        // No remote file found: upload current local telemetry
        const archive = generateCompleteArchive({
          completedTaskIds,
          completedMilestoneIds,
          taskDetails: {},
          artifacts: projectArtifacts,
          userEmail: driveUser?.email,
          isCommander,
          avatarUrl: customAvatarUrl,
          completionPercentage,
        });
        await pushToDrive(accessToken, archive);
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
    projectArtifacts,
    saveProgress,
    triggerCelebration,
    driveUser?.email,
    isCommander,
    customAvatarUrl,
  ]);

  // Disconnect Drive
  const disconnectDriveSession = useCallback(() => {
    disconnectDrive(driveAccessTokenRef.current || undefined);
    driveAccessTokenRef.current = null;
    setDriveSyncStatus("disconnected");
    setDriveUser(null);
    setIsCommander(false);
    try {
      localStorage.removeItem("devops_test_commander");
      sessionStorage.removeItem("devops_test_commander");
    } catch {}
    soundFx.playBlip(400);
    addToast({
      type: "info",
      title: "DRIVE DISCONNECTED",
      description: "Google Drive session terminated. Commander privileges revoked.",
    });
  }, [addToast]);

  const logoutCommander = useCallback(() => {
    disconnectDriveSession();
  }, [disconnectDriveSession]);

  const revokeCommander = logoutCommander;

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
      let artifactsToPush = projectArtifacts;

      if (remote) {
        const { taskIds: remoteTasks, milestoneIds: remoteMilestones, artifacts: remoteArtifacts } =
          parseRoadmapPayload(remote);

        const safeRemoteTasks = remoteTasks || [];
        const safeRemoteMilestones = remoteMilestones || [];

        tasksToPush = new Set([...Array.from(completedTaskIds), ...safeRemoteTasks]);
        milestonesToPush = new Set([
          ...Array.from(completedMilestoneIds),
          ...safeRemoteMilestones,
        ]);
        setCompletedTaskIds(tasksToPush);
        setCompletedMilestoneIds(milestonesToPush);
        saveProgress(tasksToPush, milestonesToPush);

        if (remoteArtifacts && Object.keys(remoteArtifacts).length > 0) {
          artifactsToPush = { ...projectArtifacts, ...remoteArtifacts };
          setProjectArtifacts(artifactsToPush);
          try {
            localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(artifactsToPush));
          } catch {}
        }
      }

      const archive = generateCompleteArchive({
        completedTaskIds: tasksToPush,
        completedMilestoneIds: milestonesToPush,
        taskDetails: {},
        artifacts: artifactsToPush,
        userEmail: driveUser?.email,
        isCommander,
        avatarUrl: customAvatarUrl,
        completionPercentage: totalTasks > 0 ? Math.round((tasksToPush.size / totalTasks) * 100) : 0,
      });

      await pushToDrive(token, archive);

      setDriveSyncStatus("synced");
      setDriveLastSyncedAt(new Date().toLocaleTimeString());
      soundFx.playBlip(880);
      addToast({
        type: "success",
        title: "TELEMETRY BACKUP SYNCED TO DRIVE",
        description: "Google Drive appDataFolder updated with latest telemetry.",
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "";
      if (
        errMsg === "UNAUTHORIZED" ||
        errMsg.includes("401") ||
        errMsg.toLowerCase().includes("revoked") ||
        errMsg.toLowerCase().includes("invalid_grant")
      ) {
        disconnectDriveSession();
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "SESSION EXPIRED",
          description: "Google Drive authentication token expired or revoked. Please sign in again.",
        });
      } else {
        setDriveSyncStatus("error");
        soundFx.playErrorBuzz();
        addToast({
          type: "denied",
          title: "SYNC FAILED",
          description: errMsg || "Failed to synchronize telemetry with Google Drive.",
        });
      }
    }
  }, [
    completedMilestoneIds,
    completedTaskIds,
    connectDrive,
    disconnectDriveSession,
    projectArtifacts,
    saveProgress,
    totalTasks,
    addToast,
    driveUser?.email,
    isCommander,
    customAvatarUrl,
  ]);

  return (
    <RoadmapContext.Provider
      value={{
        isMounted,
        isCommander,
        isSnapshotModalOpen,
        setIsSnapshotModalOpen,
        isBadgeModalOpen,
        setIsBadgeModalOpen,
        isResetModalOpen,
        setIsResetModalOpen,
        promptResetProgress,
        logoutCommander,
        revokeCommander,
        setTestCommander,
        customAvatarUrl,
        updateCustomAvatar,
        completedTaskIds,
        completedMilestoneIds,
        toggleTask,
        toggleMilestone,
        resetProgress,
        exportRoadmapArchive,
        ingestRoadmapArchive,
        projectArtifacts,
        setProjectArtifact,
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
