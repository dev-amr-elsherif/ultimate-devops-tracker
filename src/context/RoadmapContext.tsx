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
import {
  ROADMAP_PHASES,
  TOTAL_TOPICS_COUNT,
  TOTAL_MILESTONES_COUNT,
} from "@/data/roadmapData";
import { soundFx } from "@/lib/audio";
import { getClearanceTier, ClearanceTierInfo } from "@/lib/canvasId";
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
  projectUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface TopicDetailState {
  completed?: boolean;
  completedAt?: string;
  userNotes?: string;
  proofOfWorkUrl?: string;
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

  // Custom avatar
  customAvatarUrl: string | null;
  updateCustomAvatar: (dataUrl: string) => void;

  // Topic / Task Completion State
  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  toggleTask: (taskId: string, phaseId: string) => void;
  toggleTopic: (topicId: string, phaseId: string) => void;
  toggleMilestone: (milestoneId: string, phaseId?: string) => void;
  resetProgress: () => void;
  exportRoadmapArchive: () => void;
  ingestRoadmapArchive: (snapshotInput: string | Record<string, unknown>) => boolean;

  // Topic User Notes & Proof of Work
  topicDetails: Record<string, TopicDetailState>;
  setTopicNotes: (topicId: string, notes: string) => void;
  setTopicProofOfWork: (topicId: string, url: string) => void;

  // Milestone Artifact Locker
  projectArtifacts: Record<string, ProjectArtifact>;
  setProjectArtifact: (milestoneId: string, artifact: Partial<ProjectArtifact>) => void;

  // Google Drive Cloud Sync
  driveSyncStatus: DriveSyncStatus;
  driveUser: DriveUser | null;
  driveLastSyncedAt: string | null;
  connectDrive: () => Promise<void>;
  disconnectDriveSession: () => void;
  syncDriveManual: () => Promise<void>;

  // Dynamic Telemetry metrics (NO HARDCODED NUMBERS)
  totalTasks: number; // dynamically computed TOTAL_ITEMS (121)
  completedTasksCount: number; // COMPLETED_ITEMS
  completionPercentage: number; // GLOBAL_PROGRESS
  totalMilestones: number; // 9
  completedMilestonesCount: number; // VERIFIED_ARTIFACTS
  operationalPhasesCount: number;
  clearanceRank: ClearanceTierInfo & { title: string };

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

  const [isCommander, setIsCommander] = useState<boolean>(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => new Set());
  const [completedMilestoneIds, setCompletedMilestoneIds] = useState<Set<string>>(() => new Set());
  const [topicDetails, setTopicDetails] = useState<Record<string, TopicDetailState>>({});
  const [projectArtifacts, setProjectArtifacts] = useState<Record<string, ProjectArtifact>>({});

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

  // Custom avatar URL
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  // Hydrate client-side state from storage safely after mount to prevent SSR mismatch
  useEffect(() => {
    try {
      if (checkCommanderStatus()) {
        setIsCommander(true);
      }

      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY);
      if (saved) {
        const parsed: RoadmapProgressState = JSON.parse(saved);
        if (Array.isArray(parsed.completedTaskIds)) {
          setCompletedTaskIds(new Set(parsed.completedTaskIds));
        }
        if (Array.isArray(parsed.completedMilestoneIds)) {
          setCompletedMilestoneIds(new Set(parsed.completedMilestoneIds));
        }
      }

      const savedDetails = localStorage.getItem(TASK_DETAILS_STORAGE_KEY);
      if (savedDetails) {
        setTopicDetails(JSON.parse(savedDetails));
      }

      const savedArtifacts = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
      if (savedArtifacts) {
        const parsedArt = JSON.parse(savedArtifacts);
        if (parsedArt && typeof parsedArt === "object") {
          setProjectArtifacts(parsedArt);
        }
      }

      const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedAvatar) {
        setCustomAvatarUrl(savedAvatar);
      }

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
        if (parsedUser) {
          setDriveUser(parsedUser);
          if (isEmailAuthorized(parsedUser.email)) {
            setIsCommander(true);
          }
        }
        setDriveSyncStatus("synced");
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
    } catch {}
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
    } catch {}
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
      } catch {}
    },
    [isCommander]
  );

  // Topic/Task toggle logic with Dual Security
  const toggleTopic = useCallback(
    (topicId: string, phaseId: string) => {
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
        const wasChecked = next.has(topicId);
        if (wasChecked) {
          next.delete(topicId);
          soundFx.playToggle(false);
        } else {
          next.add(topicId);
          soundFx.playToggle(true);

          // Check if this action completed all topics in the target phase
          const targetPhase = ROADMAP_PHASES.find((p) => p.phaseId === phaseId);
          if (targetPhase) {
            const phaseTopics = targetPhase.deepDiveTopics.flatMap((m) => m.topics.map((t) => t.id));
            const allComplete = phaseTopics.length > 0 && phaseTopics.every((id) => next.has(id));
            if (allComplete) {
              triggerCelebration();
              addToast({
                type: "milestone",
                title: "PHASE CURRICULUM DEFENDED",
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

  const toggleTask = toggleTopic;

  // Milestone deliverable verification toggle logic
  const toggleMilestone = useCallback(
    (milestoneId: string, phaseId?: string) => {
      if (!isCommander) {
        soundFx.playAccessDenied();
        addToast({
          type: "denied",
          title: "ACCESS DENIED",
          description: "Commander Mode authentication required to verify milestones.",
        });
        return;
      }

      const targetId = phaseId || milestoneId;

      setCompletedMilestoneIds((prev) => {
        const next = new Set(prev);
        const wasCompleted = next.has(targetId) || next.has(`${targetId}-milestone`);
        if (wasCompleted) {
          next.delete(targetId);
          next.delete(`${targetId}-milestone`);
          soundFx.playToggle(false);
        } else {
          next.add(targetId);
          triggerCelebration();
          const targetPhase = ROADMAP_PHASES.find(
            (p) => p.phaseId === targetId || `${p.phaseId}-milestone` === targetId
          );
          addToast({
            type: "milestone",
            title: "PROJECT MILESTONE DEFENDED",
            description: targetPhase
              ? `${targetPhase.milestoneDeliverables.primaryProject} verified!`
              : "Milestone successfully verified!",
          });
        }
        saveProgress(completedTaskIds, next);
        return next;
      });
    },
    [isCommander, addToast, completedTaskIds, saveProgress, triggerCelebration]
  );

  // User Notes & Proof of Work updates
  const setTopicNotes = useCallback(
    (topicId: string, notes: string) => {
      if (!isCommander) return;
      setTopicDetails((prev) => {
        const updated = {
          ...prev,
          [topicId]: {
            ...prev[topicId],
            userNotes: notes,
          },
        };
        try {
          localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [isCommander]
  );

  const setTopicProofOfWork = useCallback(
    (topicId: string, url: string) => {
      if (!isCommander) return;
      setTopicDetails((prev) => {
        const updated = {
          ...prev,
          [topicId]: {
            ...prev[topicId],
            proofOfWorkUrl: url,
          },
        };
        try {
          localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [isCommander]
  );

  // Proof-of-Work Project Artifact Locker
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
        } catch {}

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

  // Critical Telemetry Purge Protocol Modal Prompt
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

  // Reset Progress Execution
  const resetProgress = useCallback(() => {
    if (!isCommander) {
      soundFx.playAccessDenied();
      return;
    }
    setCompletedTaskIds(new Set());
    setCompletedMilestoneIds(new Set());
    setProjectArtifacts({});
    setTopicDetails({});
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

  // Dynamic Telemetry Metrics (NO HARDCODED NUMBERS)
  const totalTasks = TOTAL_TOPICS_COUNT; // 121
  const completedTasksCount = completedTaskIds.size;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const totalMilestones = TOTAL_MILESTONES_COUNT; // 9
  const completedMilestonesCount = completedMilestoneIds.size;

  // Operational Phases (all topics in phase completed)
  const operationalPhasesCount = useMemo(() => {
    return ROADMAP_PHASES.filter((phase) => {
      const topicIds = phase.deepDiveTopics.flatMap((m) => m.topics.map((t) => t.id));
      return topicIds.length > 0 && topicIds.every((id) => completedTaskIds.has(id));
    }).length;
  }, [completedTaskIds]);

  // Dynamic Clearance Rank calculation based on GLOBAL_PROGRESS
  const clearanceRank = useMemo(() => {
    const tier = getClearanceTier(completionPercentage);
    return {
      ...tier,
      title: tier.tier,
    };
  }, [completionPercentage]);

  // Export Roadmap Archive (v3.1.0 Full hydrated JSON state)
  const exportRoadmapArchive = useCallback(() => {
    soundFx.playBlip(980);
    const archive = generateCompleteArchive({
      completedTaskIds,
      completedMilestoneIds,
      taskDetails: topicDetails,
      artifacts: projectArtifacts,
      customAvatarUrl,
    });
    downloadArchiveFile(archive);
    addToast({
      type: "success",
      title: "SNAPSHOT EXPORTED",
      description: "Full hydrated curriculum archive JSON (v3.1.0) downloaded.",
    });
  }, [
    completedTaskIds,
    completedMilestoneIds,
    topicDetails,
    projectArtifacts,
    customAvatarUrl,
    addToast,
  ]);

  // Ingest Roadmap Archive JSON
  const ingestRoadmapArchive = useCallback(
    (snapshotInput: string | Record<string, unknown>): boolean => {
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
          taskDetails: detailsMap,
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

        if (detailsMap && Object.keys(detailsMap).length > 0) {
          setTopicDetails(detailsMap);
          try {
            localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(detailsMap));
          } catch {}
        }

        triggerCelebration();
        addToast({
          type: "success",
          title: "TELEMETRY INGESTED",
          description: `Successfully restored ${nextTasks.size} topics and ${nextMilestones.size} milestones from snapshot.`,
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
    [isCommander, saveProgress, triggerCelebration, addToast, setIsSnapshotModalOpen]
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
        const {
          taskIds: remoteTasks,
          milestoneIds: remoteMilestones,
          artifacts: remoteArtifacts,
          taskDetails: remoteDetails,
        } = parseRoadmapPayload(remoteSnapshot);

        const safeRemoteTasks = remoteTasks || [];
        const safeRemoteMilestones = remoteMilestones || [];

        setCompletedTaskIds((prevTasks) => {
          const mergedTasks = new Set([...Array.from(prevTasks), ...safeRemoteTasks]);
          setCompletedMilestoneIds((prevMilestones) => {
            const mergedMilestones = new Set([
              ...Array.from(prevMilestones),
              ...safeRemoteMilestones,
            ]);
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

        if (remoteDetails && Object.keys(remoteDetails).length > 0) {
          setTopicDetails((prevDetails) => {
            const mergedDetails = { ...prevDetails, ...remoteDetails };
            try {
              localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(mergedDetails));
            } catch {}
            return mergedDetails;
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
          taskDetails: topicDetails,
          artifacts: projectArtifacts,
          customAvatarUrl,
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
    completedTaskIds,
    completedMilestoneIds,
    topicDetails,
    projectArtifacts,
    customAvatarUrl,
    saveProgress,
    triggerCelebration,
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
      let detailsToPush = topicDetails;

      if (remote) {
        const {
          taskIds: remoteTasks,
          milestoneIds: remoteMilestones,
          artifacts: remoteArtifacts,
          taskDetails: remoteDetails,
        } = parseRoadmapPayload(remote);

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

        if (remoteDetails && Object.keys(remoteDetails).length > 0) {
          detailsToPush = { ...topicDetails, ...remoteDetails };
          setTopicDetails(detailsToPush);
          try {
            localStorage.setItem(TASK_DETAILS_STORAGE_KEY, JSON.stringify(detailsToPush));
          } catch {}
        }
      }

      const archive = generateCompleteArchive({
        completedTaskIds: tasksToPush,
        completedMilestoneIds: milestonesToPush,
        taskDetails: detailsToPush,
        artifacts: artifactsToPush,
        customAvatarUrl,
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
          description:
            "Google Drive authentication token expired or revoked. Please sign in again.",
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
    topicDetails,
    saveProgress,
    addToast,
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
        toggleTopic,
        toggleMilestone,
        resetProgress,
        exportRoadmapArchive,
        ingestRoadmapArchive,
        topicDetails,
        setTopicNotes,
        setTopicProofOfWork,
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
