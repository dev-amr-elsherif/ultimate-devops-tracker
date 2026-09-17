import { test, expect, Page } from "@playwright/test";

// Helper: Authenticate Commander Mode via window hook and storage keys
async function authenticateCommander(page: Page) {
  await page.waitForFunction(
    () =>
      typeof (window as unknown as { __setTestCommander?: (enabled: boolean) => void })
        .__setTestCommander === "function"
  );
  await page.evaluate(() => {
    window.localStorage.setItem("devops_test_commander", "true");
    window.sessionStorage.setItem("devops_test_commander", "true");
    (
      window as unknown as { __setTestCommander?: (enabled: boolean) => void }
    ).__setTestCommander?.(true);
  });
}

test.describe("Deep Telemetry & E2E Automation QA Suite (9-Phase Master Architecture)", () => {
  test.use({
    permissions: ["clipboard-read", "clipboard-write"],
  });

  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];
  let internalNetworkFailures: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    internalNetworkFailures = [];

    // Register listeners before every test
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    page.on("response", (res) => {
      const url = res.url();
      // Monitor internal asset & route responses (excluding external OAuth / third party)
      if (
        (url.includes("127.0.0.1:3000") || url.includes("localhost:3000")) &&
        res.status() >= 400
      ) {
        internalNetworkFailures.push(`${res.status()} - ${url}`);
      }
    });

    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // 1. Zero Console, Hydration & Network Error Trap
    const hydrationErrors = consoleErrors.filter(
      (err) =>
        err.toLowerCase().includes("hydration") ||
        err.toLowerCase().includes("did not match") ||
        err.toLowerCase().includes("minified react error")
    );
    expect(
      hydrationErrors,
      `React Hydration errors detected: ${hydrationErrors.join(" | ")}`
    ).toEqual([]);

    expect(
      pageErrors,
      `Unhandled browser page errors detected: ${pageErrors.join(" | ")}`
    ).toEqual([]);

    expect(
      internalNetworkFailures,
      `Internal network 404/500 failures detected: ${internalNetworkFailures.join(" | ")}`
    ).toEqual([]);
  });

  /* -------------------------------------------------------------------------- */
  /* 2. DATA INTEGRITY & TELEMETRY MATHEMATICS AUDIT                            */
  /* -------------------------------------------------------------------------- */
  test("2.1 Baseline Curriculum Ingestion - Exact 9 phases, 33 modules, 121 topics, 9 milestones", async ({
    page,
  }) => {
    // 1. Exactly 9 phases rendered in DOM
    const phaseCards = page.locator("div[id^='phase-0']");
    await expect(phaseCards).toHaveCount(9);

    // Verify all 9 phase IDs are sequentially addressed (phase-01 through phase-09)
    for (let i = 1; i <= 9; i++) {
      const pId = `phase-${i.toString().padStart(2, "0")}`;
      await expect(page.locator(`#${pId}`)).toBeVisible();
    }

    // 2. Exactly 33 module headers rendered in DOM
    const moduleHeaders = page.locator("button[aria-label^='Toggle Module:']");
    await expect(moduleHeaders).toHaveCount(33);

    // 3. Exactly 121 interactive topic checkboxes present in DOM
    const topicCheckboxes = page.locator("[data-testid='task-checkbox']");
    await expect(topicCheckboxes).toHaveCount(121);

    // 4. Exactly 9 milestone deliverable cards
    const milestoneCards = page.locator("[data-testid^='milestone-card-phase-']");
    await expect(milestoneCards).toHaveCount(9);

    // 5. Initial HUD Telemetry: 0 / 121 and 0%
    await expect(page.locator("text=/0 \\/ 121/")).toBeVisible();
    await expect(page.locator("text=/PROGRESS:/i")).toBeVisible();
    await expect(page.locator("text=/TOPICS DEFENDED:/i")).toBeVisible();
  });

  test("2.2 Mathematical Progression Stress Test - Dynamic progress, tier transitions, and defended state", async ({
    page,
  }) => {
    await authenticateCommander(page);
    await expect(page.locator("text=/TOPICS DEFENDED:/i")).toBeVisible();

    const topicCheckboxes = page.locator("[data-testid='task-checkbox']");

    // A. Toggle exactly 1 topic: 1 / 121 ≈ 1%
    await topicCheckboxes.first().click();
    await expect(page.locator("text=/1 \\/ 121/")).toBeVisible();
    await expect(page.locator("text=/1%/").first()).toBeVisible();

    // B. Toggle remaining 30 topics (total 31 topics: 31 / 121 = 25.62% ≈ 26%)
    // This crosses the 26% threshold to Tier 2: Cloud Specialist
    for (let i = 1; i < 31; i++) {
      await topicCheckboxes.nth(i).click();
    }

    await expect(page.locator("text=/31 \\/ 121/")).toBeVisible();
    await expect(page.locator("text=/26%/").first()).toBeVisible();

    // Open Holographic Clearance ID modal to verify clearance tier transition
    const badgeBtn = page.getByTestId("clearance-badge-btn");
    await badgeBtn.click();
    await expect(page.locator("text=TIER 2: CLOUD SPECIALIST")).toBeVisible();
    await page.getByTestId("badge-modal-close-btn").click();

    // C. Reset progress to zero to isolate Phase 01 full defense test
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await authenticateCommander(page);
    await expect(page.locator("text=/0 \\/ 121/")).toBeVisible();

    // In Phase 01, there are exactly 21 topics
    const phase01 = page.locator("#phase-01");
    const phase01Checkboxes = phase01.locator("[data-testid='task-checkbox']");
    await expect(phase01Checkboxes).toHaveCount(21);

    for (let i = 0; i < 21; i++) {
      await phase01Checkboxes.nth(i).click();
    }

    // Verify Phase 01 progress reaches 100% topics (21/21)
    await expect(phase01.locator("text=21/21 Topics")).toBeVisible();
    await expect(phase01.locator("text=100%")).toBeVisible();

    // Verify Phase 01 milestone
    const p1MilestoneBtn = page.getByTestId("milestone-verify-btn-phase-01");
    await p1MilestoneBtn.click();

    // Assert Phase 01 achieves full defense: "100% DEFENDED" badge is visible
    await expect(phase01.locator("text=100% DEFENDED")).toBeVisible();

    // D. Rollback verification: unchecking 1 topic rolls back progress and defended status
    await phase01Checkboxes.first().click();

    // Assert "100% DEFENDED" badge disappears immediately
    await expect(phase01.locator("text=100% DEFENDED")).toHaveCount(0);
    // Topics count drops to 20/21
    await expect(phase01.locator("text=20/21 Topics")).toBeVisible();
    // Progress rolls back to Math.round(20/21 * 100) = 95%
    await expect(phase01.locator("text=95%")).toBeVisible();
    await expect(page.locator("text=/20 \\/ 121/")).toBeVisible();
  });

  /* -------------------------------------------------------------------------- */
  /* 3. CROSS-VIEWPORT & RESPONSIVE UX REGRESSION                               */
  /* -------------------------------------------------------------------------- */
  const VIEWPORTS = [
    { name: "Mobile Portrait (390 x 844)", width: 390, height: 844 },
    { name: "Tablet Portrait (820 x 1180)", width: 820, height: 1180 },
    { name: "Desktop (1440 x 900)", width: 1440, height: 900 },
    { name: "Ultrawide Monitor (2560 x 1440)", width: 2560, height: 1440 },
  ];

  for (const vp of VIEWPORTS) {
    test(`3. Responsive Layout Audit [${vp.name}] - Zero horizontal overflow & sticky dock`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Strict test: Assert documentElement scrollWidth equals clientWidth (zero horizontal overflow leakage)
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          leaks: doc.scrollWidth > doc.clientWidth,
        };
      });

      expect(
        overflow.leaks,
        `Horizontal overflow leakage detected on ${vp.name}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`
      ).toBe(false);

      // Verify HeaderHUD is sticky and visible
      const header = page.locator("header");
      await expect(header).toBeVisible();

      // Verify Floating Dock is visible, accessible, and unclipped within viewport
      const floatingDock = page.locator("nav[aria-label='Quick Actions Dock']");
      await expect(floatingDock).toBeVisible();

      const dockBox = await floatingDock.boundingBox();
      expect(dockBox).not.toBeNull();
      if (dockBox) {
        expect(dockBox.y + dockBox.height).toBeLessThanOrEqual(vp.height + 5);
        expect(dockBox.x).toBeGreaterThanOrEqual(-5);
        expect(dockBox.x + dockBox.width).toBeLessThanOrEqual(vp.width + 5);
      }

      // Verify FilterBar buttons wrap or remain unclipped
      const filterBar = page.locator("text=ALL TRACKS");
      await expect(filterBar).toBeVisible();
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 4. FUNCTIONAL INTERACTION & STATE ENGINE                                    */
  /* -------------------------------------------------------------------------- */
  test("4.1 Observer Mode vs Commander Mode Security & Note Persistence", async ({ page }) => {
    // 1. In Observer Mode: Clicking topic checkbox is blocked
    const firstCheckbox = page.locator("[data-testid='task-checkbox']").first();
    await firstCheckbox.click();
    await expect(page.getByText("ACCESS DENIED").first()).toBeVisible();
    await expect(page.locator("text=Commander Mode authentication required")).toBeVisible();
    await expect(page.locator("text=/0 \\/ 121/")).toBeVisible();

    // 2. In Observer Mode: Milestone verification is blocked
    const firstMilestoneBtn = page.getByTestId("milestone-verify-btn-phase-01");
    await firstMilestoneBtn.click();
    await expect(page.getByText("ACCESS DENIED").first()).toBeVisible();

    // 3. Switch to Commander Mode
    await authenticateCommander(page);
    await expect(page.locator("text=/TOPICS DEFENDED:/i")).toBeVisible();

    // 4. Toggle topic checkbox in Commander Mode
    await firstCheckbox.click();
    await expect(page.locator("text=/1 \\/ 121/")).toBeVisible();
    await expect(firstCheckbox.locator("svg.lucide-check")).toBeVisible();

    // 5. Open notes drawer on first topic
    const firstNotesToggle = page.getByTestId("topic-notes-toggle-btn").first();
    await firstNotesToggle.click();

    const notesInput = page.getByTestId("topic-notes-input").first();
    await expect(notesInput).toBeVisible();
    await notesInput.fill("Automated eBPF telemetry inspection with Linux tracepoints.");

    const proofInput = page.getByTestId("topic-proof-input").first();
    await expect(proofInput).toBeVisible();
    await proofInput.fill("https://github.com/example/linux-kernel-tracepoints");

    // Click Save Telemetry
    const saveBtn = page.getByTestId("topic-save-btn").first();
    await saveBtn.click();
    await expect(page.locator("text=TELEMETRY LOGGED")).toBeVisible();

    // 6. State Persistence (localStorage) - Reload page and assert notes are retained
    await page.reload();
    await page.waitForLoadState("networkidle");
    await authenticateCommander(page);

    await expect(page.locator("text=/1 \\/ 121/")).toBeVisible();

    const reloadedNotesToggle = page.getByTestId("topic-notes-toggle-btn").first();
    await reloadedNotesToggle.click();

    const reloadedNotesInput = page.getByTestId("topic-notes-input").first();
    await expect(reloadedNotesInput).toHaveValue(
      "Automated eBPF telemetry inspection with Linux tracepoints."
    );

    const reloadedProofInput = page.getByTestId("topic-proof-input").first();
    await expect(reloadedProofInput).toHaveValue(
      "https://github.com/example/linux-kernel-tracepoints"
    );
  });

  test("4.2 FilterBar State Machine & Search Engine", async ({ page }) => {
    // 1. Filter by Sequential Foundations (5 phases: 01, 03, 04, 07, 09)
    await page.getByRole("button", { name: "SEQUENTIAL FOUNDATIONS" }).click();

    await expect(page.locator("#phase-01")).toBeVisible();
    await expect(page.locator("#phase-03")).toBeVisible();
    await expect(page.locator("#phase-04")).toBeVisible();
    await expect(page.locator("#phase-07")).toBeVisible();
    await expect(page.locator("#phase-09")).toBeVisible();

    // Parallel phases must NOT be visible
    await expect(page.locator("#phase-02")).toHaveCount(0);
    await expect(page.locator("#phase-05")).toHaveCount(0);
    await expect(page.locator("#phase-06")).toHaveCount(0);
    await expect(page.locator("#phase-08")).toHaveCount(0);

    // 2. Filter by Parallel Specializations (4 phases: 02, 05, 06, 08)
    await page.getByRole("button", { name: "PARALLEL SPECIALIZATIONS" }).click();

    await expect(page.locator("#phase-02")).toBeVisible();
    await expect(page.locator("#phase-05")).toBeVisible();
    await expect(page.locator("#phase-06")).toBeVisible();
    await expect(page.locator("#phase-08")).toBeVisible();

    // Sequential phases must NOT be visible
    await expect(page.locator("#phase-01")).toHaveCount(0);
    await expect(page.locator("#phase-03")).toHaveCount(0);
    await expect(page.locator("#phase-04")).toHaveCount(0);
    await expect(page.locator("#phase-07")).toHaveCount(0);
    await expect(page.locator("#phase-09")).toHaveCount(0);

    // Assert glowing cyan parallel indicator badge on parallel phase
    await expect(page.locator("text=PARALLEL WITH: PHASE-01")).toBeVisible();

    // Reset to ALL TRACKS
    await page.getByRole("button", { name: "ALL TRACKS" }).click();
    await expect(page.locator("#phase-01")).toBeVisible();
    await expect(page.locator("#phase-02")).toBeVisible();

    // 3. Real-time Search Engine
    const searchInput = page.getByPlaceholder(/Search topics/i);

    // Search "Terraform" -> Matches Phase 05
    await searchInput.fill("Terraform");
    await expect(page.locator("#phase-05")).toBeVisible();
    await expect(page.locator("#phase-01")).toHaveCount(0);

    // Search "ArgoCD" -> Matches Phase 08
    await searchInput.fill("ArgoCD");
    await expect(page.locator("#phase-08")).toBeVisible();
    await expect(page.locator("#phase-05")).toHaveCount(0);

    // Search non-existent/out-of-scope query "eBPF" -> displays empty state cleanly
    await searchInput.fill("eBPF");
    await expect(page.locator("text=No Matching Protocols Found")).toBeVisible();
    await expect(page.locator("div[id^='phase-0']")).toHaveCount(0);

    // Clear search -> All 9 phases restored
    await searchInput.fill("");
    await expect(page.locator("div[id^='phase-0']")).toHaveCount(9);
  });

  test("4.3 Recon Academy (Coursera Drawer) & Clipboard Copy", async ({ page }) => {
    // 1. Expand Recon Academy Coursera drawer on Phase 01
    const reconToggle = page.getByTestId("recon-drawer-toggle-phase-01");
    await reconToggle.click();

    // Assert drawer content is open
    await expect(page.locator("text=Curated foundational training courses")).toBeVisible();

    // 2. Validate Coursera query chip links contain encoded URL
    const courseraLink = page.locator("#phase-01 a[href^='https://www.coursera.org/search']").first();
    await expect(courseraLink).toBeVisible();
    const href = await courseraLink.getAttribute("href");
    expect(href).toContain("https://www.coursera.org/search?query=");

    // 3. Test Copy to Clipboard button
    const copyBtn = page.getByTestId("recon-copy-btn-phase-01-0");
    await copyBtn.click();

    // Assert toast notification appears
    await expect(page.locator("text=QUERY COPIED")).toBeVisible();

    // Assert clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.length).toBeGreaterThan(0);
  });

  test("4.4 Purge Protocol Modal - Dynamic warning counts and safe reset", async ({ page }) => {
    await authenticateCommander(page);

    // Check 2 topics to establish non-zero state
    const checkboxes = page.locator("[data-testid='task-checkbox']");
    await checkboxes.first().click();
    await checkboxes.nth(1).click();
    await expect(page.locator("text=/2 \\/ 121/")).toBeVisible();

    // Open snapshot modal
    await page.getByTestId("snapshot-dock-btn").click();
    await expect(page.locator("text=Telemetry Snapshot Ingest")).toBeVisible();

    // Trigger Purge Telemetry button
    await page.getByTestId("reset-progress-btn").click();

    // Assert Danger Purge Protocol modal is displayed
    const purgeHeading = page.locator("text=CRITICAL TELEMETRY PURGE PROTOCOL");
    await expect(purgeHeading).toBeVisible();

    // Assert dynamic topic count (121 topics, NO hardcoded legacy 132 numbers)
    await expect(page.locator("text=/121 tracked engineering topic completions/i")).toBeVisible();
    await expect(
      page.locator("text=/9 defended milestone project certifications/i")
    ).toBeVisible();

    // 1. Test ABORT ACTION closes modal with ZERO state loss
    await page.getByTestId("cancel-purge-btn").click();
    await expect(purgeHeading).not.toBeVisible();
    await expect(page.locator("text=/2 \\/ 121/")).toBeVisible();

    // 2. Re-open and confirm purge
    await page.getByTestId("snapshot-dock-btn").click();
    await page.getByTestId("reset-progress-btn").click();
    await expect(purgeHeading).toBeVisible();

    await page.getByTestId("confirm-purge-btn").click();
    await expect(purgeHeading).not.toBeVisible();

    // Assert progress is reset to 0% and 0 / 121
    await expect(page.locator("text=/0 \\/ 121/")).toBeVisible();
    await expect(page.locator("text=/0%/").first()).toBeVisible();
  });

  /* -------------------------------------------------------------------------- */
  /* 5. HOLOGRAPHIC CANVAS ID & ARTIFACT ENGINE                                  */
  /* -------------------------------------------------------------------------- */
  test("5. Holographic Clearance ID Generator - 1200x630 Canvas, valid PNG header, and live telemetry", async ({
    page,
  }) => {
    await authenticateCommander(page);

    // Complete 5 topics to verify telemetry integration
    const checkboxes = page.locator("[data-testid='task-checkbox']");
    for (let i = 0; i < 5; i++) {
      await checkboxes.nth(i).click();
    }
    await expect(page.locator("text=/5 \\/ 121/")).toBeVisible();

    // Open Holographic ID Modal
    await page.getByTestId("clearance-badge-btn").click();
    await expect(page.locator("text=Holographic Clearance ID Generator")).toBeVisible();

    // Inspect underlying <canvas> element
    const canvas = page.getByTestId("badge-canvas");
    await expect(canvas).toBeVisible();

    // Wait briefly for 2D render loop to finish synthesis
    await page.waitForTimeout(400);

    // Assert intrinsic canvas dimensions are exactly 1200 x 630
    const dimensions = await canvas.evaluate((c: HTMLCanvasElement) => ({
      width: c.width,
      height: c.height,
    }));
    expect(dimensions.width).toBe(1200);
    expect(dimensions.height).toBe(630);

    // Assert canvas context drew valid pixel data (non-empty canvas)
    const hasDrawnPixels = await canvas.evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext("2d");
      if (!ctx) return false;
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] > 0) return true;
      }
      return false;
    });
    expect(hasDrawnPixels).toBe(true);

    // Trigger PNG download and validate image header bytes
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("badge-download-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/devops-clearance-id.*\.png/);

    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      const buffer = Buffer.concat(chunks);
      // Standard 8-byte PNG magic header: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
      const expectedPngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(buffer.subarray(0, 8)).toEqual(expectedPngHeader);
    }

    // Close modal
    await page.getByTestId("badge-modal-close-btn").click();
  });

  /* -------------------------------------------------------------------------- */
  /* 6. SNAPSHOT ENGINE ROUNDTRIP & FAULT TOLERANCE                             */
  /* -------------------------------------------------------------------------- */
  test("6.1 Snapshot Export Test - Validates Schema v3.1.0 and 121 populated topics", async ({
    page,
  }) => {
    await authenticateCommander(page);

    // Open snapshot modal
    await page.getByTestId("snapshot-dock-btn").click();

    // Trigger export download
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-snapshot-btn").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^devops-complete-roadmap-.*\.json$/);

    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      const exportedArchive = JSON.parse(Buffer.concat(chunks).toString("utf-8"));

      // Validate schema specifications
      expect(exportedArchive.schemaVersion).toBe("3.1.0");
      expect(exportedArchive.phases).toHaveLength(9);

      let totalTopics = 0;
      exportedArchive.phases.forEach((p: { deepDiveTopics: Array<{ topics: unknown[] }> }) => {
        p.deepDiveTopics.forEach((m) => {
          totalTopics += m.topics.length;
        });
      });
      expect(totalTopics).toBe(121);

      // Validate lean engineer payload without raw base64 avatarUrl overhead
      expect(exportedArchive.engineer).toBeDefined();
      expect(exportedArchive.engineer.name).toBe("Amr Fathy Elsherif");
      expect(exportedArchive.engineer.avatarUrl).toBeUndefined();
    }

    await page.locator("button[aria-label='Close modal']").click();
  });

  test("6.2 Snapshot Roundtrip Ingest - Mutate 15 topics, export, purge, and restore 100% state", async ({
    page,
  }) => {
    await authenticateCommander(page);

    // Mutate 15 topics
    const checkboxes = page.locator("[data-testid='task-checkbox']");
    for (let i = 0; i < 15; i++) {
      await checkboxes.nth(i).click();
    }
    await expect(page.locator("text=/15 \\/ 121/")).toBeVisible();

    // Add note to topic 1
    const firstNotesToggle = page.getByTestId("topic-notes-toggle-btn").first();
    await firstNotesToggle.click();
    const notesInput = page.getByTestId("topic-notes-input").first();
    await notesInput.fill("Roundtrip state integrity test note.");
    await page.getByTestId("topic-save-btn").first().click();
    await expect(page.locator("text=TELEMETRY LOGGED")).toBeVisible();

    // Export snapshot
    await page.getByTestId("snapshot-dock-btn").click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-snapshot-btn").click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();
    let exportedJsonString = "";
    if (stream) {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      exportedJsonString = Buffer.concat(chunks).toString("utf-8");
    }

    // Trigger full purge
    await page.getByTestId("reset-progress-btn").click();
    await page.getByTestId("confirm-purge-btn").click();
    await expect(page.locator("text=/0 \\/ 121/")).toBeVisible();

    // Ingest the exported snapshot JSON back into the app
    await page.getByTestId("snapshot-dock-btn").click();
    const textarea = page.getByTestId("snapshot-textarea");
    await textarea.fill(exportedJsonString);

    await expect(page.locator("text=VALID SNAPSHOT DETECTED")).toBeVisible();
    await page.getByTestId("snapshot-submit-btn").click();
    await expect(page.locator("text=TELEMETRY INGESTED")).toBeVisible();

    // Assert 100% state recovery: 15 / 121 topics restored
    await expect(page.locator("text=/15 \\/ 121/")).toBeVisible();

    // Verify note on topic 1 is restored
    if (!(await notesInput.isVisible())) {
      await firstNotesToggle.click();
    }
    await expect(notesInput).toHaveValue("Roundtrip state integrity test note.");
  });

  test("6.3 Legacy Ingestion Migration (v3.0.0) - Gracefully maps legacy schema without crashes", async ({
    page,
  }) => {
    await authenticateCommander(page);

    await page.getByTestId("snapshot-dock-btn").click();
    await expect(page.locator("text=Telemetry Snapshot Ingest")).toBeVisible();

    // Legacy schema snapshot with old task IDs and milestone IDs
    const legacySnapshot = {
      version: "3.0.0",
      timestamp: new Date().toISOString(),
      clearanceRank: "TIER 1: SYSTEMS OPERATOR",
      progressPercentage: 5,
      completedTaskIds: [
        "task-0.1.1", // maps to phase-01-m0-t0
        "task-0.1.2", // maps to phase-01-m0-t1
        "task-1.1.1", // maps to phase-01-m3-t0
        "task-2.1.1", // maps to phase-02-m0-t0
      ],
      completedMilestoneIds: ["server-stats"], // maps to phase-01
    };

    const textarea = page.getByTestId("snapshot-textarea");
    await textarea.fill(JSON.stringify(legacySnapshot));

    await expect(page.locator("text=VALID SNAPSHOT DETECTED")).toBeVisible();
    await page.getByTestId("snapshot-submit-btn").click();

    // Verify successful migration and toast
    await expect(page.locator("text=TELEMETRY INGESTED")).toBeVisible();

    // Telemetry shows 4 mapped topics
    await expect(page.locator("text=/4 \\/ 121/")).toBeVisible();

    // Verify mapped topics in DOM
    const phase01 = page.locator("#phase-01");
    await expect(phase01).toBeVisible();
  });
});
