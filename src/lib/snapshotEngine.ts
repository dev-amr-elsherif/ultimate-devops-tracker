import { ROADMAP_PHASES, TOTAL_TOPICS_COUNT } from "@/data/roadmapData";
import { getClearanceTier } from "@/lib/canvasId";
import {
  DeepDiveTopic,
  MilestoneDeliverables,
  ProjectArtifact,
  TopicDetailState,
} from "@/types/roadmap";

export interface FullRoadmapArchive {
  schemaVersion: "3.1.0";
  roadmapTitle: string;
  curriculumArchitecture: string;
  exportedAt: string;
  telemetry: {
    totalPhases: number;
    totalTopics: number;
    completedTopics: number;
    globalProgress: number;
    verifiedMilestones: number;
    clearanceTier: string;
  };
  engineer: {
    name: string;
    avatarUrl?: string | null;
  };
  phases: Array<{
    phaseId: string;
    phaseOrder: number;
    trackType: "sequential" | "parallel";
    parallelWith: string | null;
    title: string;
    description: string;
    courseraSearchQueries: string[];
    phaseProgress: number;
    isFullyDefended: boolean;
    deepDiveTopics: Array<{
      module: string;
      topics: DeepDiveTopic[];
    }>;
    milestoneDeliverables: MilestoneDeliverables & {
      repoUrl?: string | null;
      notes?: string | null;
    };
  }>;
}

export interface GenerateArchiveParams {
  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  taskDetails?: Record<string, TopicDetailState>;
  artifacts?: Record<string, ProjectArtifact>;
  customAvatarUrl?: string | null;
}

export function generateCompleteArchive(params: GenerateArchiveParams): FullRoadmapArchive {
  const completedTaskIds = params.completedTaskIds;
  const completedMilestoneIds = params.completedMilestoneIds;
  const taskDetails = params.taskDetails || {};
  const artifacts = params.artifacts || {};

  const totalTopics = TOTAL_TOPICS_COUNT;
  let completedTopicsCount = 0;
  let verifiedMilestonesCount = 0;

  const phases = ROADMAP_PHASES.map((phase) => {
    let phaseTopicsCount = 0;
    let phaseCompletedCount = 0;

    const hydratedModules = phase.deepDiveTopics.map((mod) => {
      const topics: DeepDiveTopic[] = mod.topics.map((t) => {
        phaseTopicsCount++;
        const isDone = completedTaskIds.has(t.id);
        if (isDone) {
          phaseCompletedCount++;
          completedTopicsCount++;
        }

        const details = taskDetails[t.id];
        const proof = artifacts[t.id];

        return {
          id: t.id,
          topicTitle: t.topicTitle,
          isCompleted: isDone,
          completedAt: isDone
            ? (details?.completedAt || new Date().toISOString())
            : null,
          userNotes: details?.userNotes || "",
          proofOfWorkUrl: details?.proofOfWorkUrl || proof?.repoUrl || proof?.liveUrl || null,
        };
      });

      return {
        module: mod.module,
        topics,
      };
    });

    const phaseProgress =
      phaseTopicsCount > 0
        ? Math.round((phaseCompletedCount / phaseTopicsCount) * 100)
        : 0;

    const isMilestoneVerified =
      completedMilestoneIds.has(phase.phaseId) ||
      completedMilestoneIds.has(`${phase.phaseId}-milestone`);

    if (isMilestoneVerified) {
      verifiedMilestonesCount++;
    }

    const milestoneArtifact = artifacts[phase.phaseId] || artifacts[`${phase.phaseId}-milestone`];

    const milestoneDeliverables = {
      ...phase.milestoneDeliverables,
      isVerified: isMilestoneVerified,
      verifiedAt: isMilestoneVerified
        ? (milestoneArtifact?.updatedAt || new Date().toISOString())
        : null,
      projectUrl: milestoneArtifact?.liveUrl || milestoneArtifact?.projectUrl || null,
      repoUrl: milestoneArtifact?.repoUrl || null,
      notes: milestoneArtifact?.notes || null,
    };

    const isFullyDefended = phaseProgress === 100 && isMilestoneVerified;

    return {
      phaseId: phase.phaseId,
      phaseOrder: phase.phaseOrder,
      trackType: phase.trackType,
      parallelWith: phase.parallelWith,
      title: phase.title,
      description: phase.description,
      courseraSearchQueries: phase.courseraSearchQueries,
      phaseProgress,
      isFullyDefended,
      deepDiveTopics: hydratedModules,
      milestoneDeliverables,
    };
  });

  const globalProgress =
    totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
  const tierInfo = getClearanceTier(globalProgress);

  return {
    schemaVersion: "3.1.0",
    roadmapTitle: "DevOps & Cloud Engineering Comprehensive Master Roadmap (2026)",
    curriculumArchitecture:
      "Sequential Foundations with Concurrent Parallel Execution Tracks",
    exportedAt: new Date().toISOString(),
    telemetry: {
      totalPhases: phases.length,
      totalTopics,
      completedTopics: completedTopicsCount,
      globalProgress,
      verifiedMilestones: verifiedMilestonesCount,
      clearanceTier: tierInfo.tier,
    },
    engineer: {
      name: "Amr Fathy Elsherif",
    },
    phases,
  };
}

export function downloadArchiveFile(archive: FullRoadmapArchive) {
  const jsonStr = JSON.stringify(archive, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `devops-complete-roadmap-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedRoadmapPayload {
  taskIds: string[] | null;
  milestoneIds: string[] | null;
  artifacts: Record<string, ProjectArtifact>;
  taskDetails: Record<string, TopicDetailState>;
  customAvatarUrl?: string | null;
  clearanceRank?: string;
  completionPercentage?: number;
  schemaVersion?: string;
}

// Legacy schema migration mapping table
const LEGACY_TASK_MAPPING: Record<string, string> = {
  // Phase 0 -> Phase 01
  "task-0.1.1": "phase-01-m0-t0",
  "task-0.1.2": "phase-01-m0-t1",
  "task-0.2.1": "phase-01-m1-t0",
  "task-0.2.2": "phase-01-m1-t1",
  "task-0.2.3": "phase-01-m1-t2",
  // Phase 1 -> Phase 01
  "task-1.1.1": "phase-01-m3-t0",
  "task-1.1.2": "phase-01-m3-t1",
  "task-1.2.1": "phase-01-m4-t0",
  "task-1.2.2": "phase-01-m4-t1",
  // Phase 2 -> Phase 02
  "task-2.1.1": "phase-02-m0-t0",
  "task-2.1.2": "phase-02-m0-t1",
  // Phase 3 -> Phase 02
  "task-3.1.1": "phase-02-m3-t0",
  "task-3.1.2": "phase-02-m3-t1",
  // Phase 4 -> Phase 03
  "task-4.1.1": "phase-03-m0-t0",
  "task-4.1.2": "phase-03-m0-t1",
  // Phase 5 -> Phase 04
  "task-5.1.1": "phase-04-m0-t0",
  "task-5.1.2": "phase-04-m1-t0",
  // Phase 6 -> Phase 05
  "task-6.1.1": "phase-05-m0-t0",
  // Phase 7 -> Phase 06
  "task-7.1.1": "phase-06-m0-t0",
  // Phase 8 -> Phase 05
  "task-8.1.1": "phase-05-m2-t0",
  // Phase 9 -> Phase 07
  "task-9.1.1": "phase-07-m0-t0",
  // Phase 10 -> Phase 08
  "task-10.1.1": "phase-08-m0-t0",
  // Phase 11 -> Phase 09
  "task-11.1.1": "phase-09-m0-t0",
};

const LEGACY_MILESTONE_MAPPING: Record<string, string> = {
  "ms-sys-init-probe": "phase-01",
  "server-stats": "phase-01",
  "ms-log-archive": "phase-02",
  "ms-reverse-proxy": "phase-03",
  "ms-distroless-container": "phase-04",
  "ms-iac-multiaz": "phase-05",
  "ms-cicd-pipeline": "phase-06",
  "ms-k8s-fleet": "phase-07",
  "ms-observability-red": "phase-08",
  "ms-chaos-enterprise": "phase-09",
};

export function parseRoadmapPayload(raw: unknown): ParsedRoadmapPayload {
  if (!raw || typeof raw !== "object") {
    return {
      taskIds: null,
      milestoneIds: null,
      artifacts: {},
      taskDetails: {},
    };
  }

  const data = raw as Record<string, unknown>;
  let taskIds: string[] | null = null;
  let milestoneIds: string[] | null = null;
  const artifacts: Record<string, ProjectArtifact> = {};
  const taskDetails: Record<string, TopicDetailState> = {};
  let customAvatarUrl: string | null = null;
  let clearanceRank: string = "TIER 1: SYSTEMS OPERATOR";
  let completionPercentage: number = 0;
  const schemaVersion: string =
    typeof data.schemaVersion === "string"
      ? data.schemaVersion
      : typeof data.version === "string"
      ? data.version
      : "3.1.0";

  // Helper to map a topic/task ID safely
  const mapTaskId = (id: string): string => {
    if (LEGACY_TASK_MAPPING[id]) return LEGACY_TASK_MAPPING[id];
    return id;
  };

  const mapMilestoneId = (id: string): string => {
    if (LEGACY_MILESTONE_MAPPING[id]) return LEGACY_MILESTONE_MAPPING[id];
    return id;
  };

  // Case 1: Schema 3.1.0 full archive with deepDiveTopics
  if (Array.isArray(data.phases)) {
    const extractedTaskIds: string[] = [];
    const extractedMilestoneIds: string[] = [];

    data.phases.forEach((phaseItem: unknown) => {
      if (!phaseItem || typeof phaseItem !== "object") return;
      const phase = phaseItem as Record<string, unknown>;

      const phaseId = (typeof phase.phaseId === "string"
        ? phase.phaseId
        : typeof phase.id === "string"
        ? phase.id
        : "") as string;

      // 1A. New 3.1.0 schema: deepDiveTopics
      if (Array.isArray(phase.deepDiveTopics)) {
        phase.deepDiveTopics.forEach((modItem: unknown) => {
          if (!modItem || typeof modItem !== "object") return;
          const mod = modItem as Record<string, unknown>;
          if (Array.isArray(mod.topics)) {
            mod.topics.forEach((tItem: unknown) => {
              if (!tItem || typeof tItem !== "object") return;
              const t = tItem as Record<string, unknown>;
              const rawId =
                typeof t.id === "string"
                  ? t.id
                  : typeof t.taskId === "string"
                  ? t.taskId
                  : "";
              const tid = mapTaskId(rawId);
              if (tid) {
                if (t.isCompleted === true) extractedTaskIds.push(tid);
                if (t.userNotes || t.proofOfWorkUrl || t.completedAt) {
                  taskDetails[tid] = {
                    completed: !!t.isCompleted,
                    completedAt: typeof t.completedAt === "string" ? t.completedAt : undefined,
                    userNotes: typeof t.userNotes === "string" ? t.userNotes : undefined,
                    proofOfWorkUrl: typeof t.proofOfWorkUrl === "string" ? t.proofOfWorkUrl : undefined,
                  };
                }
              }
            });
          }
        });
      }

      // 1B. Legacy schema: tasks array
      if (Array.isArray(phase.tasks)) {
        phase.tasks.forEach((tItem: unknown) => {
          if (!tItem || typeof tItem !== "object") return;
          const t = tItem as Record<string, unknown>;
          const rawId =
            typeof t.taskId === "string"
              ? t.taskId
              : typeof t.id === "string"
              ? t.id
              : "";
          const tid = mapTaskId(rawId);
          if (tid) {
            if (t.isCompleted === true) extractedTaskIds.push(tid);
            if (t.userNotes || t.proofOfWork || t.completedAt) {
              taskDetails[tid] = {
                completed: !!t.isCompleted,
                completedAt: typeof t.completedAt === "string" ? t.completedAt : undefined,
                userNotes: typeof t.userNotes === "string" ? t.userNotes : undefined,
              };
            }
            if (t.proofOfWork && typeof t.proofOfWork === "object") {
              const pow = t.proofOfWork as Record<string, unknown>;
              artifacts[tid] = {
                repoUrl: typeof pow.repoUrl === "string" ? pow.repoUrl : undefined,
                liveUrl: typeof pow.liveUrl === "string" ? pow.liveUrl : undefined,
                notes: typeof pow.notes === "string" ? pow.notes : undefined,
                updatedAt: typeof pow.updatedAt === "string" ? pow.updatedAt : new Date().toISOString(),
              };
            }
          }
        });
      }

      // Milestone Deliverables
      const ms = (phase.milestoneDeliverables || phase.milestone) as Record<string, unknown> | undefined;
      if (ms && typeof ms === "object") {
        const isVer = ms.isVerified === true;
        const targetPhaseId = mapMilestoneId(phaseId);
        if (isVer && targetPhaseId) {
          extractedMilestoneIds.push(targetPhaseId);
        }
        if (ms.projectUrl || ms.repoUrl || ms.notes) {
          artifacts[targetPhaseId] = {
            projectUrl: typeof ms.projectUrl === "string" ? ms.projectUrl : undefined,
            repoUrl: typeof ms.repoUrl === "string" ? ms.repoUrl : undefined,
            notes: typeof ms.notes === "string" ? ms.notes : undefined,
            updatedAt: typeof ms.verifiedAt === "string" ? ms.verifiedAt : new Date().toISOString(),
          };
        }
      }
    });

    taskIds = extractedTaskIds;
    milestoneIds = extractedMilestoneIds;

    if (data.engineer && typeof data.engineer === "object") {
      const eng = data.engineer as Record<string, unknown>;
      if (typeof eng.avatarUrl === "string" && eng.avatarUrl.trim()) {
        customAvatarUrl = eng.avatarUrl;
      }
    }

    if (data.telemetry && typeof data.telemetry === "object") {
      const tel = data.telemetry as Record<string, unknown>;
      if (typeof tel.globalProgress === "number") {
        completionPercentage = tel.globalProgress;
      }
      if (typeof tel.clearanceTier === "string") {
        clearanceRank = tel.clearanceTier;
      }
    }
  }

  // Case 2: Direct arrays in state object or top-level payload
  if (data.state && typeof data.state === "object") {
    const stateObj = data.state as Record<string, unknown>;
    if (Array.isArray(stateObj.completedTaskIds)) {
      const mapped = (stateObj.completedTaskIds as string[]).map(mapTaskId);
      taskIds = taskIds ? Array.from(new Set([...taskIds, ...mapped])) : mapped;
    }
    if (Array.isArray(stateObj.completedMilestoneIds)) {
      const mapped = (stateObj.completedMilestoneIds as string[]).map(mapMilestoneId);
      milestoneIds = milestoneIds ? Array.from(new Set([...milestoneIds, ...mapped])) : mapped;
    }
    if (stateObj.artifacts && typeof stateObj.artifacts === "object") {
      Object.assign(artifacts, stateObj.artifacts as Record<string, ProjectArtifact>);
    }
    if (stateObj.taskDetails && typeof stateObj.taskDetails === "object") {
      Object.assign(taskDetails, stateObj.taskDetails as Record<string, TopicDetailState>);
    }
  }

  // Fallback for flat completedTaskIds / completedMilestoneIds
  if (!taskIds && Array.isArray(data.completedTaskIds)) {
    taskIds = (data.completedTaskIds as string[]).map(mapTaskId);
  }
  if (!milestoneIds && Array.isArray(data.completedMilestoneIds)) {
    milestoneIds = (data.completedMilestoneIds as string[]).map(mapMilestoneId);
  }

  if (data.projectArtifacts && typeof data.projectArtifacts === "object") {
    Object.assign(artifacts, data.projectArtifacts as Record<string, ProjectArtifact>);
  }

  if (typeof data.clearanceRank === "string") {
    clearanceRank = data.clearanceRank;
  }
  if (typeof data.progressPercentage === "number") {
    completionPercentage = data.progressPercentage;
  }

  // Deduplicate and filter strings
  const finalTaskIds = taskIds
    ? Array.from(new Set(taskIds.filter((id) => typeof id === "string" && id.trim().length > 0)))
    : null;

  const finalMilestoneIds = milestoneIds
    ? Array.from(new Set(milestoneIds.filter((id) => typeof id === "string" && id.trim().length > 0)))
    : null;

  return {
    taskIds: finalTaskIds,
    milestoneIds: finalMilestoneIds,
    artifacts,
    taskDetails,
    customAvatarUrl,
    clearanceRank,
    completionPercentage,
    schemaVersion,
  };
}
