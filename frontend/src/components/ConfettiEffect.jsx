import React, { useEffect, useRef } from "react";

/**
 * Plays a pleasant, harmonious ascending success chime via Web Audio API.
 * No external audio files or downloads needed.
 */
export function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.35, gain: 0.14 }, // C5
      { freq: 659.25, time: 0.09, duration: 0.35, gain: 0.16 }, // E5
      { freq: 783.99, time: 0.18, duration: 0.40, gain: 0.18 }, // G5
      { freq: 1046.5, time: 0.28, duration: 0.70, gain: 0.22 }, // C6
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gainNode.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + time + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (e) {
    // Gracefully ignore if browser policies restrict auto-audio
  }
}

/**
 * Lightweight HTML5 Canvas particle confetti system.
 * Fires a dual-cannon celebration burst from left and right corners.
 */
export default function ConfettiEffect({ duration = 4000, trigger = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = [
      "#4f46e5", // Indigo
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#f43f5e", // Rose
      "#fbbf24", // Gold
      "#38bdf8", // Sky
    ];

    const particles = [];
    const count = 150;

    // Dual cannons: Left burst (20% x) and Right burst (80% x)
    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const angle = isLeft
        ? (Math.random() * 50 + 25) * (Math.PI / 180) // 25 to 75 deg towards right
        : (Math.random() * 50 + 105) * (Math.PI / 180); // 105 to 155 deg towards left
      const speed = Math.random() * 14 + 10;

      particles.push({
        x: isLeft ? width * 0.15 : width * 0.85,
        y: height * 0.75,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        gravity: 0.38,
        friction: 0.985,
        size: Math.random() * 9 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.12 + 0.05,
        opacity: 1,
        isRibbon: Math.random() > 0.45,
      });
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      particles.forEach((p) => {
        p.vx *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        ctx.save();
        ctx.translate(p.x + Math.sin(p.wobble) * 6, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.isRibbon) {
          ctx.fillRect(-p.size / 2, -p.size / 5, p.size, p.size / 2.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (elapsed < duration) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [duration, trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ willChange: "transform" }}
    />
  );
}
