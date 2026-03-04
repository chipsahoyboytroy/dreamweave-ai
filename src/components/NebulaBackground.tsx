"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Nebula Background (animated cosmic bg)
// ═══════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

export default function NebulaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.8 + 0.2,
    }));

    const animate = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nebula gradients
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Purple nebula
      const g1 = ctx.createRadialGradient(
        cx + Math.sin(time) * 100,
        cy + Math.cos(time * 0.7) * 80,
        0,
        cx,
        cy,
        canvas.width * 0.6
      );
      g1.addColorStop(0, "rgba(124, 58, 237, 0.08)");
      g1.addColorStop(0.5, "rgba(88, 28, 135, 0.04)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue nebula
      const g2 = ctx.createRadialGradient(
        cx + Math.cos(time * 0.6) * 150,
        cy + Math.sin(time * 0.8) * 100,
        0,
        cx,
        cy,
        canvas.width * 0.5
      );
      g2.addColorStop(0, "rgba(59, 130, 246, 0.06)");
      g2.addColorStop(0.5, "rgba(30, 64, 175, 0.03)");
      g2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.speed * 10 + star.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
