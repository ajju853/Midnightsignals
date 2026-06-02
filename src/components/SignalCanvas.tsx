import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FloatingSignal, VibeType } from "../types";

interface SignalCanvasProps {
  vibe: VibeType;
  currentTime: number;
  pulseTrigger: { freq: number; type: string; id: number } | null;
  floatingSignals: FloatingSignal[];
  addLocalSignal: (text: string, vibe: VibeType) => void;
  activeBpm?: number;
  isPlaying?: boolean;
  rainVolume?: number;
  isBirdsActive?: boolean;
}

export default function SignalCanvas({
  vibe,
  currentTime,
  pulseTrigger,
  floatingSignals,
  addLocalSignal,
  activeBpm = 80,
  isPlaying = false,
  rainVolume = 0.0,
  isBirdsActive = false
}: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [focusedSignal, setFocusedSignal] = useState<FloatingSignal | null>(null);
  const [hoveredSignalId, setHoveredSignalId] = useState<string | null>(null);

  // Sleep Timer Sync state via Ref for buttery animation loops
  const timerSecondsRef = useRef<{ remaining: number; total: number | null }>({ remaining: 0, total: null });

  // Nature visual vectors (translucent pulses and bird traces)
  const natureRingsRef = useRef<{ x: number; y: number; r: number; maxR: number; alpha: number; color: string; icon: string }[]>([]);
  const flyingBirdsRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    size: number;
    speed: number;
    symbol: string;
    trail: { x: number; y: number; age: number }[];
  }[]>([]);

  // States and refs for drift orbit control & star shower effects
  const [isDriftActive, setIsDriftActive] = useState(true);
  const [isStarShowerActive, setIsStarShowerActive] = useState(false);

  const isDriftActiveRef = useRef(isDriftActive);
  const isStarShowerActiveRef = useRef(isStarShowerActive);

  // Switching visualization styles: gravity, bars, circle, or particles
  const [visualStyle, setVisualStyle] = useState<"gravity" | "bars" | "circle" | "particles">("gravity");
  const visualStyleRef = useRef(visualStyle);

  // Transition weights/opacities for each visualizer style
  const styleAlphasRef = useRef<{
    gravity: number;
    bars: number;
    circle: number;
    particles: number;
  }>({
    gravity: 1,
    bars: 0,
    circle: 0,
    particles: 0
  });

  const [lastChangedStyle, setLastChangedStyle] = useState<string | null>(null);

  useEffect(() => {
    visualStyleRef.current = visualStyle;
  }, [visualStyle]);

  const changeStyleWithNotice = (newStyle: "gravity" | "bars" | "circle" | "particles") => {
    setVisualStyle(newStyle);
    setLastChangedStyle(newStyle);
  };

  // Auto clean-up notice banner timer
  useEffect(() => {
    if (!lastChangedStyle) return;
    const t = setTimeout(() => setLastChangedStyle(null), 1500);
    return () => clearTimeout(t);
  }, [lastChangedStyle]);

  const handleCycleVisualStyle = () => {
    const order: ("gravity" | "bars" | "circle" | "particles")[] = ["gravity", "bars", "circle", "particles"];
    const currIdx = order.indexOf(visualStyle);
    const nextIdx = (currIdx + 1) % order.length;
    changeStyleWithNotice(order[nextIdx]);
  };

  // Flow particles for the custom Flow Particles style
  const flowParticlesRef = useRef<{ x: number; y: number; size: number; speed: number; angle: number; color: string }[]>([]);

  useEffect(() => {
    const particles = [];
    const colors = ["#818cf8", "#a78bfa", "#f472b6", "#34d399", "#60a5fa"];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 600,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.8 + 0.25,
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    flowParticlesRef.current = particles;
  }, []);

  // Set up event listeners for NatureSoundboard sync triggers
  useEffect(() => {
    const handleTimerUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        timerSecondsRef.current = {
          remaining: customEvent.detail.remaining,
          total: customEvent.detail.total
        };
      }
    };

    const handleNatureSound = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, name, icon, description, intensity } = customEvent.detail;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Register translucent 'nature ring' pulse triggered by soundboard
      let ringColor = "rgba(56, 189, 248, 0.45)"; // birds: sky blue
      if (type === "owl") {
        ringColor = "rgba(192, 132, 252, 0.5)"; // owl: deep purple
      } else if (type === "cricket") {
        ringColor = "rgba(251, 191, 36, 0.4)"; // cricket: amber gold
      }

      natureRingsRef.current.push({
        x: Math.random() * canvas.width * 0.7 + canvas.width * 0.15,
        y: Math.random() * canvas.height * 0.5 + canvas.height * 0.18,
        r: 8,
        maxR: 110 + intensity * 90,
        alpha: 0.95,
        color: ringColor,
        icon: icon || "🍃"
      });

      // Cap size to avoid lag
      if (natureRingsRef.current.length > 15) {
        natureRingsRef.current.shift();
      }

      // If it is a bird voice, spawn flying birds that leave a magical flight trail
      if (type === "bird") {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let b = 0; b < count; b++) {
          const startY = Math.random() * (canvas.height - 180) + 60;
          flyingBirdsRef.current.push({
            x: -40,
            y: startY,
            targetX: canvas.width + 60,
            targetY: startY + (Math.random() * 70 - 35),
            size: Math.random() * 8 + 14,
            speed: Math.random() * 1.5 + 2.2,
            symbol: icon || "🐦",
            trail: []
          });
        }
      }
    };

    window.addEventListener("nature-timer-update", handleTimerUpdate);
    window.addEventListener("nature-sound-trigger", handleNatureSound);

    return () => {
      window.removeEventListener("nature-timer-update", handleTimerUpdate);
      window.removeEventListener("nature-sound-trigger", handleNatureSound);
    };
  }, []);

  useEffect(() => {
    isDriftActiveRef.current = isDriftActive;
  }, [isDriftActive]);

  useEffect(() => {
    isStarShowerActiveRef.current = isStarShowerActive;
  }, [isStarShowerActive]);

  // Continuous bird silhouette spawns when active in NatureSoundboard
  useEffect(() => {
    if (!isBirdsActive) return;

    const spawnBird = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const startY = Math.random() * (canvas.height - 100) + 30;
      flyingBirdsRef.current.push({
        x: -40,
        y: startY,
        targetX: canvas.width + 60,
        targetY: startY + (Math.random() * 60 - 30),
        size: Math.random() * 6 + 12,
        speed: Math.random() * 1.0 + 1.5,
        symbol: "silhouette",
        trail: []
      });
      if (flyingBirdsRef.current.length > 20) {
        flyingBirdsRef.current.shift();
      }
    };

    spawnBird();
    const interval = setInterval(spawnBird, 4500);

    return () => clearInterval(interval);
  }, [isBirdsActive]);

  const starShowerParticlesRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    color: string;
  }[]>([]);

  const starShowerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Background visual elements
  const starsRef = useRef<{ x: number; y: number; r: number; speed: number; phase: number }[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; r: number; maxR: number; alpha: number; color: string }[]>([]);

  // Generate initial starry backdrop
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * 1200,
        y: Math.random() * 600,
        r: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
    starsRef.current = stars;
  }, []);

  // Handle note trigger events for visual reactive pulses
  useEffect(() => {
    if (!pulseTrigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Choose dynamic glowing wave color based on note trigger type
    let color = "rgba(110, 231, 183, 0.5)"; // green-emerald for helper notes
    if (pulseTrigger.type === "kick") {
      color = vibe === "neon" ? "rgba(244, 63, 94, 0.4)" : "rgba(139, 92, 246, 0.4)"; // purple/pink
    } else if (pulseTrigger.type === "snare") {
      color = vibe === "melancholy" ? "rgba(239, 68, 68, 0.35)" : "rgba(59, 130, 246, 0.35)"; // soft red/blue
    } else if (pulseTrigger.type === "melody") {
      color = "rgba(253, 224, 71, 0.6)"; // sparkling bright yellow
    }

    // Insert ripple at target node
    ripplesRef.current.push({
      x: Math.random() * canvas.width * 0.6 + canvas.width * 0.2,
      y: Math.random() * canvas.height * 0.6 + canvas.height * 0.2,
      r: 10,
      maxR: pulseTrigger.type === "kick" ? 180 : 100,
      alpha: 1.0,
      color
    });

    // Max cap on active ripples to keep render lightweight
    if (ripplesRef.current.length > 20) {
      ripplesRef.current.shift();
    }
  }, [pulseTrigger, vibe]);

  // Handle resizing observer smoothly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight || 400;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const currentTimeRef = useRef(currentTime);
  const activeBpmRef = useRef(activeBpm);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    activeBpmRef.current = activeBpm;
  }, [activeBpm]);

  // Primary animation loop inside RequestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Shift base background color subtly based on BPM/tempo and song progression
      // OR interpolate to sunrise orange if Nature Soundboard sleep timer is active.
      const bpmValue = activeBpmRef.current;
      const progressValue = currentTimeRef.current;
      
      const progressHueShift = (progressValue * 4) % 360; 
      const beatIntervalMs = (60 / bpmValue) * 1000;
      const currentBeatPhase = (Date.now() % beatIntervalMs) / beatIntervalMs;
      const beatAmplitude = Math.sin(currentBeatPhase * Math.PI) * 0.5 + 0.5;
      
      const baseHue = (240 + progressHueShift) % 360;
      const baseSaturation = 7 + (beatAmplitude * 3);
      const baseLightness = 3.5 + (beatAmplitude * 1.5);

      // Calculate fraction for sleep timer sunrise-orange to dark-indigo shift
      const timerTotal = timerSecondsRef.current.total;
      const timerRemaining = timerSecondsRef.current.remaining;
      const fraction = timerTotal && timerTotal > 0 ? Math.min(1, Math.max(0, timerRemaining / timerTotal)) : 0;
      
      // Interpolate from sunrise orange HSL (21, 82%, 14%) to dark indigo (baseHue, baseSaturation, baseLightness)
      const h = baseHue * (1 - fraction) + 21 * fraction;
      const s = baseSaturation * (1 - fraction) + 82 * fraction;
      const l = baseLightness * (1 - fraction) + 14 * fraction;

      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle atmospheric dark fog overlay (glowing radar look in neon setup)
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7
      );
      if (vibe === "melancholy") {
        grad.addColorStop(0, "rgba(29, 78, 216, 0.1)");
      } else if (vibe === "hopeful") {
        grad.addColorStop(0, "rgba(4, 120, 87, 0.1)");
      } else if (vibe === "neon") {
        grad.addColorStop(0, "rgba(190, 24, 74, 0.12)");
      } else {
        grad.addColorStop(0, "rgba(109, 40, 217, 0.08)");
      }
      grad.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starry ambient sky
      const stars = starsRef.current;
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      stars.forEach((s) => {
        // Shimmering intensity over timeline
        s.phase += s.speed;
        const shimmer = Math.sin(s.phase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.r > 1.2 ? shimmer * 0.9 : shimmer * 0.5})`;
        ctx.beginPath();
        // Constrain stars appropriately within screen limits
        ctx.arc(s.x % canvas.width, s.y % canvas.height, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw star shower shooting star particles
      if (isStarShowerActiveRef.current) {
        const showerParticles = starShowerParticlesRef.current;
        showerParticles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Draw the trail line of the shooting star
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
          ctx.stroke();

          // Sparkle halo at the tip
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Update and Draw audio visual trigger ripples
      const ripples = ripplesRef.current;
      ripples.forEach((rip, rIdx) => {
        rip.r += (rip.maxR - rip.r) * 0.07;
        rip.alpha -= 0.012;
        if (rip.alpha <= 0) {
          ripples.splice(rIdx, 1);
          return;
        }

        ctx.strokeStyle = rip.color.replace("0.5", String(rip.alpha)).replace("0.4", String(rip.alpha)).replace("0.35", String(rip.alpha));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing pulse
        ctx.fillStyle = rip.color.replace("0.5", String(rip.alpha * 0.15)).replace("0.4", String(rip.alpha * 0.12)).replace("0.35", String(rip.alpha * 0.1));
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw Nature Rings (Translucent ring pulse with floating icon emojis)
      const natureRings = natureRingsRef.current;
      natureRings.forEach((ring, index) => {
        ring.r += (ring.maxR - ring.r) * 0.06;
        ring.alpha -= 0.01;
        if (ring.alpha <= 0) {
          natureRings.splice(index, 1);
          return;
        }

        ctx.strokeStyle = ring.color.replace("0.45", String(ring.alpha)).replace("0.5", String(ring.alpha)).replace("0.4", String(ring.alpha));
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = ring.color.replace("0.45", String(ring.alpha * 0.15)).replace("0.5", String(ring.alpha * 0.15)).replace("0.4", String(ring.alpha * 0.12));
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Floating icon emoji rising inside the ring
        ctx.fillStyle = `rgba(255, 255, 255, ${ring.alpha * 1.2})`;
        ctx.font = '16px sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(ring.icon, ring.x, ring.y - (ring.r * 0.25));
      });

      // Update and Draw Flying Birds with Flight Trails
      const flyingBirds = flyingBirdsRef.current;
      flyingBirds.forEach((bird, bIndex) => {
        // Appends current position to flight trail
        bird.trail.push({ x: bird.x, y: bird.y, age: 1.0 });

        // Draw bird's flight trail
        bird.trail.forEach((t, tIdx) => {
          t.age -= 0.024; // Trail fade rate
          if (t.age <= 0) {
            bird.trail.splice(tIdx, 1);
            return;
          }
          ctx.beginPath();
          ctx.arc(t.x, t.y, (bird.size * 0.25) * t.age, 0, Math.PI * 2);
          const trailColor = vibe === "neon" ? `rgba(244, 63, 94, ${t.age * 0.2})` : `rgba(56, 189, 248, ${t.age * 0.22})`;
          ctx.fillStyle = trailColor;
          ctx.fill();
        });

        // Advance bird forward across screen coordinates
        const stepAngle = Math.atan2(bird.targetY - bird.y, bird.targetX - bird.x);
        bird.x += Math.cos(stepAngle) * bird.speed;
        bird.y += Math.sin(stepAngle) * bird.speed;

        // Render bird symbol or silhouette
        if (bird.symbol === "silhouette") {
          // Bird vector silhouette: draw a continuous smooth wing flapper
          const flap = Math.sin((Date.now() / 150) * bird.speed) * 0.7 + 0.1;
          ctx.strokeStyle = vibe === "neon" ? "rgba(244, 63, 94, 0.65)" : "rgba(56, 189, 248, 0.7)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(bird.x - bird.size, bird.y);
          ctx.quadraticCurveTo(bird.x - bird.size * 0.5, bird.y - bird.size * 0.5 * flap, bird.x, bird.y + bird.size * 0.15);
          ctx.quadraticCurveTo(bird.x + bird.size * 0.5, bird.y - bird.size * 0.5 * flap, bird.x + bird.size, bird.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.font = `${bird.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(bird.symbol, bird.x, bird.y);
        }

        // Remove bird if it flies off-screen
        if (bird.x > canvas.width + 50) {
          flyingBirds.splice(bIndex, 1);
        }
      });

      // Draw faint grid overlay looking like "Signals Coordinates"
      ctx.strokeStyle = "rgba(63, 63, 70, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Get the active visualizer style
      const activeStyle = visualStyleRef.current;

      // Interpolate weights/alphas for each visualizer style towards their target (1 if active, 0 otherwise)
      const styleKeys: ("gravity" | "bars" | "circle" | "particles")[] = ["gravity", "bars", "circle", "particles"];
      styleKeys.forEach((key) => {
        const target = key === activeStyle ? 1 : 0;
        styleAlphasRef.current[key] += (target - styleAlphasRef.current[key]) * 0.082; // smooth 8.2% frame step
        if (Math.abs(styleAlphasRef.current[key] - target) < 0.001) {
          styleAlphasRef.current[key] = target;
        }
      });

      // STYLE 1: Constellation Links for Gravity Style
      const gravityAlpha = styleAlphasRef.current.gravity;
      if (gravityAlpha > 0.001) {
        ctx.strokeStyle = vibe === "neon" 
          ? `rgba(244, 63, 94, ${0.08 * gravityAlpha})` 
          : `rgba(129, 140, 248, ${0.08 * gravityAlpha})`;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < floatingSignals.length; i++) {
          for (let j = i + 1; j < floatingSignals.length; j++) {
            const s1 = floatingSignals[i];
            const s2 = floatingSignals[j];
            const d = Math.hypot(s1.x - s2.x, s1.y - s2.y);
            if (d < 150) {
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.stroke();
            }
          }
        }
      }

      // STYLE 2: Beautiful Frequency equalizer spectrum bars
      const barsAlpha = styleAlphasRef.current.bars;
      if (barsAlpha > 0.001) {
        const barCount = 44;
        const spacing = 3;
        const totalGap = (barCount - 1) * spacing;
        const barWidth = (canvas.width - totalGap) / barCount;
        
        ctx.save();
        for (let i = 0; i < barCount; i++) {
          const freqOffset = i / barCount;
          const sineNumerator = (Date.now() * 0.003) + freqOffset * Math.PI * 3.5;
          const sineVal = Math.sin(sineNumerator);
          const rawHeight = (sineVal * 0.45 + 0.55) * (canvas.height * 0.45) + (beatAmplitude * 32);
          const noiseJitter = Math.sin((Date.now() * 0.013) + i) * 5;
          const barHeight = Math.max(8, rawHeight + noiseJitter);

          const bx = i * (barWidth + spacing);
          const by = canvas.height - barHeight;

          const barGrad = ctx.createLinearGradient(bx, by, bx, canvas.height);
          if (vibe === "melancholy") {
            barGrad.addColorStop(0, `rgba(59, 130, 246, ${0.72 * barsAlpha})`);
            barGrad.addColorStop(1, `rgba(29, 78, 216, ${0.05 * barsAlpha})`);
          } else if (vibe === "hopeful") {
            barGrad.addColorStop(0, `rgba(16, 185, 129, ${0.72 * barsAlpha})`);
            barGrad.addColorStop(1, `rgba(4, 120, 87, ${0.05 * barsAlpha})`);
          } else if (vibe === "neon") {
            barGrad.addColorStop(0, `rgba(244, 63, 94, ${0.72 * barsAlpha})`);
            barGrad.addColorStop(1, `rgba(190, 24, 74, ${0.05 * barsAlpha})`);
          } else {
            barGrad.addColorStop(0, `rgba(168, 85, 247, ${0.72 * barsAlpha})`);
            barGrad.addColorStop(1, `rgba(109, 40, 217, ${0.05 * barsAlpha})`);
          }

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(bx, by, barWidth, barHeight, [4, 4, 0, 0]);
          } else {
            ctx.rect(bx, by, barWidth, barHeight);
          }
          ctx.fill();

          // Capsule crown element
          if (i % 2 === 0 && barHeight > 25) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * barsAlpha})`;
            ctx.beginPath();
            ctx.arc(bx + barWidth/2, by + 1, Math.min(2.5, barWidth/2), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // STYLE 3: Pulsating circular waves
      const circleAlpha = styleAlphasRef.current.circle;
      if (circleAlpha > 0.001) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.save();
        
        for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
          const baseRadius = 35 + ringIdx * 48 + (beatAmplitude * 16);
          const alpha = (0.5 - (ringIdx * 0.12)) * circleAlpha;
          
          ctx.beginPath();
          ctx.lineWidth = 1.6 - (ringIdx * 0.35);
          
          if (vibe === "melancholy") {
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.shadowColor = `rgba(59, 130, 246, ${0.4 * circleAlpha})`;
          } else if (vibe === "hopeful") {
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.shadowColor = `rgba(16, 185, 129, ${0.4 * circleAlpha})`;
          } else if (vibe === "neon") {
            ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.shadowColor = `rgba(244, 63, 94, ${0.4 * circleAlpha})`;
          } else {
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.shadowColor = `rgba(168, 85, 247, ${0.4 * circleAlpha})`;
          }
          ctx.shadowBlur = 8 * circleAlpha;

          const pointCount = 90;
          for (let pIdx = 0; pIdx <= pointCount; pIdx++) {
            const theta = (pIdx / pointCount) * Math.PI * 2;
            const timeOffset = Date.now() * 0.0018;
            const waveScale = 7 + (ringIdx * 3) + (beatAmplitude * 5);
            const waveFrequency = 4 + ringIdx;
            const r = baseRadius + Math.sin(theta * waveFrequency + timeOffset) * waveScale;
            
            const px = cx + Math.cos(theta) * r;
            const py = cy + Math.sin(theta) * r;
            
            if (pIdx === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
        }

        // Inner glowing core
        let coreColor = `rgba(168, 85, 247, ${0.2 * circleAlpha})`;
        if (vibe === "melancholy") coreColor = `rgba(59, 130, 246, ${0.2 * circleAlpha})`;
        else if (vibe === "hopeful") coreColor = `rgba(16, 185, 129, ${0.2 * circleAlpha})`;
        else if (vibe === "neon") coreColor = `rgba(244, 63, 94, ${0.2 * circleAlpha})`;
        
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + (beatAmplitude * 7), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // STYLE 4: Gracefully flowing stream of wind particles
      const particlesAlpha = styleAlphasRef.current.particles;
      if (particlesAlpha > 0.001) {
        const flowParticles = flowParticlesRef.current;
        ctx.save();
        
        flowParticles.forEach((p) => {
          p.x += p.speed * 1.6;
          p.y += Math.sin((Date.now() / 1200) + p.angle) * 0.45;

          if (p.x > canvas.width + 15) {
            p.x = -15;
            p.y = Math.random() * canvas.height;
          }

          let color = p.color;
          if (vibe === "melancholy") {
            color = `rgba(147, 197, 253, ${0.55 * particlesAlpha})`;
          } else if (vibe === "hopeful") {
            color = `rgba(110, 231, 183, ${0.55 * particlesAlpha})`;
          } else if (vibe === "neon") {
            color = `rgba(251, 113, 133, ${0.55 * particlesAlpha})`;
          } else {
            color = `rgba(196, 181, 253, ${0.55 * particlesAlpha})`;
          }

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = (beatAmplitude * 5 + 1) * particlesAlpha;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y % canvas.height, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        
        ctx.restore();
      }

      // Draw Floating user signals with interactive Hover pulse & animation
      floatingSignals.forEach((sig) => {
        // Check isHovered status
        const isHovered = hoveredSignalId === sig.id;
        const isShower = isStarShowerActiveRef.current;

        // Orbital suspension drift or linear bouncy drift
        if (isDriftActiveRef.current && !isHovered) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const dx = sig.x - centerX;
          const dy = sig.y - centerY;
          const dist = Math.hypot(dx, dy) || 1;
          const speed = (isShower ? 0.45 : 0.22) * sig.scale;
          
          // Tangent vectors
          const tx = -dy / dist;
          const ty = dx / dist;

          // Pull stabilizer back to original preferred orbit distance
          const targetDist = 135 * sig.scale;
          const pullFactor = 0.015;
          const rx = (centerX + (dx / dist) * targetDist - sig.x) * pullFactor;
          const ry = (centerY + (dy / dist) * targetDist - sig.y) * pullFactor;

          sig.x += tx * speed + rx;
          sig.y += ty * speed + ry;
        } else {
          // Standard linear bouncy drift
          sig.x += sig.vx;
          sig.y += sig.vy;
        }

        // Bounce boundaries
        if (sig.x < 50 || sig.x > canvas.width - 50) sig.vx *= -1;
        if (sig.y < 50 || sig.y > canvas.height - 50) sig.vy *= -1;

        // Draw pulsing star/orb at center
        const pulsation = isHovered
          ? Math.sin(Date.now() / 200 + parseFloat(sig.id)) * 0.4 + 1.2
          : isShower
            ? Math.sin(Date.now() / 150 + parseFloat(sig.id)) * 0.55 + 1.4
            : Math.sin(Date.now() / 600 + parseFloat(sig.id)) * 0.2 + 1.0;
        
        const opacity = (isHovered || isShower) ? 1.0 : 0.75;
        const colorBase = sig.color; // e.g., 'rgb(168, 85, 247)'

        ctx.shadowBlur = isHovered ? 25 : isShower ? 38 : 15;
        ctx.shadowColor = colorBase;

        ctx.fillStyle = colorBase.replace("rgb", "rgba").replace(")", `, ${opacity})`);
        ctx.beginPath();
        ctx.arc(sig.x, sig.y, (isHovered ? 6.5 : isShower ? 7.5 : 4) * sig.scale * pulsation, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0; // reset shadow

        // Soft visual range halo representation
        const haloOpacity = isHovered ? 0.28 : isShower ? 0.22 : 0.08;
        ctx.strokeStyle = colorBase.replace("rgb", "rgba").replace(")", `, ${haloOpacity})`);
        ctx.lineWidth = (isHovered || isShower) ? 2 : 1;
        ctx.beginPath();
        ctx.arc(sig.x, sig.y, (isHovered ? 38 : isShower ? 44 : 30) * sig.scale * pulsation, 0, Math.PI * 2);
        ctx.stroke();

        // Render message texts beautifully or shorthand label if too long
        const textLabel = sig.text.length > 25 ? sig.text.substring(0, 22) + "..." : sig.text;
        
        ctx.fillStyle = (isHovered || isShower) ? "rgba(255, 255, 255, 1.0)" : "rgba(228, 228, 231, 0.75)";
        ctx.font = (isHovered || isShower)
          ? 'bold 11px "JetBrains Mono", Courier, monospace'
          : '10px "JetBrains Mono", Courier, monospace';
        ctx.textAlign = "center";
        ctx.fillText(textLabel, sig.x, sig.y - 14);
      });

      // 4. Subtle Film Grain & Glitch simulation overlays
      // Film grain noise particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      const grainCount = 100;
      for (let i = 0; i < grainCount; i++) {
        const grainX = Math.random() * canvas.width;
        const grainY = Math.random() * canvas.height;
        ctx.fillRect(grainX, grainY, 1.2, 1.2);
      }

      // Glitch visual scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Randomized horizontal glitch strip offset
      if (Math.random() < 0.015) {
        ctx.fillStyle = vibe === "neon" ? "rgba(244, 63, 94, 0.12)" : "rgba(0, 209, 255, 0.12)";
        const sliceY = Math.random() * canvas.height;
        const sliceHeight = Math.random() * 6 + 2;
        ctx.fillRect(0, sliceY, canvas.width, sliceHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [vibe, floatingSignals, hoveredSignalId, visualStyle]);

  // Handle canvas click to select/focus a signal or trigger star shower animation
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Search closest floating signal
    let found: FloatingSignal | null = null;
    let minDist = 35; // select threshold in pixels

    floatingSignals.forEach((sig) => {
      const dist = Math.hypot(sig.x - clickX, sig.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        found = sig;
      }
    });

    if (found) {
      setFocusedSignal(found);
    } else {
      // Spawn custom colorful star shower animation on empty space click
      if (starShowerTimeoutRef.current) {
        clearTimeout(starShowerTimeoutRef.current);
      }

      setIsStarShowerActive(true);

      const particles = [];
      const showerColors = ["#00D1FF", "#a855f7", "#10b981", "#f43f5e", "#eab308", "#22d3ee", "#a78bfa"];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * -120 - 15,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 5 + 4.5,
          length: Math.random() * 20 + 15,
          color: showerColors[Math.floor(Math.random() * showerColors.length)]
        });
      }

      starShowerParticlesRef.current = particles;

      starShowerTimeoutRef.current = setTimeout(() => {
        setIsStarShowerActive(false);
      }, 1800);
    }
  };

  // Handle hover detection on canvas to animate floating nodes
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let foundId: string | null = null;
    let minDist = 30; // 30px selection hover radius

    floatingSignals.forEach((sig) => {
      const dist = Math.hypot(sig.x - mouseX, sig.y - mouseY);
      if (dist < minDist) {
        minDist = dist;
        foundId = sig.id;
      }
    });

    setHoveredSignalId(foundId);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredSignalId(null);
  };


  const handleSaveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Grab picture of current theme state + all floating signals + stars + background shift
    const link = document.createElement("a");
    link.download = `midnight-visualizer-${vibe}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-850 bg-zinc-950/70 shadow-2xl transition-all duration-500">
      
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        id="midnight-visualizer-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className={`w-full h-full block ${hoveredSignalId ? "cursor-pointer" : "cursor-crosshair"}`}
      />

      {/* CSS-Based Rain Overlay */}
      {rainVolume > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500" 
          style={{ opacity: Math.min(1.0, rainVolume * 1.5) }}
        >
          <style>{`
            @keyframes css-rain-fall {
              0% {
                transform: translateY(-50px) rotate(12deg);
                opacity: 0;
              }
              15% {
                opacity: 0.85;
              }
              85% {
                opacity: 0.85;
              }
              100% {
                transform: translateY(350px) rotate(12deg);
                opacity: 0;
              }
            }
            .animate-css-rain-drop {
              animation: css-rain-fall linear infinite;
            }
          `}</style>
          {Array.from({ length: 24 }).map((_, i) => {
            const delay = Math.random() * -12;
            const duration = 0.6 + Math.random() * 1.2;
            const left = Math.random() * 100;
            const height = 15 + Math.random() * 20;
            const speedMultiplier = 0.8 + (rainVolume * 0.6);
            return (
              <div
                key={i}
                className="absolute w-[1.2px] rounded-full animate-css-rain-drop"
                style={{
                  left: `${left}%`,
                  top: `-60px`,
                  height: `${height}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration / speedMultiplier}s`,
                  background: "linear-gradient(to bottom, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.45))",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Floating Instructions/Status overlay */}
      <div className="absolute top-4 left-4 pointer-events-none bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center space-x-2 animate-fadeIn">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span className="text-[11px] font-mono text-zinc-400 tracking-wider uppercase">
          Signal Sky Receiver: Active / {vibe.toUpperCase()} vibe
        </span>
      </div>

      {/* Dynamic top-right corner active signals counter HUD element + HUD controls */}
      <div className="absolute top-4 right-4 pointer-events-auto bg-zinc-950/90 border border-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 sm:gap-3 shadow-xl animate-fadeIn transition-all duration-350 select-none z-10">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Signals: {floatingSignals.length}
          </span>
        </div>

        <span className="h-3.5 w-[1px] bg-white/10" />

        {/* Visual Style Fast Cycle Toggle Button */}
        <button
          type="button"
          onClick={handleCycleVisualStyle}
          className="text-[9px] font-mono font-bold text-zinc-400 hover:text-white border border-white/5 hover:bg-white/5 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 hover:border-white/20 active:scale-95"
          title="Toggle or cycle through all available 2D canvas visualization layouts instantly"
        >
          🔄 Toggle Style
        </button>

        <span className="h-3.5 w-[1px] bg-white/10 hidden sm:inline" />

        {/* Drift Orbit / Linear Motion Toggle */}
        <button
          type="button"
          onClick={() => setIsDriftActive((prev) => !prev)}
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer hidden sm:inline ${
            isDriftActive
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-zinc-400 border border-white/5 hover:text-white"
          }`}
          title="Toggle between Linear movement vs center-orbit gravity Drift"
        >
          Drift: {isDriftActive ? "Orbit" : "Linear"}
        </button>

        <span className="h-3.5 w-[1px] bg-white/10" />

        {/* Save PNG Snapshot Camera Button */}
        <button
          type="button"
          onClick={handleSaveSnapshot}
          className="text-[9px] font-mono font-bold text-zinc-400 hover:text-white border border-white/5 hover:bg-white/5 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 hover:border-white/20 active:scale-95"
          title="Download high-quality static snapshot of current sky canvas aesthetics"
        >
          Camera 📸
        </button>
      </div>

      {/* Detail overlay box when a signal point is clicked */}
      {focusedSignal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-zinc-950/95 border border-zinc-800 backdrop-blur-lg p-5 rounded-2xl shadow-2xl text-center transition-all animate-in fade-in zoom-in-95 duration-200 z-10">
          <div className="flex justify-end -mt-2 -mr-2">
            <button
              id="close-signal-modal"
              onClick={() => setFocusedSignal(null)}
              className="p-1 text-zinc-400 hover:text-white text-xs hover:bg-zinc-800 rounded-md transition-all font-mono"
            >
              [X]
            </button>
          </div>
          <p className="text-xs font-mono text-zinc-500 uppercase mb-2">
            Intercepted Late Night Signal ({focusedSignal.vibe})
          </p>
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 max-h-[140px] overflow-y-auto mb-4 text-center">
            <p className="text-zinc-200 text-sm leading-relaxed italic">
              &ldquo;{focusedSignal.text}&rdquo;
            </p>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            DRIFT TIME: {new Date(focusedSignal.createdAt).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Style Transition Morph Overlay - Framer Motion Banner */}
      <AnimatePresence mode="popLayout">
        {lastChangedStyle && (
          <motion.div
            key={lastChangedStyle}
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none bg-zinc-950/95 border border-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] z-30"
          >
            <div className="text-xl">
              {lastChangedStyle === "gravity" && "🛰️"}
              {lastChangedStyle === "bars" && "📊"}
              {lastChangedStyle === "circle" && "🌀"}
              {lastChangedStyle === "particles" && "✨"}
            </div>
            <div className="text-left">
              <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-400 font-bold leading-none mb-1">Visualization Mode Synthesized</p>
              <p className="text-xs font-sans font-black text-white leading-none">
                {lastChangedStyle === "gravity" && "Orbit Core Constellation"}
                {lastChangedStyle === "bars" && "Frequency Spectrum Equalizer"}
                {lastChangedStyle === "circle" && "Pulsating Fluid Waves"}
                {lastChangedStyle === "particles" && "Graceful Ambient Particle Stream"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualizer Style Selector Overlay Footer */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 pointer-events-auto bg-zinc-950/90 border border-white/5 backdrop-blur-md p-1.5 rounded-xl flex items-center justify-center gap-1 shadow-2xl z-10 select-none">
        <span className="text-[10px] font-mono text-zinc-500 px-2 uppercase hidden sm:inline">Style:</span>
        {[
          { id: "gravity", label: "Orbit Core", icon: "🛰️" },
          { id: "bars", label: "Frequency Bars", icon: "📊" },
          { id: "circle", label: "Circular Wave", icon: "🌀" },
          { id: "particles", label: "Particle Flow", icon: "✨" }
        ].map((styleOpt) => {
          const isActive = visualStyle === styleOpt.id;
          return (
            <button
              key={styleOpt.id}
              type="button"
              onClick={() => changeStyleWithNotice(styleOpt.id as any)}
              className="relative text-[11px] px-3 rounded-lg transition-all font-mono font-bold flex items-center gap-1.5 cursor-pointer z-10 hover:text-white min-h-[44px] md:min-h-0"
              style={{ color: isActive ? "#ffffff" : "rgb(161, 161, 170)" }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeVisualStyleBg"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/35 rounded-lg -z-10 shadow-lg shadow-indigo-500/5"
                />
              )}
              <span className="text-sm md:text-xs">{styleOpt.icon}</span>
              <span className="hidden md:inline">{styleOpt.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
