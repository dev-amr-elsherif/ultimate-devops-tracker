import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const roadmapTsPath = path.join(rootDir, "src", "data", "roadmapData.ts");
const tempMjsPath = path.join(rootDir, "scripts", "temp-roadmapData.mjs");

console.log("=================================================");
console.log(" ROADMAP CONTENT & DATA PARITY AUDIT");
console.log("=================================================");

try {
  const tsContent = fs.readFileSync(roadmapTsPath, "utf-8");

  // Transpile TypeScript to ES Module JavaScript
  const transpiled = ts.transpileModule(tsContent, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  fs.writeFileSync(tempMjsPath, transpiled.outputText, "utf-8");

  const { ROADMAP_PHASES, GRADUATION_CAPSTONE, PERIPHERAL_TECHNOLOGY_RADAR } = await import(
    `file://${tempMjsPath.replace(/\\/g, "/")}`
  );

  let auditPassed = true;
  const errors = [];

  // Check 1: Phases Count
  const phaseCount = ROADMAP_PHASES.length;
  console.log(`\n✓ Total Curriculum Phases: ${phaseCount} (Expected: 12)`);
  if (phaseCount !== 12) {
    errors.push(`Expected 12 phases, but found ${phaseCount}`);
    auditPassed = false;
  }

  // Check 2: Capstone Project
  if (!GRADUATION_CAPSTONE || !GRADUATION_CAPSTONE.title) {
    errors.push("GRADUATION_CAPSTONE is missing or invalid");
    auditPassed = false;
  } else {
    console.log(`✓ Graduation Capstone defined: "${GRADUATION_CAPSTONE.title}"`);
    console.log(`  - Architecture Layers: ${GRADUATION_CAPSTONE.architectureComponents?.length || 0}`);
    console.log(`  - Defense Criteria Gates: ${GRADUATION_CAPSTONE.defenseCriteria?.length || 0}`);
    console.log(`  - Runbook Steps: ${GRADUATION_CAPSTONE.runbookSteps?.length || 0}`);
  }

  // Check 3: Peripheral Radar
  if (!Array.isArray(PERIPHERAL_TECHNOLOGY_RADAR) || PERIPHERAL_TECHNOLOGY_RADAR.length !== 5) {
    errors.push(`Expected 5 Peripheral Radar items, found ${PERIPHERAL_TECHNOLOGY_RADAR?.length}`);
    auditPassed = false;
  } else {
    console.log(`✓ Peripheral Technology Radar items: ${PERIPHERAL_TECHNOLOGY_RADAR.length}`);
  }

  // Check 4: Granular Tasks Count & Audit per Phase
  console.log("\n-------------------------------------------------");
  console.log(" PHASE-BY-PHASE TASK BREAKDOWN");
  console.log("-------------------------------------------------");

  let grandTotalTasks = 0;
  let grandTotalMilestones = 0;

  const expectedPhaseCounts = {
    0: 14,
    1: 16,
    2: 13,
    3: 8,
    4: 9,
    5: 14,
    6: 13,
    7: 8,
    8: 13,
    9: 14,
    10: 7,
    11: 3,
  };

  ROADMAP_PHASES.forEach((phase) => {
    const tasks = phase.modules.flatMap((m) => m.tasks);
    const milestones = phase.milestones || [];
    grandTotalTasks += tasks.length;
    grandTotalMilestones += milestones.length;

    const expected = expectedPhaseCounts[phase.phaseNumber];
    const match = expected === tasks.length ? "✓" : "✗ MISMATCH";

    console.log(
      `  [Phase ${phase.phaseNumber.toString().padEnd(2)}] ${phase.title.padEnd(52)} : ${tasks.length.toString().padStart(2)} tasks, ${milestones.length} milestones ${match}`
    );

    if (expected !== undefined && tasks.length !== expected) {
      errors.push(
        `Phase ${phase.phaseNumber} task count mismatch: expected ${expected}, got ${tasks.length}`
      );
      auditPassed = false;
    }

    // Verify task attributes
    tasks.forEach((task) => {
      if (!task.id || typeof task.id !== "string") {
        errors.push(`Task with missing id in phase ${phase.phaseNumber}`);
        auditPassed = false;
      }
      if (!task.title || typeof task.title !== "string" || !task.title.trim()) {
        errors.push(`Empty title for task ${task.id} in phase ${phase.phaseNumber}`);
        auditPassed = false;
      }
      if (!task.commandSnippet || typeof task.commandSnippet !== "string" || !task.commandSnippet.trim()) {
        errors.push(`Empty or null commandSnippet for task "${task.title}" (${task.id})`);
        auditPassed = false;
      }
      if (!Array.isArray(task.acceptanceCriteria) || task.acceptanceCriteria.length === 0) {
        errors.push(`Missing acceptance criteria for task "${task.title}" (${task.id})`);
        auditPassed = false;
      }
    });

    // Verify milestones
    milestones.forEach((ms) => {
      if (!ms.id || !ms.title || !ms.codeTemplate) {
        errors.push(`Invalid milestone in phase ${phase.phaseNumber}: ${ms.title}`);
        auditPassed = false;
      }
    });
  });

  console.log("-------------------------------------------------");
  console.log(`GRAND TOTAL TASKS      : ${grandTotalTasks} (Target >= 100)`);
  console.log(`GRAND TOTAL MILESTONES : ${grandTotalMilestones}`);
  console.log("-------------------------------------------------");

  if (grandTotalTasks < 100) {
    errors.push(`Total tasks count ${grandTotalTasks} is below required 100 threshold.`);
    auditPassed = false;
  }

  // Clean up temp file
  try {
    if (fs.existsSync(tempMjsPath)) {
      fs.unlinkSync(tempMjsPath);
    }
  } catch {}

  if (!auditPassed) {
    console.error("\n❌ AUDIT FAILED with errors:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log("\n✅ AUDIT PASSED: 100% Data Parity Verified!");
    process.exit(0);
  }
} catch (err) {
  console.error("Audit Execution Error:", err);
  try {
    if (fs.existsSync(tempMjsPath)) {
      fs.unlinkSync(tempMjsPath);
    }
  } catch {}
  process.exit(1);
}
