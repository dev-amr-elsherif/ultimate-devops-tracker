# Ultimate DevOps & Cloud Engineering Master Roadmap (Zero-to-Hero)

An enterprise-grade, sci-fi command terminal web application and interactive curriculum tracker designed to take an engineer from operating system primitives to multi-cloud architecture, automated CI/CD pipelines, Kubernetes fleet orchestration, and full-stack observability.

---

## ⚡ Key Highlights & Features

- **Sci-Fi Command Terminal UI**: Dark obsidian palette (`#030712`, `#0b1329`), neon cyan (`#00f0ff`), neon green (`#00ff9d`), warning amber (`#f59e0b`), and laser crimson (`#ef4444`). Glassmorphism cards with glowing borders and scanline filter overlays.
- **Interactive 3D Cyber Canvas**: Custom HTML5 Canvas rendering a 3D-perspective wireframe horizon grid and floating starlight particles responding with parallax to mouse motion.
- **Synthesized Web Audio Engine**: Browser-native Web Audio API oscillator synthesis generating sci-fi UI clicks, access denial alarms, holographic activation chimes, and milestone celebration fanfares without external audio files.
- **Dual Security Model**:
  - **Observer Mode (Default)**: Public read-only portfolio tracker. Task checkboxes are locked; clicking triggers an "Access Denied: Commander Mode authentication required" alert.
  - **Commander Mode (Authenticated)**: Unlocked via holographic lock button or `Ctrl + Shift + A`. Master PIN: `010135`. Unlocks task editing, state persistence in `localStorage`, JSON snapshot export, and milestone defense triggers.
- **Telemetry HUD**: Real-time progress percentage, operational phases count (100% complete), task counts, remaining milestones, and dynamic Clearance Rank badges (`Cadet` ➔ `SysAdmin` ➔ `Cloud Architect` ➔ `DevOps Lead`).
- **Interactive Execution Topology**: Visual SVG flowchart and raw ASCII topology mapping sequential phases, parallel morning/evening tracks, convergence gates, and the final capstone trial.
- **Complete 12-Phase Curriculum**: Fully typed schema with real-world production bash commands, Dockerfiles, Terraform HCL, Kubernetes YAML, and acceptance criteria.
- **Graduation Capstone**: "Production Multi-Tier Cloud Delivery System" specification with defense evaluation checklist and repository tree layout.
- **Peripheral Technology Radar**: Guidance matrix covering Design Systems (`design-system.pdf`), Data Structures & Algorithms (`datastructures-and-algorithms.pdf`), Distributed System Design, MLOps, and DevSecOps.

---

## 🗺️ 12-Phase Curriculum Architecture

| Phase | Title | Duration | Mode | Key Deliverable / Milestone |
|---|---|---|---|---|
| **Phase 0** | Terminal Setup & OS Primitives | 2 Weeks | Sequential | `sys-init-probe.sh` diagnostic probe |
| **Phase 1** | Linux Administration & Networking | 3 Weeks | Sequential | `server-stats.sh` & Custom Systemd Service |
| **Phase 2 & 3** | Git Internals & Automation | 3 Weeks | Parallel Track | `log-archive.sh` Log Archival Tool |
| **Phase 4** | Web Servers, Proxies, TLS & SSH | 2 Weeks | Sequential | SSH Hardening & `nginx-log-analyser.sh` |
| **Phase 5** | Container Arch & Docker Deep-Dive | 3 Weeks | Sequential | Lean Multi-Stage Dockerfile & 3-Tier Stack |
| **Phase 6 & 7** | AWS Architecture & GitHub Actions | 4 Weeks | Parallel Track | EC2 Secure SSM & Automated CI/CD Pipeline |
| **Phase 8** | Infrastructure as Code (Terraform) | 3 Weeks | Sequential | Automated Cloud Stack (VPC + ALB + RDS) |
| **Phase 9** | Kubernetes Orchestration | 4 Weeks | Sequential | Self-Healing Microservice Fleet + Helm |
| **Phase 10** | Full-Stack Observability | 3 Weeks | Sequential | Prometheus, Grafana & Loki Alerting Stack |
| **Phase 11** | Hardening, DevSecOps & Chaos | 2 Weeks | Sequential | Chaos Mesh Partition & CIS Benchmarks |
| **Graduation** | Multi-Tier Cloud Delivery System | Final | Capstone | Automated Git ➔ IaC ➔ K8s ➔ Monitored Fleet |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-amr-elsherif/ultimate-devops-tracker.git
cd ultimate-devops-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:3000` in your browser.

### Production Build

```bash
# Verify TypeScript and linting
npm run lint

# Generate optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🔐 Commander Mode Authentication

- Default Passcode: `010135`
- Hotkey: Press `Ctrl + Shift + A` anywhere on the page to summon the Commander Authentication dialog.
- Alternatively, click the **OBSERVER MODE (UNLOCK)** button in the top HUD.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 App Router](https://nextjs.org/) (Turbopack, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual FX**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio**: Native Web Audio API (`AudioContext` Oscillators & Gain Envelopes)
- **State**: React Context API with LocalStorage & SessionStorage synchronization

---

## 📄 License
MIT License. Built for cloud engineers, DevOps practitioners, and platform architects worldwide.
