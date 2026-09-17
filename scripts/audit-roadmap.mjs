import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const roadmapJsonPath = path.join(rootDir, "roadmap.json");

console.log("=================================================");
console.log(" 9-PHASE MASTER ROADMAP DATA PARITY AUDIT (v3.0.0)");
console.log("=================================================");

try {
  if (!fs.existsSync(roadmapJsonPath)) {
    throw new Error(`roadmap.json not found at ${roadmapJsonPath}`);
  }

  const rawJson = fs.readFileSync(roadmapJsonPath, "utf-8");
  const roadmap = JSON.parse(rawJson);

  let auditPassed = true;
  const errors = [];

  // Check 1: Schema Version & Root Metadata
  console.log(`\n✓ Schema Version: ${roadmap.schemaVersion}`);
  console.log(`✓ Roadmap Title: "${roadmap.roadmapTitle}"`);
  console.log(`✓ Curriculum Architecture: "${roadmap.curriculumArchitecture}"`);

  if (roadmap.schemaVersion !== "3.0.0") {
    errors.push(`Expected schemaVersion 3.0.0, got ${roadmap.schemaVersion}`);
    auditPassed = false;
  }

  // Check 2: Phases Count (Expected: 9)
  const phases = roadmap.phases || [];
  const phaseCount = phases.length;
  console.log(`\n✓ Total Curriculum Phases: ${phaseCount} (Expected: 9)`);
  if (phaseCount !== 9) {
    errors.push(`Expected 9 phases, but found ${phaseCount}`);
    auditPassed = false;
  }

  // Check 3: Sequential & Parallel Track Breakdown
  let sequentialCount = 0;
  let parallelCount = 0;

  phases.forEach((p) => {
    if (p.trackType === "sequential") sequentialCount++;
    else if (p.trackType === "parallel") parallelCount++;
    else {
      errors.push(`Invalid trackType "${p.trackType}" in phase ${p.phaseId}`);
      auditPassed = false;
    }
  });

  console.log(`  - Sequential Phases: ${sequentialCount} (Expected: 5)`);
  console.log(`  - Parallel Tracks:   ${parallelCount} (Expected: 4)`);

  if (sequentialCount !== 5 || parallelCount !== 4) {
    errors.push(`Track mismatch: expected 5 sequential & 4 parallel, got ${sequentialCount}/${parallelCount}`);
    auditPassed = false;
  }

  // Check 4: Granular Modules & Topics Audit
  console.log("\n-------------------------------------------------");
  console.log(" PHASE-BY-PHASE BREAKDOWN & RECON SOURCES");
  console.log("-------------------------------------------------");

  let grandTotalModules = 0;
  let grandTotalTopics = 0;
  let grandTotalMilestones = 0;

  phases.forEach((phase) => {
    const pOrder = phase.phaseOrder;
    const modules = phase.deepDiveTopics || [];
    grandTotalModules += modules.length;

    let phaseTopicsCount = 0;
    modules.forEach((mod, mIdx) => {
      const topics = mod.topics || [];
      phaseTopicsCount += topics.length;
      grandTotalTopics += topics.length;

      topics.forEach((topicStr, tIdx) => {
        if (!topicStr || typeof topicStr !== "string" || !topicStr.trim()) {
          errors.push(`Empty topic in phase ${phase.phaseId}, module ${mIdx}, topic ${tIdx}`);
          auditPassed = false;
        }
      });
    });

    const ms = phase.milestoneDeliverables;
    if (ms) {
      grandTotalMilestones++;
      if (!ms.primaryProject || !ms.primaryProject.trim()) {
        errors.push(`Missing primaryProject in phase ${phase.phaseId}`);
        auditPassed = false;
      }
      if (!Array.isArray(ms.githubProofOfWork) || ms.githubProofOfWork.length === 0) {
        errors.push(`Missing githubProofOfWork checklist in phase ${phase.phaseId}`);
        auditPassed = false;
      }
    } else {
      errors.push(`Missing milestoneDeliverables in phase ${phase.phaseId}`);
      auditPassed = false;
    }

    const courseraQueries = phase.courseraSearchQueries || [];
    if (courseraQueries.length === 0) {
      errors.push(`Missing courseraSearchQueries in phase ${phase.phaseId}`);
      auditPassed = false;
    }

    const parallelInfo = phase.parallelWith ? `[PARALLEL WITH: ${phase.parallelWith}]` : "[SEQUENTIAL]";
    console.log(
      `  [Phase ${pOrder.toString().padStart(2, "0")}] ${phase.phaseId} : ${modules.length} modules, ${phaseTopicsCount.toString().padStart(2, " ")} topics, ${courseraQueries.length} Coursera sources ${parallelInfo}`
    );
  });

  console.log("-------------------------------------------------");
  console.log(`GRAND TOTAL PHASES     : ${phaseCount} (Expected: 9)`);
  console.log(`GRAND TOTAL MODULES    : ${grandTotalModules} (Expected: 33)`);
  console.log(`GRAND TOTAL TOPICS     : ${grandTotalTopics} (Expected: 121)`);
  console.log(`GRAND TOTAL MILESTONES : ${grandTotalMilestones} (Expected: 9)`);
  console.log("-------------------------------------------------");

  if (grandTotalTopics !== 121) {
    errors.push(`Total topics count ${grandTotalTopics} does not match expected 121.`);
    auditPassed = false;
  }
  if (grandTotalModules !== 33) {
    errors.push(`Total modules count ${grandTotalModules} does not match expected 33.`);
    auditPassed = false;
  }

  // Check 5: Verify zero legacy hardcoded artifacts across source files
  const bannedPatterns = [
    { pattern: /\b132\s+tasks?\b/i, name: "132 tasks" },
    { pattern: /\b13\s+milestones?\b/i, name: "13 milestones" },
    { pattern: /\b12\s+phases?\b/i, name: "12 phases" },
  ];

  const srcDir = path.join(rootDir, "src");
  function scanDir(dir) {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(ts|tsx|js|mjs)$/.test(file)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        bannedPatterns.forEach(({ pattern, name }) => {
          if (pattern.test(content)) {
            errors.push(`Banned legacy pattern "${name}" found in ${path.relative(rootDir, fullPath)}`);
            auditPassed = false;
          }
        });
      }
    });
  }
  scanDir(srcDir);

  if (!auditPassed) {
    console.error("\n❌ AUDIT FAILED with errors:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log("\n✅ AUDIT PASSED: 100% 9-Phase Master Architecture Parity Verified!");
    process.exit(0);
  }
} catch (err) {
  console.error("Audit Execution Error:", err);
  process.exit(1);
}
