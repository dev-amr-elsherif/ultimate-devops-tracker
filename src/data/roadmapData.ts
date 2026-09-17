import rawRoadmapData from "../../roadmap.json";
import {
  RoadmapState,
  Phase,
  DeepDiveModule,
  DeepDiveTopic,
  MilestoneDeliverables,
  TrackType,
} from "@/types/roadmap";

export * from "@/types/roadmap";

// Utility to clean markdown citations like [cite: 1, 2] from strings
export function cleanCitationText(text: string): string {
  if (!text) return "";
  return text.replace(/\s*\[cite:[^\]]*\]/g, "").trim();
}

/**
 * Deterministically hydrates raw roadmap.json data into the trackable interactive architecture.
 * Generates consistent IDs: `${phaseId}-m${moduleIndex}-t${topicIndex}`
 */
export function hydrateRoadmapData(raw: typeof rawRoadmapData): RoadmapState {
  const phases: Phase[] = raw.phases.map((rawPhase) => {
    const deepDiveTopics: DeepDiveModule[] = rawPhase.deepDiveTopics.map(
      (mod, mIdx) => {
        const topics: DeepDiveTopic[] = mod.topics.map((topicStr, tIdx) => {
          const id = `${rawPhase.phaseId}-m${mIdx}-t${tIdx}`;
          return {
            id,
            topicTitle: cleanCitationText(topicStr),
            isCompleted: false,
            completedAt: null,
            userNotes: "",
            proofOfWorkUrl: null,
          };
        });

        return {
          module: cleanCitationText(mod.module),
          topics,
        };
      }
    );

    const milestoneDeliverables: MilestoneDeliverables = {
      primaryProject: cleanCitationText(rawPhase.milestoneDeliverables.primaryProject),
      description: cleanCitationText(rawPhase.milestoneDeliverables.description),
      githubProofOfWork: rawPhase.milestoneDeliverables.githubProofOfWork.map(cleanCitationText),
      isVerified: false,
      verifiedAt: null,
      projectUrl: null,
    };

    return {
      phaseId: rawPhase.phaseId,
      phaseOrder: rawPhase.phaseOrder,
      trackType: rawPhase.trackType as TrackType,
      parallelWith: rawPhase.parallelWith || null,
      title: cleanCitationText(rawPhase.title),
      description: cleanCitationText(rawPhase.description),
      courseraSearchQueries: rawPhase.courseraSearchQueries || [],
      deepDiveTopics,
      milestoneDeliverables,
      phaseProgress: 0,
      isFullyDefended: false,
    };
  });

  return {
    schemaVersion: raw.schemaVersion,
    roadmapTitle: raw.roadmapTitle,
    curriculumArchitecture: raw.curriculumArchitecture,
    executionMatrixSummary: raw.executionMatrixSummary,
    phases,
  };
}

export const INITIAL_ROADMAP_STATE: RoadmapState = hydrateRoadmapData(rawRoadmapData);
export const ROADMAP_PHASES: Phase[] = INITIAL_ROADMAP_STATE.phases;

// Precomputed telemetry constants dynamically derived from roadmap.json
export const ALL_TOPICS: DeepDiveTopic[] = ROADMAP_PHASES.flatMap((p) =>
  p.deepDiveTopics.flatMap((m) => m.topics)
);

export const TOTAL_TOPICS_COUNT: number = ALL_TOPICS.length;
export const TOTAL_PHASES_COUNT: number = ROADMAP_PHASES.length;
export const TOTAL_MILESTONES_COUNT: number = ROADMAP_PHASES.length;

// Map for quick ID lookup
export const TOPIC_MAP = new Map<string, DeepDiveTopic>(
  ALL_TOPICS.map((t) => [t.id, t])
);

export const PHASE_MAP = new Map<string, Phase>(
  ROADMAP_PHASES.map((p) => [p.phaseId, p])
);

export interface CapstoneProject {
  title: string;
  badge: string;
  description: string;
  architectureComponents: {
    layer: string;
    technologies: string[];
    details: string;
  }[];
  specifications: string[];
  securityControls: string[];
  defenseCriteria: string[];
  sampleRepoStructure: string;
  runbookSteps: string[];
}

export const GRADUATION_CAPSTONE: CapstoneProject = {
  title: "Production Hardened, Chaos-Resilient Enterprise Infrastructure",
  badge: "DEFENSIVE CAPSTONE // PHASE 09",
  description:
    "The definitive DevOps Capstone: a multi-tier microservice architecture deployed via Terraform and Kubernetes, encrypted with SOPS/KMS, verified by kube-bench, and validated via Chaos Mesh experiments.",
  architectureComponents: [
    {
      layer: "Foundation & Systems Security",
      technologies: ["POSIX", "Systemd", "cgroups v2", "Fail2ban"],
      details: "Hardened Linux primitives, namespace isolation, non-root daemons, and low-level kernel routing.",
    },
    {
      layer: "Cryptographic SCM & CI/CD",
      technologies: ["Git", "GitHub Actions", "Docker Buildx", "Trivy"],
      details: "Signed commits, multi-arch image builds published to GHCR, CVE vulnerability gates, and automated rollbacks.",
    },
    {
      layer: "Cloud Infrastructure as Code",
      technologies: ["AWS", "Terraform", "DynamoDB", "AWS KMS"],
      details: "Multi-AZ VPC architecture with private subnets, SSM management without open port 22, and S3 remote locking.",
    },
    {
      layer: "Container Fleet Orchestration",
      technologies: ["Kubernetes", "Helm 3", "Ingress-Nginx", "HPA"],
      details: "Self-healing pod replica sets, horizontal autoscaling under synthetic load, and modular Helm charts.",
    },
    {
      layer: "Full-Stack Observability",
      technologies: ["Prometheus", "Grafana", "Loki", "Alertmanager"],
      details: "Real-time RED telemetry dashboards, log aggregations via LogQL, and Slack alert notification routing.",
    },
    {
      layer: "Zero-Trust & Chaos Engineering",
      technologies: ["HashiCorp Vault", "SOPS", "Chaos Mesh", "kube-bench"],
      details: "KMS-encrypted secrets repository, CIS benchmark compliance, and network latency chaos experiments.",
    },
  ],
  specifications: [
    "Multi-AZ AWS deployment with Terraform custom modules passing terraform validate and fmt",
    "Kubernetes multi-replica fleet running on Google Distroless with zero root privileges",
    "Prometheus RED metrics monitoring with P95/P99 latency histogram alerts",
    "Mozilla SOPS with KMS-encrypted Git repository secrets",
  ],
  securityControls: [
    "Zero public ingress on SSH port 22 (strict AWS SSM session access)",
    "Non-root container execution (USER 10001:10001) scanned with Trivy (0 CRITICAL / HIGH CVEs)",
    "CIS Security Benchmark pass on master and worker nodes via kube-bench",
    "Encrypted EBS volumes and S3 Block Public Access enforced by policy",
  ],
  defenseCriteria: [
    "kube-bench compliance execution report demonstrating 100% pass on critical CIS checks",
    "Tested Chaos Mesh experiment YAML injecting latency without dropping HTTP 200 uptime SLA",
    "Encrypted secrets.enc.yaml managed through SOPS and AWS KMS",
    "Demonstrated pod self-healing: automated recovery within 2 seconds of pod deletion",
    "Automated deployment verification with healthcheck polling and instant rollback on failure",
  ],
  sampleRepoStructure: `devops-enterprise-defense/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── terraform/
│   ├── modules/ (vpc, alb, compute)
│   ├── backend.tf
│   ├── versions.tf
│   └── main.tf
├── k8s-helm/
│   ├── Chart.yaml
│   └── values.yaml
├── observability/
│   ├── prometheus.yml
│   └── grafana-dashboard.json
├── chaos/
│   └── network-latency-experiment.yaml
└── secrets/
    └── secrets.enc.yaml`,
  runbookSteps: [
    "1. Initialize remote state backend in Terraform and provision Multi-AZ VPC and IAM roles",
    "2. Deploy production Helm chart with HPA autoscaling, Ingress-Nginx, and health probes",
    "3. Decrypt application secrets via Mozilla SOPS and AWS KMS",
    "4. Execute Chaos Mesh experiment injecting 200ms latency and packet drop",
    "5. Execute kube-bench audit to verify 100% compliance against CIS benchmarks",
  ],
};

