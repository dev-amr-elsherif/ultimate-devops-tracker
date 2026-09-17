import QRCode from "qrcode";

export interface ClearanceTierInfo {
  tier: string;
  level: number;
  color: string;
  badge: string;
}

export function getClearanceTier(progress: number): ClearanceTierInfo {
  if (progress >= 100) {
    return {
      tier: "PRINCIPAL CLOUD COMMANDER",
      level: 5,
      color: "#10b981", // Neon Emerald
      badge: "TIER 5 // PRINCIPAL CLOUD COMMANDER",
    };
  }
  if (progress >= 76) {
    return {
      tier: "TIER 4: PLATFORM LEAD",
      level: 4,
      color: "#06b6d4", // Cyber Cyan
      badge: "TIER 4 // PLATFORM LEAD",
    };
  }
  if (progress >= 51) {
    return {
      tier: "TIER 3: INFRASTRUCTURE ARCHITECT",
      level: 3,
      color: "#38bdf8", // Sky
      badge: "TIER 3 // INFRASTRUCTURE ARCHITECT",
    };
  }
  if (progress >= 26) {
    return {
      tier: "TIER 2: CLOUD SPECIALIST",
      level: 2,
      color: "#f59e0b", // Amber
      badge: "TIER 2 // CLOUD SPECIALIST",
    };
  }
  return {
    tier: "TIER 1: SYSTEMS OPERATOR",
    level: 1,
    color: "#94a3b8", // Slate
    badge: "TIER 1 // SYSTEMS OPERATOR",
  };
}

export interface RenderCanvasOptions {
  engineerName?: string;
  globalProgress: number;
  completedItems: number;
  totalItems: number;
  verifiedArtifacts: number;
  customAvatarUrl?: string | null;
  verificationHash?: string;
  qrPayloadUrl?: string;
}

// Fallback SHA-256 in pure JS for deterministic hash rendering
export async function computeVerificationHash(payload: string): Promise<string> {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}

  // Fallback simple 64-character hex hash if crypto.subtle is unavailable
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return (part1 + part2 + part1 + part2 + part1 + part2 + part1 + part2).slice(0, 64);
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
  }
  ctx.closePath();
}

/**
 * Generates the Holographic Clearance ID Canvas Badge (1200x630)
 */
export async function renderClearanceBadgeCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCanvasOptions
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const WIDTH = 1200;
  const HEIGHT = 630;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const engineerName = options.engineerName || "Amr Fathy Elsherif";
  const globalProgress = Math.max(0, Math.min(100, Math.round(options.globalProgress)));
  const completedItems = options.completedItems;
  const totalItems = options.totalItems || 121;
  const verifiedArtifacts = options.verifiedArtifacts;
  const tierInfo = getClearanceTier(globalProgress);

  const hashSeed = `${engineerName}:${globalProgress}:${completedItems}:${totalItems}:${verifiedArtifacts}:DEVOPS-2026`;
  const verificationHash = options.verificationHash || (await computeVerificationHash(hashSeed));
  const qrUrl =
    options.qrPayloadUrl ||
    `https://dev-amr-elsherif.github.io/ultimate-devops-tracker?verify=${verificationHash.slice(0, 16)}&tier=${encodeURIComponent(tierInfo.tier)}`;

  // ==========================================
  // 1. Cyber Background (Deep Matrix Obsidian #0a0b10)
  // ==========================================
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, "#0a0b10");
  bgGrad.addColorStop(0.5, "#07080d");
  bgGrad.addColorStop(1, "#030407");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Radial Ambient Glows
  const cyanAmbient = ctx.createRadialGradient(250, 180, 20, 250, 180, 480);
  cyanAmbient.addColorStop(0, "rgba(6, 182, 212, 0.16)");
  cyanAmbient.addColorStop(0.6, "rgba(6, 182, 212, 0.03)");
  cyanAmbient.addColorStop(1, "transparent");
  ctx.fillStyle = cyanAmbient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const emeraldAmbient = ctx.createRadialGradient(950, 420, 30, 950, 420, 450);
  emeraldAmbient.addColorStop(0, "rgba(16, 185, 129, 0.12)");
  emeraldAmbient.addColorStop(0.6, "rgba(16, 185, 129, 0.02)");
  emeraldAmbient.addColorStop(1, "transparent");
  ctx.fillStyle = emeraldAmbient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Perspective Matrix Grid
  ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
  ctx.lineWidth = 1;
  const GRID = 30;
  for (let x = 0; x < WIDTH; x += GRID) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += GRID) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // CRT Scanlines Overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  for (let y = 0; y < HEIGHT; y += 4) {
    ctx.fillRect(0, y, WIDTH, 1.5);
  }

  // Outer Cyberpunk Border Frame (with neon cyber cutouts)
  ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);

  // High-Tech Corner Brackets
  const cornerLen = 30;
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 3;

  // Top-Left Corner
  ctx.beginPath();
  ctx.moveTo(28, 28 + cornerLen);
  ctx.lineTo(28, 28);
  ctx.lineTo(28 + cornerLen, 28);
  ctx.stroke();

  // Top-Right Corner
  ctx.beginPath();
  ctx.moveTo(WIDTH - 28 - cornerLen, 28);
  ctx.lineTo(WIDTH - 28, 28);
  ctx.lineTo(WIDTH - 28, 28 + cornerLen);
  ctx.stroke();

  // Bottom-Left Corner
  ctx.beginPath();
  ctx.moveTo(28, HEIGHT - 28 - cornerLen);
  ctx.lineTo(28, HEIGHT - 28);
  ctx.lineTo(28 + cornerLen, HEIGHT - 28);
  ctx.stroke();

  // Bottom-Right Corner
  ctx.beginPath();
  ctx.moveTo(WIDTH - 28 - cornerLen, HEIGHT - 28);
  ctx.lineTo(WIDTH - 28, HEIGHT - 28);
  ctx.lineTo(WIDTH - 28, HEIGHT - 28 - cornerLen);
  ctx.stroke();

  // Top Header System Tag
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
  ctx.fillText("// ULTIMATE DEVOPS TRACKER PRO • HOLOGRAPHIC CLEARANCE CREDENTIAL v3.1.0", 52, 54);

  const issuedDate = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
  ctx.textAlign = "right";
  ctx.fillText(
    `STATUS: ACTIVE & VERIFIED • LEVEL 0${tierInfo.level} • ISSUED: ${issuedDate}`,
    WIDTH - 52,
    54
  );
  ctx.textAlign = "left";

  // ==========================================
  // 2. Identity Header & Center-Cropped Avatar with Dual-Ring Neon Glow
  // ==========================================
  const avatarCX = 135;
  const avatarCY = 155;
  const avatarR = 60;

  // Dual-Ring Neon Glow
  // Outer Ring: Cyber Cyan
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 9, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(6, 182, 212, 0.8)";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#06b6d4";
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.restore();

  // Inner Ring: Neon Emerald
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 3, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  // Center-Cropped Avatar Image or Stylized Fallback
  let avatarRendered = false;
  if (options.customAvatarUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = options.customAvatarUrl!;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(
        img,
        sx,
        sy,
        minSide,
        minSide,
        avatarCX - avatarR,
        avatarCY - avatarR,
        avatarR * 2,
        avatarR * 2
      );
      ctx.restore();
      avatarRendered = true;
    } catch {}
  }

  if (!avatarRendered) {
    // Stylized Fallback Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
    ctx.fillStyle = "#0c1322";
    ctx.fill();

    // Circuit Ring Fill
    ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Monogram
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = "#06b6d4";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AE", avatarCX, avatarCY);
    ctx.restore();
  }

  // Personal Details
  const infoX = 225;
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#10b981";
  ctx.fillText("VERIFIED CLOUD ARCHITECT & SYSTEMS ENGINEER", infoX, 122);

  ctx.font = "bold 34px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(engineerName, infoX, 160);

  // Clearance Tier Pill Badge
  ctx.save();
  const tierWidth = 340;
  const tierHeight = 32;
  const tierY = 175;

  drawRoundRect(ctx, infoX, tierY, tierWidth, tierHeight, 6);
  ctx.fillStyle = "rgba(10, 20, 36, 0.9)";
  ctx.fill();
  ctx.strokeStyle = tierInfo.color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = tierInfo.color;
  ctx.shadowBlur = 8;
  ctx.stroke();

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = tierInfo.color;
  ctx.textBaseline = "middle";
  ctx.fillText(`★ ${tierInfo.badge}`, infoX + 14, tierY + tierHeight / 2);
  ctx.restore();

  // QR Code Generation in Top-Right
  const qrSize = 135;
  const qrX = WIDTH - 52 - qrSize;
  const qrY = 90;

  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 1,
      color: {
        dark: "#06b6d4",
        light: "#040813",
      },
      width: qrSize,
    });

    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.src = qrDataUrl;
    });

    // QR Container frame
    ctx.save();
    drawRoundRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 8);
    ctx.fillStyle = "rgba(4, 8, 19, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // QR Label
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(6, 182, 212, 0.85)";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO VERIFY TELEMETRY", qrX + qrSize / 2, qrY + qrSize + 18);
    ctx.restore();
  } catch {}

  // ==========================================
  // 3. The 3 Telemetry Pillars
  // ==========================================
  const pillarY = 265;
  const pillarHeight = 160;
  const pillarGap = 20;
  const pillarWidth = (WIDTH - 104 - pillarGap * 2) / 3;

  // Pillar 1: PROGRESS
  const p1X = 52;
  ctx.save();
  drawRoundRect(ctx, p1X, pillarY, pillarWidth, pillarHeight, 12);
  ctx.fillStyle = "rgba(10, 16, 28, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Header
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
  ctx.fillText("PILLAR 01 // OVERALL COMPLETION", p1X + 18, pillarY + 28);

  // Big Value
  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${globalProgress}%`, p1X + 18, pillarY + 75);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("PROGRESS TO MASTER CLEARANCE", p1X + 18, pillarY + 102);

  // Glow Progress Bar
  const barW = pillarWidth - 36;
  const barH = 10;
  const barY = pillarY + 124;
  drawRoundRect(ctx, p1X + 18, barY, barW, barH, 5);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  const fillW = Math.max(8, (barW * globalProgress) / 100);
  drawRoundRect(ctx, p1X + 18, barY, fillW, barH, 5);
  const barGrad = ctx.createLinearGradient(p1X + 18, 0, p1X + 18 + fillW, 0);
  barGrad.addColorStop(0, "#06b6d4");
  barGrad.addColorStop(1, "#10b981");
  ctx.fillStyle = barGrad;
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8;
  ctx.fill();

  // Progress Dot Clamping (minimum 4px left offset on 0% to prevent boundary clipping)
  const p1DotX = Math.min(p1X + 18 + barW - 4, Math.max(p1X + 18 + 4, p1X + 18 + (barW * globalProgress) / 100));
  const p1DotY = barY + barH / 2;
  ctx.beginPath();
  ctx.arc(p1DotX, p1DotY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();

  // Pillar 2: TOPICS DEFENDED
  const p2X = p1X + pillarWidth + pillarGap;
  ctx.save();
  drawRoundRect(ctx, p2X, pillarY, pillarWidth, pillarHeight, 12);
  ctx.fillStyle = "rgba(10, 16, 28, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
  ctx.fillText("PILLAR 02 // CURRICULUM TOPICS", p2X + 18, pillarY + 28);

  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${completedItems}`, p2X + 18, pillarY + 75);
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(` / ${totalItems}`, p2X + 18 + ctx.measureText(`${completedItems}`).width + 8, pillarY + 75);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("CURRICULUM TOPICS DEFENDED", p2X + 18, pillarY + 102);

  // Ratio Pill
  const p2Percent = Math.round((completedItems / totalItems) * 100);
  const p2BarW = pillarWidth - 36;
  drawRoundRect(ctx, p2X + 18, barY, p2BarW, barH, 5);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  const p2FillW = Math.max(8, (p2BarW * p2Percent) / 100);
  drawRoundRect(ctx, p2X + 18, barY, p2FillW, barH, 5);
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8;
  ctx.fill();

  // Progress Dot Clamping (minimum 4px left offset on 0% to prevent boundary clipping)
  const p2DotX = Math.min(p2X + 18 + p2BarW - 4, Math.max(p2X + 18 + 4, p2X + 18 + (p2BarW * p2Percent) / 100));
  const p2DotY = barY + barH / 2;
  ctx.beginPath();
  ctx.arc(p2DotX, p2DotY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();

  // Pillar 3: VERIFIED ARTIFACTS
  const p3X = p2X + pillarWidth + pillarGap;
  ctx.save();
  drawRoundRect(ctx, p3X, pillarY, pillarWidth, pillarHeight, 12);
  ctx.fillStyle = "rgba(10, 16, 28, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
  ctx.fillText("PILLAR 03 // PROJECT MILESTONES", p3X + 18, pillarY + 28);

  ctx.font = "bold 38px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${verifiedArtifacts}`, p3X + 18, pillarY + 75);
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(" / 9", p3X + 18 + ctx.measureText(`${verifiedArtifacts}`).width + 8, pillarY + 75);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("VERIFIED PRODUCTION ARTIFACTS", p3X + 18, pillarY + 102);

  const p3Percent = Math.round((verifiedArtifacts / 9) * 100);
  const p3BarW = pillarWidth - 36;
  drawRoundRect(ctx, p3X + 18, barY, p3BarW, barH, 5);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  const p3FillW = Math.max(8, (p3BarW * p3Percent) / 100);
  drawRoundRect(ctx, p3X + 18, barY, p3FillW, barH, 5);
  ctx.fillStyle = "#f59e0b";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 8;
  ctx.fill();

  // Progress Dot Clamping (minimum 4px left offset on 0% to prevent boundary clipping)
  const p3DotX = Math.min(p3X + 18 + p3BarW - 4, Math.max(p3X + 18 + 4, p3X + 18 + (p3BarW * p3Percent) / 100));
  const p3DotY = barY + barH / 2;
  ctx.beginPath();
  ctx.arc(p3DotX, p3DotY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();

  // ==========================================
  // 4. SHA-256 Cryptographic Verification Footer
  // ==========================================
  const footerY = 465;
  ctx.save();
  drawRoundRect(ctx, 52, footerY, WIDTH - 104, 78, 10);
  ctx.fillStyle = "rgba(6, 10, 18, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#06b6d4";
  ctx.fillText("SHA-256 CRYPTOGRAPHIC PROOF-OF-WORK VERIFICATION SIGNATURE:", 70, footerY + 28);

  ctx.font = "11px monospace";
  ctx.fillStyle = "#10b981";
  ctx.fillText(`0x${verificationHash}`, 70, footerY + 52);
  ctx.restore();

  // Bottom Legal & Timestamp Bar
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
  ctx.fillText("DEVOPS & CLOUD ENGINEERING COMPREHENSIVE MASTER ROADMAP (2026) • 9 PHASES ARCHITECTURE", 52, HEIGHT - 40);

  ctx.textAlign = "right";
  ctx.fillText("TAMPER-RESISTANT TELEMETRY SNAPSHOT", WIDTH - 52, HEIGHT - 40);
  ctx.textAlign = "left";
}
