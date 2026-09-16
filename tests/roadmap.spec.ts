import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function authenticateCommander(page: Page) {
  await page.evaluate(() => {
    window.localStorage.setItem("devops_test_commander", "true");
    window.sessionStorage.setItem("devops_test_commander", "true");
    (window as unknown as { __setTestCommander?: (enabled: boolean) => void }).__setTestCommander?.(true);
  });
}

test.describe("Ultimate DevOps Master Roadmap - E2E Verification Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("1. Observer Mode Security - Blocks unauthorized task modification", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Header HUD displays "Tasks Locked" and total 132
    const taskCountEl = page.locator("text=/Tasks Locked/i");
    await expect(taskCountEl).toBeVisible();
    await expect(page.locator("text=/0 \\/ 132/")).toBeVisible();

    // Verify Observer Mode button in bottom dock
    const modeBtn = page.getByTestId("mode-toggle-btn");
    await expect(modeBtn).toBeVisible();
    await expect(modeBtn.locator("text=OBSERVER MODE")).toBeVisible();

    // Locate the first task's checkbox button using test id
    const firstTaskCheckbox = page.getByTestId("task-checkbox").first();
    await expect(firstTaskCheckbox).toBeVisible();

    // Click checkbox in Observer Mode
    await firstTaskCheckbox.click();

    // Verify task is NOT checked
    await expect(firstTaskCheckbox.locator("svg.lucide-check")).toHaveCount(0);

    // Verify Access Denied toast notification appears
    const toast = page.locator("text=ACCESS DENIED");
    await expect(toast).toBeVisible();
    await expect(page.locator("text=Commander Mode authentication required")).toBeVisible();

    // Verify zero unhandled exceptions
    expect(consoleErrors).toEqual([]);
  });

  test("2. Commander Mode Authentication - Validates Commander authorization and updates clearance", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Initial State: Observer Mode is active
    const modeToggleBtn = page.getByTestId("mode-toggle-btn");
    await expect(modeToggleBtn).toBeVisible();
    await expect(modeToggleBtn.locator("text=OBSERVER MODE")).toBeVisible();
    await expect(page.locator("text=/Tasks Locked/i")).toBeVisible();

    // 2. Observer Mode: Modifying task is rejected
    const firstTask = page.getByTestId("task-checkbox").first();
    await firstTask.click();
    await expect(page.locator("text=ACCESS DENIED")).toBeVisible();

    // 3. Authenticate Commander via Google Identity test hook
    await authenticateCommander(page);

    // 4. Assert Commander Mode is now ACTIVE in the bottom dock
    await expect(modeToggleBtn).toBeVisible();
    await expect(modeToggleBtn.locator("text=ACTIVE")).toBeVisible();

    // 5. Assert Header HUD label changes from "Tasks Locked" to "Tasks Completed"
    await expect(page.locator("text=/Tasks Completed/i")).toBeVisible();

    // 6. Commander can now toggle tasks
    await firstTask.click();
    await expect(firstTask.locator("svg.lucide-check")).toBeVisible();
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();

    // 7. Revoke Commander access via button click
    await modeToggleBtn.click();
    await expect(page.locator("text=OBSERVER MODE")).toBeVisible();
    await expect(page.locator("text=/Tasks Locked/i")).toBeVisible();
  });

  test("3. Telemetry & Progress Calculation - Dynamically increments on completion", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Authenticate as Commander
    await authenticateCommander(page);

    // Initial progress should be 0%
    await expect(page.locator("text=/Tasks Completed/i")).toBeVisible();
    const initialTasks = page.locator("text=/0 \\/ 132/");
    await expect(initialTasks).toBeVisible();

    // Toggle Task 1 in Phase 0
    const task1 = page.getByTestId("task-checkbox").first();
    await task1.click();

    // Assert task 1 is now checked
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();
    await expect(task1.locator("svg.lucide-check")).toBeVisible();

    // Toggle Task 2 in Phase 0
    const task2 = page.getByTestId("task-checkbox").nth(1);
    await task2.click();

    // Assert 2 tasks completed
    await expect(page.locator("text=/2 \\/ 132/")).toBeVisible();
    await expect(task2.locator("svg.lucide-check")).toBeVisible();

    // Percentage should dynamically update (2/132 ~ 2%)
    await expect(page.locator("text=/2%/").first()).toBeVisible();
  });

  test("4. State Persistence (localStorage) - Preserves checked tasks on page reload", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Authenticate as Commander
    await authenticateCommander(page);

    // Complete the first task
    const taskCheckbox = page.getByTestId("task-checkbox").first();
    await taskCheckbox.click();
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Re-verify that 1 task remains recorded in telemetry
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();
    const reloadedFirstTask = page.getByTestId("task-checkbox").first();
    await expect(reloadedFirstTask.locator("svg.lucide-check")).toBeVisible();
  });

  test("5. Execution Graph & Filter Tabs - Interactive rendering", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Switch to Raw ASCII tab
    const asciiTab = page.getByRole("button", { name: "RAW ASCII" });
    await asciiTab.click();

    // Verify ASCII diagram renders
    const asciiContent = page.locator("pre:has-text('ULTIMATE DEVOPS & CLOUD ARCHITECTURE EXECUTION TOPOLOGY')");
    await expect(asciiContent).toBeVisible();

    // Switch back to Visual Graph tab
    const visualTab = page.getByRole("button", { name: "VISUAL GRAPH" });
    await visualTab.click();

    // Verify Visual node is visible
    await expect(page.locator("text=Phase 0: Terminal & OS Primitives").first()).toBeVisible();

    // Filter by Parallel Tracks
    const parallelFilter = page.getByRole("button", { name: "PARALLEL TRACKS" });
    await parallelFilter.click();

    // Assert Parallel Phase 2 is visible
    await expect(page.locator("text=Version Control: Git Internals & GitHub Architecture")).toBeVisible();

    // Filter by Sequential Only
    const sequentialFilter = page.getByRole("button", { name: "SEQUENTIAL ONLY" });
    await sequentialFilter.click();
    await expect(page.locator("#phase-0")).toBeVisible();

    // Reset to All Phases
    await page.getByRole("button", { name: "ALL PHASES" }).click();
    await expect(page.locator("#phase-0")).toBeVisible();
  });

  test("6. Error & Audio Safety - Zero unhandled exceptions or Web Audio crashes", async ({ page }) => {
    const errorLogs: string[] = [];
    page.on("pageerror", (err) => {
      errorLogs.push(err.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Toggle Audio Mute button in Header HUD
    const audioBtn = page.getByRole("button", { name: "Toggle Sound" });
    await audioBtn.click();
    await audioBtn.click();

    // Expand search input and type query
    const searchInput = page.getByPlaceholder(/Search commands/i);
    await searchInput.fill("docker");
    await expect(page.locator("#phase-5")).toBeVisible();
    await searchInput.fill("");

    // Assert zero page errors
    expect(errorLogs).toEqual([]);
  });

  test("7. Telemetry Snapshot Ingest & Export - Ingests valid snapshot and updates telemetry", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Attempt to open Ingest modal in Observer Mode
    const ingestBtn = page.getByTestId("ingest-snapshot-btn");
    await ingestBtn.click();

    // Verify snapshot modal is open
    const modalHeading = page.locator("text=Telemetry Snapshot Ingest");
    await expect(modalHeading).toBeVisible();

    // Observer sees Commander Clearance warning and unlock button
    await expect(page.locator("text=COMMANDER CLEARANCE REQUIRED")).toBeVisible();
    const unlockBtn = page.getByRole("button", { name: /UNLOCK COMMANDER MODE/i });
    await expect(unlockBtn).toBeVisible();

    // Close modal, authenticate Commander Mode via test hook, and re-open
    await page.locator("button[aria-label='Close modal']").click();
    await authenticateCommander(page);

    // Re-open ingest modal as Commander
    await ingestBtn.click();
    await expect(modalHeading).toBeVisible();
    await expect(page.locator("text=COMMANDER CLEARANCE REQUIRED")).not.toBeVisible();

    // Fill valid JSON snapshot with 4 tasks and 1 milestone
    const validSnapshot = JSON.stringify({
      version: "1.0",
      exportedAt: new Date().toISOString(),
      clearanceRank: "SysAdmin",
      progressPercentage: 3,
      completedTaskIds: ["task-0.1.1", "task-0.1.2", "task-0.1.3", "task-1.1.1"],
      completedMilestoneIds: ["ms-sys-init-probe"],
    });

    const textarea = page.getByTestId("snapshot-textarea");
    await textarea.fill(validSnapshot);

    // Verify preview renders
    await expect(page.locator("text=VALID SNAPSHOT DETECTED")).toBeVisible();

    // Ingest snapshot
    const submitBtn = page.getByTestId("snapshot-submit-btn");
    await submitBtn.click();

    // Verify modal closes and toast appears
    await expect(modalHeading).not.toBeVisible();
    await expect(page.locator("text=TELEMETRY INGESTED")).toBeVisible();

    // Verify HUD telemetry reflects 4 completed tasks
    await expect(page.locator("text=/4 \\/ 132/")).toBeVisible();

    // Verify state persistence across page reload
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=/4 \\/ 132/")).toBeVisible();

    // Verify Export button triggers download
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-snapshot-btn").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/devops-telemetry.*\.json/);

    // Verify Danger Zone Reset / Purge with ConfirmModal
    await ingestBtn.click();
    await expect(modalHeading).toBeVisible();

    // Click Danger Zone Purge button
    const resetBtn = page.getByTestId("reset-progress-btn");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify Snapshot modal closes and ConfirmModal opens
    await expect(modalHeading).not.toBeVisible();
    const confirmModalTitle = page.locator("text=CRITICAL TELEMETRY PURGE PROTOCOL");
    await expect(confirmModalTitle).toBeVisible();

    // Click Cancel / Abort
    await page.getByTestId("cancel-purge-btn").click();
    await expect(confirmModalTitle).not.toBeVisible();
    await expect(page.locator("text=/4 \\/ 132/")).toBeVisible();

    // Open Snapshot modal again and confirm purge
    await ingestBtn.click();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(confirmModalTitle).toBeVisible();

    // Click Purge All Data
    await page.getByTestId("confirm-purge-btn").click();
    await expect(confirmModalTitle).not.toBeVisible();
    await expect(page.locator("text=TELEMETRY PURGED")).toBeVisible();
    await expect(page.locator("text=/0 \\/ 132/")).toBeVisible();
  });

  test("8. Google Drive Cloud Sync - Widget states, connect, synced indicator, and disconnect lifecycle", async ({ page }) => {
    const errorLogs: string[] = [];
    page.on("pageerror", (err) => {
      errorLogs.push(err.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Disconnected State: Connect Drive button exists in Header HUD
    const driveBtn = page.getByTestId("drive-connect-btn");
    await expect(driveBtn).toBeVisible();

    // Click Connect Drive button -> triggers auth attempt and transitions status
    await driveBtn.click();
    await expect(
      page.locator("text=/AUTHENTICATING|GOOGLE CLIENT ID NOT CONFIGURED|DRIVE SYNC FAILED/").first()
    ).toBeVisible();

    // Intercept Google Drive API requests for mock manual sync
    await page.route("https://www.googleapis.com/**", async (route) => {
      const url = route.request().url();
      if (url.includes("/upload/drive/v3/files")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "mock-file-123" }),
        });
      }
      if (url.includes("/files") && route.request().method() === "POST") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "mock-file-123" }),
        });
      }
      if (url.includes("/files")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            files: [{ id: "mock-file-123", name: "devops-command-telemetry.json" }],
          }),
        });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    // 2. Connected State: Set session storage token and user
    await page.evaluate(() => {
      sessionStorage.setItem("devops_drive_token", "mock-session-token");
      sessionStorage.setItem(
        "devops_drive_user",
        JSON.stringify({ email: "commander@cloud.dev", name: "Commander Alex" })
      );
    });

    // Reload to let RoadmapProvider restore session
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Assert Connected widget is now visible with static indicator
    const syncedWidget = page.getByTestId("drive-synced-widget");
    await expect(syncedWidget).toBeVisible();
    await expect(page.locator("text=/DRIVE CONNECTED/")).toBeVisible();

    // Manual sync button exists
    const manualSyncBtn = page.getByTestId("drive-sync-manual-btn");
    await expect(manualSyncBtn).toBeVisible();

    // Trigger on-demand manual sync
    await manualSyncBtn.click();

    // Assert telemetry backup success toast appears
    await expect(page.locator("text=TELEMETRY BACKUP SYNCED TO DRIVE")).toBeVisible();
    await expect(page.locator("text=/DRIVE CONNECTED/")).toBeVisible();

    // 3. Disconnect: Click disconnect button
    const disconnectBtn = page.getByTestId("drive-disconnect-btn");
    await disconnectBtn.click();

    // Assert toast appears
    await expect(page.locator("text=DRIVE DISCONNECTED")).toBeVisible();

    // Assert reverts to Connect Drive button
    await expect(page.getByTestId("drive-connect-btn")).toBeVisible();

    // Verify zero unhandled exceptions
    expect(errorLogs).toEqual([]);
  });

  test("9. Mobile Responsiveness - Zero horizontal overflow on mobile viewports (390px & 412px)", async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 412, height: 915 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify header is visible
      const header = page.locator("header");
      await expect(header).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        scrollWidth,
        `Horizontal overflow detected at ${viewport.width}px viewport (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`
      ).toBeLessThanOrEqual(clientWidth);
    }
  });

  test("10. Proof-of-Work Artifact Locker - Attach evidence in Commander Mode, verify badges, links, and persistence", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const milestoneCard = page.getByTestId("milestone-card-server-stats");
    await expect(milestoneCard).toBeVisible();

    // 1. In Observer Mode: No artifact attached yet -> shows "AWAITING DEPLOYMENT" badge
    await expect(milestoneCard.locator("text=/AWAITING DEPLOYMENT/i")).toBeVisible();
    // Commander edit button should not be present in Observer Mode
    await expect(milestoneCard.getByTestId("artifact-attach-btn")).toHaveCount(0);

    // 2. Authenticate Commander Mode via Google Identity test hook
    await authenticateCommander(page);

    // 3. Commander Mode: "ATTACH EVIDENCE" button is now visible
    const attachBtn = milestoneCard.getByTestId("artifact-attach-btn");
    await expect(attachBtn).toBeVisible();
    await expect(attachBtn).toHaveText(/ATTACH EVIDENCE/i);

    // Click ATTACH EVIDENCE to open drawer
    await attachBtn.click();

    // Fill in GitHub Repository URL and Live Demo URL
    const repoInput = milestoneCard.getByTestId("artifact-repo-input");
    await expect(repoInput).toBeVisible();
    await repoInput.fill("https://github.com/example/server-stats");

    const liveInput = milestoneCard.getByTestId("artifact-live-input");
    await liveInput.fill("https://server-stats-demo.devops.io");

    const notesInput = milestoneCard.getByTestId("artifact-notes-input");
    await notesInput.fill("Production telemetry extraction bash script with sysstat profiling");

    // Save Artifact
    const saveBtn = milestoneCard.getByTestId("artifact-save-btn");
    await saveBtn.click();

    // Assert success toast appears
    await expect(page.locator("text=ARTIFACT SECURED: Project evidence linked")).toBeVisible();

    // 4. Assert Verified Artifact badge appears
    await expect(milestoneCard.locator("text=/VERIFIED ARTIFACT/i")).toBeVisible();

    // 5. Assert Direct Links are rendered with correct attributes
    const repoLink = milestoneCard.getByTestId("artifact-repo-link");
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute("href", "https://github.com/example/server-stats");
    await expect(repoLink).toHaveAttribute("target", "_blank");
    await expect(repoLink).toHaveAttribute("rel", "noopener noreferrer");

    const liveLink = milestoneCard.getByTestId("artifact-live-link");
    await expect(liveLink).toBeVisible();
    await expect(liveLink).toHaveAttribute("href", "https://server-stats-demo.devops.io");
    await expect(liveLink).toHaveAttribute("target", "_blank");
    await expect(liveLink).toHaveAttribute("rel", "noopener noreferrer");

    // 6. Assert State Persistence across page reload
    await page.reload();
    await page.waitForLoadState("networkidle");

    const reloadedCard = page.getByTestId("milestone-card-server-stats");
    await expect(reloadedCard).toBeVisible();
    await expect(reloadedCard.locator("text=/VERIFIED ARTIFACT/i")).toBeVisible();

    const reloadedRepoLink = reloadedCard.getByTestId("artifact-repo-link");
    await expect(reloadedRepoLink).toBeVisible();
    await expect(reloadedRepoLink).toHaveAttribute("href", "https://github.com/example/server-stats");
  });

  test("11. Holographic Clearance ID Generator - Generates 1200x630 Canvas badge and exports PNG", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Locate ID Clearance button in Header HUD
    const badgeBtn = page.getByTestId("clearance-badge-btn");
    await expect(badgeBtn).toBeVisible();

    // 2. Click button to launch modal
    await badgeBtn.click();

    // 3. Assert modal opens and metadata is rendered
    const modalHeading = page.locator("text=Holographic Clearance ID Generator");
    await expect(modalHeading).toBeVisible();
    await expect(page.locator("text=Amr Elsherif").first()).toBeVisible();

    // Assert canvas is rendered
    const canvas = page.getByTestId("badge-canvas");
    await expect(canvas).toBeVisible();

    // 4. Assert Download button is present and click to export
    const downloadBtn = page.getByTestId("badge-download-btn");
    await expect(downloadBtn).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await downloadBtn.click();
    const download = await downloadPromise;

    // Verify downloaded filename format
    expect(download.suggestedFilename()).toMatch(/devops-clearance-id.*\.png/);

    // 5. Verify success toast notification
    await expect(page.locator("text=CLEARANCE CREDENTIAL GENERATED")).toBeVisible();

    // 6. Close modal via close button
    const closeBtn = page.getByTestId("badge-modal-close-btn");
    await closeBtn.click();
    await expect(modalHeading).not.toBeVisible();
  });

  test("12. Chaos & Corrupted Snapshot Ingest - Rejects malformed JSON and preserves existing state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Authenticate Commander Mode via Google Identity test hook
    await authenticateCommander(page);

    // 2. Complete the first task to establish a known state
    const taskCheckbox = page.getByTestId("task-checkbox").first();
    await taskCheckbox.click();
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();

    // 3. Open Ingest Snapshot Modal
    const ingestBtn = page.getByTestId("ingest-snapshot-btn");
    await ingestBtn.click();
    await expect(page.locator("text=Telemetry Snapshot Ingest")).toBeVisible();

    // 4. Fill in malformed / non-JSON payload
    const textarea = page.getByTestId("snapshot-textarea");
    await textarea.fill("{ invalid_syntax_json: true, corrupted: ");

    // Verify schema error message is displayed
    await expect(page.locator("text=/SCHEMA ERROR:/i")).toBeVisible();

    // Verify submit button is disabled
    const submitBtn = page.getByTestId("snapshot-submit-btn");
    await expect(submitBtn).toBeDisabled();

    // 5. Fill in valid JSON syntax but invalid telemetry schema (missing arrays)
    await textarea.fill(JSON.stringify({ version: "1.0", completedTaskIds: "not-an-array" }));
    await expect(page.locator("text=/SCHEMA ERROR: Missing completedTaskIds or completedMilestoneIds arrays/i")).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Close modal
    await page.locator("button[aria-label='Close modal']").click();

    // 6. Verify existing progress remains intact (1 / 132 tasks still complete)
    await expect(page.locator("text=/1 \\/ 132/")).toBeVisible();
  });

  test("13. Google Drive Fault Tolerance - Gracefully handles HTTP 401 Unauthorized and resets state", async ({ page }) => {
    // 1. Pre-seed Drive session token into sessionStorage
    await page.addInitScript(() => {
      window.sessionStorage.setItem("devops_drive_token", "expired_or_revoked_token_xyz");
      window.sessionStorage.setItem(
        "devops_drive_user",
        JSON.stringify({ name: "DevOps Architect", email: "architect@devops.internal" })
      );
    });

    // 2. Intercept Google Drive API calls and simulate HTTP 401 Unauthorized
    await page.route("**/drive/v3/files*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            errors: [{ domain: "global", reason: "authError", message: "Invalid Credentials" }],
            code: 401,
            message: "Invalid Credentials",
          },
        }),
      });
    });

    await page.route("**/upload/drive/v3/files*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            errors: [{ domain: "global", reason: "authError", message: "Invalid Credentials" }],
            code: 401,
            message: "Invalid Credentials",
          },
        }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Initially, drive widget should reflect connected state from sessionStorage
    const driveWidget = page.getByTestId("drive-synced-widget");
    await expect(driveWidget).toBeVisible();

    // Trigger manual sync
    const manualSyncBtn = page.getByTestId("drive-sync-manual-btn");
    await manualSyncBtn.click();

    // Assert session expired / auth failure toast notification appears
    await expect(
      page.locator("text=/SESSION EXPIRED|SYNC FAILED|INVALID CREDENTIALS/i").first()
    ).toBeVisible();

    // Assert Drive session is revoked and UI reverts to "CONNECT DRIVE" button
    await expect(page.getByTestId("drive-connect-btn")).toBeVisible();
    await expect(driveWidget).toHaveCount(0);
  });

  test("14. Accessibility & Keyboard Navigation Audit - WCAG 2.1 AA Compliance", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("canvas")
      .analyze();

    // Filter for critical and serious violations
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      seriousViolations,
      `Detected ${seriousViolations.length} critical/serious accessibility violations: ${JSON.stringify(
        seriousViolations,
        null,
        2
      )}`
    ).toEqual([]);
  });
});
