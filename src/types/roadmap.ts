export type TrackType = "sequential" | "parallel";

export interface DeepDiveTopic {
  id: string;
  topicTitle: string;
  isCompleted: boolean;
  completedAt: string | null;
  userNotes: string;
  proofOfWorkUrl?: string | null;
  commandSnippet?: string;
  snippetLanguage?: string;
}

export interface DeepDiveModule {
  module: string;
  topics: DeepDiveTopic[];
}

export interface MilestoneDeliverables {
  primaryProject: string;
  description: string;
  githubProofOfWork: string[];
  isVerified: boolean;
  verifiedAt: string | null;
  projectUrl?: string | null;
}

export interface Phase {
  phaseId: string;
  phaseOrder: number;
  trackType: TrackType;
  parallelWith: string | null;
  title: string;
  description: string;
  courseraSearchQueries: string[];
  deepDiveTopics: DeepDiveModule[];
  milestoneDeliverables: MilestoneDeliverables;
  phaseProgress: number; // dynamically computed (0 - 100)
  isFullyDefended: boolean;
}

export interface RoadmapState {
  schemaVersion: string;
  roadmapTitle: string;
  curriculumArchitecture: string;
  executionMatrixSummary: {
    totalPhases: number;
    sequentialPhasesCount: number;
    parallelPhasesCount: number;
    primaryCloudFocus: string;
    primaryScriptingFocus: string[];
    primaryContainerOrchestration: string[];
  };
  phases: Phase[];
}

// Backward compatibility aliases
export type Task = DeepDiveTopic;
export type Module = DeepDiveModule;
export type Milestone = MilestoneDeliverables;

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

