"use client";

import React, { useEffect, useRef } from "react";

export const CyberCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse parallax tracking with smoothing
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Particles system
    const particleCount = 85;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4 - 0.15,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Grid animation offset
    let gridOffset = 0;

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep dark space background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        50,
        width / 2,
        height * 0.4,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "rgba(11, 25, 44, 0.4)");
      bgGrad.addColorStop(1, "rgba(3, 7, 18, 0.95)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Starlight Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Twinkle effect
        p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
        const clampedOpacity = Math.max(0.1, Math.min(0.8, p.opacity));

        // Parallax offset based on mouse
        const parallaxX = (mouse.x - width / 2) * (p.size * 0.015);
        const parallaxY = (mouse.y - height / 2) * (p.size * 0.015);

        ctx.beginPath();
        ctx.arc(p.x + parallaxX, p.y + parallaxY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${clampedOpacity})`;
        ctx.shadowBlur = p.size > 1.2 ? 6 : 0;
        ctx.shadowColor = "#00f0ff";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render 3D-Perspective Cyber Horizon Grid
      const horizonY = height * 0.68;
      const perspectiveOriginX = width / 2 + (mouse.x - width / 2) * 0.08;
      const perspectiveOriginY = horizonY - 40;

      gridOffset = (gridOffset + 0.6) % 36;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizonY, width, height - horizonY);
      ctx.clip();

      // Horizontal scanning perspective lines
      const lineCount = 14;
      for (let i = 0; i <= lineCount; i++) {
        const rawProgress = (i * 36 + gridOffset) / (lineCount * 36);
        const curvedProgress = Math.pow(rawProgress, 2.2);
        const y = horizonY + curvedProgress * (height - horizonY);
        const alpha = Math.min(1, curvedProgress * 1.5) * 0.22;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.lineWidth = 1 + curvedProgress * 1.5;
        ctx.stroke();
      }

      // Fan perspective vertical grid lines
      const verticalRays = 26;
      for (let i = -verticalRays / 2; i <= verticalRays / 2; i++) {
        const bottomX = perspectiveOriginX + i * (width / 12);
        ctx.beginPath();
        ctx.moveTo(perspectiveOriginX, perspectiveOriginY);
        ctx.lineTo(bottomX, height);

        const distFromCenter = Math.abs(i) / (verticalRays / 2);
        const rayAlpha = Math.max(0.04, 0.2 - distFromCenter * 0.14);

        ctx.strokeStyle = `rgba(0, 240, 255, ${rayAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
