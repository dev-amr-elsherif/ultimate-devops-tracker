import { ROADMAP_PHASES } from "@/data/roadmapData";

export interface FullRoadmapArchive {
  schemaVersion: "3.0.0";
  exportedAt: string;
  phases: Array<{
    phaseId: string;
    phaseNumber: number;
    title: string;
    description: string;
    track: "sequential" | "parallel";
    isFullyDefended: boolean;
    phaseProgress: number;
    tasks: Array<{
      taskId: string;
      taskNumber: string;
      title: string;
      description?: string;
      commands?: string[];
      category?: string;
      isCompleted: boolean;
      completedAt: string | null;
      userNotes: string;
      miniTasks: Record<string, { title: string; completed: boolean }>;
      proofOfWork: {
        repoUrl?: string;
        liveUrl?: string;
        notes?: string;
        updatedAt?: string;
      } | null;
    }>;
    milestone?: {
      milestoneId: string;
      title: string;
      deliverable: string;
      isVerified: boolean;
      verifiedAt: string | null;
    };
  }>;
}

export function generateCompleteArchive(params: {
  completedTaskIds: Set<string>;
  completedMilestoneIds: Set<string>;
  taskDetails: Record<string, any>;
  artifacts: Record<string, any>;
}): FullRoadmapArchive {
  return {
    schemaVersion: "3.0.0",
    exportedAt: new Date().toISOString(),
    phases: ROADMAP_PHASES.map((phase) => {
      const tasksList = (phase as any).tasks || phase.modules?.flatMap((m: any) => m.tasks) || [];
      const phaseTasks = tasksList.map((task: any) => {
        const isCompleted = params.completedTaskIds.has(task.id);
        const details = params.taskDetails[task.id] || {};
        const proof = params.artifacts[task.id] || null;

        const rawMiniTasks = details.miniTasks || {};
        const formattedMiniTasks: Record<string, { title: string; completed: boolean }> = {};
        Object.entries(rawMiniTasks).forEach(([key, val]) => {
          if (typeof val === "boolean") {
            formattedMiniTasks[key] = { title: key, completed: val };
          } else if (val && typeof val === "object") {
            formattedMiniTasks[key] = {
              title: (val as { title?: string }).title || key,
              completed: !!(val as { completed?: boolean }).completed,
            };
          }
        });

        return {
          taskId: task.id,
          taskNumber: task.taskNumber || task.id.replace(/^task-/, "") || task.id,
          title: task.title,
          description: task.description,
          commands: task.commands || (task.commandSnippet ? [task.commandSnippet] : []),
          category: task.category || task.tags?.[0] || phase.title,
          isCompleted,
          completedAt: isCompleted ? (details.completedAt || new Date().toISOString()) : null,
          userNotes: details.userNotes || "",
          miniTasks: formattedMiniTasks,
          proofOfWork: proof ? {
            repoUrl: proof.repoUrl,
            liveUrl: proof.liveUrl,
            notes: proof.notes,
            updatedAt: proof.updatedAt,
          } : null,
        };
      });

      const phaseCompletedCount = phaseTasks.filter((t: any) => t.isCompleted).length;
      const phaseProgress = phaseTasks.length > 0
        ? Math.round((phaseCompletedCount / phaseTasks.length) * 100)
        : 0;

      const rawMilestone = (phase as any).milestone || phase.milestones?.[0];
      const milestoneId = rawMilestone ? (rawMilestone.milestoneId || rawMilestone.id) : undefined;
      const isMilestoneDone = milestoneId ? params.completedMilestoneIds.has(milestoneId) : true;

      const trackType: "sequential" | "parallel" =
        (phase as any).track || (phase.mode?.toLowerCase().includes("parallel") ? "parallel" : "sequential");

      const phaseNum = typeof phase.phaseNumber === "number"
        ? phase.phaseNumber
        : parseInt(String(phase.phaseNumber), 10) || 0;

      return {
        phaseId: phase.id,
        phaseNumber: phaseNum,
        title: phase.title,
        description: phase.description,
        track: trackType,
        isFullyDefended: phaseProgress === 100 && isMilestoneDone,
        phaseProgress,
        tasks: phaseTasks,
        milestone: rawMilestone && milestoneId ? {
          milestoneId,
          title: rawMilestone.title,
          deliverable: rawMilestone.deliverable || (rawMilestone.deliverables ? rawMilestone.deliverables.join("; ") : (rawMilestone.description || "")),
          isVerified: params.completedMilestoneIds.has(milestoneId),
          verifiedAt: params.completedMilestoneIds.has(milestoneId)
            ? (params.artifacts[milestoneId]?.updatedAt || new Date().toISOString())
            : null,
        } : undefined,
      };
    }),
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
  artifacts: Record<string, any>;
  taskDetails: Record<string, any>;
  customAvatarUrl?: string | null;
  clearanceRank?: string;
  completionPercentage?: number;
  schemaVersion?: string;
}

export function parseRoadmapPayload(raw: unknown): ParsedRoadmapPayload {
  if (!raw || typeof raw !== "object") {
    return {
      taskIds: null,
      milestoneIds: null,
      artifacts: {},
      taskDetails: {},
    };
  }

  const data = raw as Record<string, any>;
  let taskIds: string[] | null = null;
  let milestoneIds: string[] | null = null;
  let artifacts: Record<string, any> = {};
  let taskDetails: Record<string, any> = {};
  let customAvatarUrl: string | null = null;
  let clearanceRank: string = "Cadet";
  let completionPercentage: number = 0;
  let schemaVersion: string = "3.0.0";

  // 1. Check for schemaVersion "3.0.0" or FullRoadmapArchive with phases array
  if (Array.isArray(data.phases)) {
    const extractedTaskIds: string[] = [];
    const extractedMilestoneIds: string[] = [];
    let totalScannedTasks = 0;

    data.phases.forEach((phase: any) => {
      if (phase && typeof phase === "object") {
        if (Array.isArray(phase.tasks)) {
          phase.tasks.forEach((task: any) => {
            if (task && typeof task === "object") {
              totalScannedTasks++;
              const taskId = typeof task.taskId === "string" ? task.taskId : String(task.id || "");
              if (taskId) {
                if (task.isCompleted === true) {
                  extractedTaskIds.push(taskId);
                }
                if (task.userNotes || task.miniTasks || task.completedAt) {
                  taskDetails[taskId] = {
                    completed: !!task.isCompleted,
                    completedAt: task.completedAt || undefined,
                    userNotes: task.userNotes || undefined,
                    miniTasks: task.miniTasks || undefined,
                  };
                }
                if (task.proofOfWork && typeof task.proofOfWork === "object") {
                  artifacts[taskId] = task.proofOfWork;
                }
              }
            }
          });
        }

        const ms = phase.milestone;
        if (ms && typeof ms === "object") {
          const msId = typeof ms.milestoneId === "string" ? ms.milestoneId : String(ms.id || "");
          if (msId && ms.isVerified === true) {
            extractedMilestoneIds.push(msId);
          }
        }
      }
    });

    taskIds = extractedTaskIds;
    milestoneIds = extractedMilestoneIds;

    if (totalScannedTasks > 0) {
      completionPercentage = Math.round((extractedTaskIds.length / totalScannedTasks) * 100);
    }
    if (completionPercentage >= 75) {
      clearanceRank = "DevOps Lead";
    } else if (completionPercentage >= 50) {
      clearanceRank = "Cloud Architect";
    } else if (completionPercentage >= 25) {
      clearanceRank = "SysAdmin";
    } else {
      clearanceRank = "Cadet";
    }

    if (data.engineer && typeof data.engineer === "object") {
      if (typeof data.engineer.avatarUrl === "string" && data.engineer.avatarUrl.trim()) {
        customAvatarUrl = data.engineer.avatarUrl;
      }
      if (typeof data.engineer.clearanceRank === "string") {
        clearanceRank = data.engineer.clearanceRank;
      }
    }

    if (data.summaryTelemetry && typeof data.summaryTelemetry === "object") {
      if (typeof data.summaryTelemetry.completionPercentage === "number") {
        completionPercentage = data.summaryTelemetry.completionPercentage;
      }
    }

    if (typeof data.schemaVersion === "string") {
      schemaVersion = data.schemaVersion;
    }
  }

  // 2. Check state object
  if (data.state && typeof data.state === "object") {
    if (Array.isArray(data.state.completedTaskIds)) {
      taskIds = taskIds
        ? Array.from(new Set([...taskIds, ...data.state.completedTaskIds]))
        : data.state.completedTaskIds;
    }
    if (Array.isArray(data.state.completedMilestoneIds)) {
      milestoneIds = milestoneIds
        ? Array.from(new Set([...milestoneIds, ...data.state.completedMilestoneIds]))
        : data.state.completedMilestoneIds;
    }
    if (data.state.artifacts && typeof data.state.artifacts === "object") {
      artifacts = { ...artifacts, ...data.state.artifacts };
    }
    if (data.state.taskDetails && typeof data.state.taskDetails === "object") {
      taskDetails = { ...taskDetails, ...data.state.taskDetails };
    }
  }

  // 3. Fallback for legacy payloads
  if (!taskIds) {
    if (Array.isArray(data.completedTaskIds)) taskIds = data.completedTaskIds;
    else if (Array.isArray(data.completedTasks)) taskIds = data.completedTasks;
  }

  if (!milestoneIds) {
    if (Array.isArray(data.completedMilestoneIds)) milestoneIds = data.completedMilestoneIds;
    else if (Array.isArray(data.completedMilestones)) milestoneIds = data.completedMilestones;
  }

  if (data.projectArtifacts && typeof data.projectArtifacts === "object") {
    artifacts = { ...artifacts, ...data.projectArtifacts };
  }

  if (typeof data.clearanceRank === "string") {
    clearanceRank = data.clearanceRank;
  } else if (data.telemetry?.clearanceRank) {
    clearanceRank = data.telemetry.clearanceRank;
  }

  if (typeof data.progressPercentage === "number") {
    completionPercentage = data.progressPercentage;
  } else if (typeof data.telemetry?.completionPercentage === "number") {
    completionPercentage = data.telemetry.completionPercentage;
  }

  if (typeof data.version === "string") {
    schemaVersion = data.version;
  } else if (typeof data.schemaVersion === "string") {
    schemaVersion = data.schemaVersion;
  }

  return {
    taskIds,
    milestoneIds,
    artifacts,
    taskDetails,
    customAvatarUrl,
    clearanceRank,
    completionPercentage,
    schemaVersion,
  };
}
