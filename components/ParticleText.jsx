"use client";
import React, { useRef, useEffect } from "react";

export default function ParticleText({ text }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];
    let animationFrameId = null;
    let isVisible = true;
    let disposed = false;

    const mouse = {
      x: null,
      y: null,
      radius: 110,
      radiusSq: 110 * 110,
    };

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const init = () => {
      if (disposed) return;
      setCanvasSize();
      particles = [];
      if (!canvas.width || !canvas.height) return;

      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const octx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      const lines = text.split("\n");
      const baseFontSize = Math.min(canvas.width / 5.5, 240);
      const computedFont = getComputedStyle(document.body).fontFamily || '"Outfit", sans-serif';
      octx.font = `900 ${baseFontSize}px ${computedFont}`;
      octx.fillStyle = "white";
      octx.textAlign = "center";
      octx.textBaseline = "middle";

      const lineHeight = baseFontSize * 0.9;
      const totalHeight = lines.length * lineHeight;
      const startY =
        (canvas.height - totalHeight) / 2 + lineHeight / 2 - baseFontSize * 0.4;

      lines.forEach((line, i) => {
        octx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });

      const data = octx.getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(Math.floor(canvas.width / 150), 6);

      for (let y = 0; y < canvas.height; y += step) {
        const rowOffset = y * canvas.width;
        for (let x = 0; x < canvas.width; x += step) {
          if (data[(rowOffset + x) * 4 + 3] > 128) {
            particles.push({
              x: x + (Math.random() - 0.5) * 4,
              y: y + (Math.random() - 0.5) * 4,
              baseX: x,
              baseY: y,
              size: Math.random() * 2.6 + 1.5,
              isRed: Math.random() > 0.92,
              density: Math.random() * 24 + 8,
            });
          }
        }
      }
    };

    const animate = () => {
      if (disposed || !isVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hasMouse = mouse.x !== null && mouse.y !== null;
      const mx = mouse.x ?? 0;
      const my = mouse.y ?? 0;
      const maxDist = mouse.radius;
      const maxDistSq = mouse.radiusSq;

      // Update physics in a single fast pass (no Math.sqrt unless inside mouse radius)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (hasMouse) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0.01 && distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const force = ((maxDist - dist) / maxDist) * p.density;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
            continue;
          }
        }
        const dxBase = p.x - p.baseX;
        const dyBase = p.y - p.baseY;
        if (Math.abs(dxBase) > 0.1) p.x -= dxBase * 0.28;
        else p.x = p.baseX;
        if (Math.abs(dyBase) > 0.1) p.y -= dyBase * 0.28;
        else p.y = p.baseY;
      }

      // Batch draw white particles in one path
      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.isRed) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      // Batch draw red accent particles in one path
      ctx.fillStyle = "#E63946";
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.isRed) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (!animationFrameId && isVisible && !disposed) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave);

    // Paint immediately without waiting for network font load
    init();
    startLoop();
    document.fonts?.ready.then(() => {
      if (!disposed) init();
    });

    const visObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
      },
      { threshold: 0.01 },
    );
    visObserver.observe(canvas);

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!disposed) init();
      }, 180);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      visObserver.disconnect();
      clearTimeout(resizeTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
