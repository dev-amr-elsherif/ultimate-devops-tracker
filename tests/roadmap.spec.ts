import { test, expect } from "@playwright/test";

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

    // Verify Observer Mode button in header
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

  test("2. Commander Mode Authentication - Validates PIN and updates clearance", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Trigger Commander Passcode Modal via unlock button in header
    const unlockBtn = page.getByTestId("mode-toggle-btn");
    await unlockBtn.click();

    // Verify Modal is open
    const modalHeading = page.locator("text=Commander Authentication");
    await expect(modalHeading).toBeVisible();

    // Test Invalid PIN first
    const pinInput = page.getByPlaceholder("ENTER PASSCODE...");
    await pinInput.fill("0000");
    await page.getByRole("button", { name: /AUTHENTICATE/i }).click();

    // Assert error state appears
    await expect(page.locator("text=ACCESS REJECTED: INVALID CLEARANCE KEY")).toBeVisible();

    // Enter correct master PIN: admin123
    await pinInput.fill("admin123");
    await page.getByRole("button", { name: /AUTHENTICATE/i }).click();

    // Assert modal closes
    await expect(modalHeading).not.toBeVisible();

    // Assert Commander Mode is now ACTIVE
    const commanderBadge = page.getByTestId("mode-toggle-btn");
    await expect(commanderBadge).toBeVisible();
    await expect(commanderBadge.locator("text=ACTIVE")).toBeVisible();

    // Assert Header HUD label changes from "Tasks Locked" to "Tasks Completed"
    await expect(page.locator("text=/Tasks Completed/i")).toBeVisible();
  });

  test("3. Telemetry & Progress Calculation - Dynamically increments on completion", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Authenticate as Commander
    await page.getByTestId("mode-toggle-btn").click();
    await page.getByPlaceholder("ENTER PASSCODE...").fill("admin123");
    await page.getByRole("button", { name: /AUTHENTICATE/i }).click();

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
    await page.getByTestId("mode-toggle-btn").click();
    await page.getByPlaceholder("ENTER PASSCODE...").fill("admin123");
    await page.getByRole("button", { name: /AUTHENTICATE/i }).click();

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

    // Unlock Commander Mode via the modal prompt
    await unlockBtn.click();
    await page.getByPlaceholder("ENTER PASSCODE...").fill("admin123");
    await page.getByRole("button", { name: /AUTHENTICATE/i }).click();

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
    expect(download.suggestedFilename()).toMatch(/devops-roadmap-snapshot.*\.json/);
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

    // Click Connect Drive button -> triggers auth attempt and handles rejection gracefully
    await driveBtn.click();
    const alertToast = page.locator("text=/GOOGLE CLIENT ID NOT CONFIGURED|DRIVE SYNC FAILED/");
    await expect(alertToast).toBeVisible();

    // 2. Connected/Synced State: Set session storage token and user
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

    // Assert Synced widget is now visible
    const syncedWidget = page.getByTestId("drive-synced-widget");
    await expect(syncedWidget).toBeVisible();
    await expect(page.locator("text=/DRIVE SYNCED/")).toBeVisible();

    // Manual sync button exists
    const manualSyncBtn = page.getByTestId("drive-sync-manual-btn");
    await expect(manualSyncBtn).toBeVisible();

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
});
