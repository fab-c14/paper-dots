import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, DialAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotDialProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: number) => void;
  label?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: DialAnimationType;
  inkColor?: string;
  size?: number;
  className?: string;
}

const TICK_COUNT = 24;
const NEEDLE_DOT_INDEX = TICK_COUNT; // last dot in the array is always the needle

export const PaperDotDial: React.FC<PaperDotDialProps> = ({
  value: controlledValue,
  defaultValue = 65,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label = 'Level',
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'radial-sweep',
  inkColor,
  size = 110,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isInitialized = useRef(false);

  // Drag state
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValRef = useRef(currentValue);
  const lastDetentRef = useRef(currentValue);
  // Detent debounce: don't play click more than once per 60ms
  const lastClickTimeRef = useRef(0);
  // Angular velocity for tangential impulse
  const lastDragYRef = useRef(0);
  const dragVelRef = useRef(0);

  const pointerRef = useRef<PointerState>({
    x: 0, y: 0, prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    isDown: false, isInside: false,
    radius: 22,
  });

  const activePrimary = inkColor || palette.primary;
  const center = size / 2;
  const radius = size * 0.38;

  // Arc: -135° → +135° (270° total span), same as original
  const START_ANGLE = (135 * Math.PI) / 180;
  const END_ANGLE   = (405 * Math.PI) / 180;
  const TOTAL_SPAN  = END_ANGLE - START_ANGLE;

  const fractionFromValue = useCallback(
    (v: number) => Math.min(1, Math.max(0, (v - min) / (max - min))),
    [min, max]
  );

  // ─── One-time dot initialization ───────────────────────────────────────────
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const fraction = fractionFromValue(currentValueRef.current);
    const dots: Dot[] = [];

    // Tick arc dots
    for (let i = 0; i < TICK_COUNT; i++) {
      const tickFrac = i / (TICK_COUNT - 1);
      const angle = START_ANGLE + tickFrac * TOTAL_SPAN;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const isPassed = tickFrac <= fraction + 0.02;

      dots.push({
        id: `dial-tick-${i}`,
        x, y, targetX: x, targetY: y,
        vx: 0, vy: 0,
        radius: isPassed ? 2.6 : 1.6,
        baseRadius: isPassed ? 2.6 : 1.6,
        color: isPassed ? activePrimary : (palette.border || '#D8D4C7'),
        opacity: isPassed ? 0.95 : 0.38,
        baseOpacity: isPassed ? 0.95 : 0.38,
        mass: 1.0,
        stiffness: 0.28,
        damping: 0.82,
        jitter: 0.04,
        shape: dotShape,
      });
    }

    // Needle dot — persistent, spring-animated
    const needleAngle = START_ANGLE + fraction * TOTAL_SPAN;
    const needleDist = radius * 0.62;
    const nx = center + Math.cos(needleAngle) * needleDist;
    const ny = center + Math.sin(needleAngle) * needleDist;
    dots.push({
      id: 'dial-needle',
      x: nx, y: ny, targetX: nx, targetY: ny,
      vx: 0, vy: 0,
      radius: 3.6, baseRadius: 3.6,
      color: activePrimary,
      opacity: 1.0, baseOpacity: 1.0,
      mass: 0.7,
      stiffness: 0.38,   // snappy spring
      damping: 0.68,     // slight overshoot = feels alive
      jitter: 0.0,
      shape: dotShape,
    });

    dotsRef.current = dots;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — one-time init

  // ─── Sync dots to value changes (no re-creation) ───────────────────────────
  const prevFractionRef = useRef(fractionFromValue(currentValue));

  useEffect(() => {
    const dots = dotsRef.current;
    if (dots.length === 0) return;

    const fraction = fractionFromValue(currentValue);
    const prevFraction = prevFractionRef.current;
    const movingForward = fraction > prevFraction;
    prevFractionRef.current = fraction;

    // Update each tick dot
    for (let i = 0; i < TICK_COUNT; i++) {
      const dot = dots[i];
      const tickFrac = i / (TICK_COUNT - 1);
      const isPassed = tickFrac <= fraction + 0.02;
      const wasPassed = tickFrac <= prevFraction + 0.02;

      // Crossing transition: fire a radial scatter burst outward (away from center)
      if (isPassed !== wasPassed) {
        const angle = START_ANGLE + tickFrac * TOTAL_SPAN;
        const outwardX = Math.cos(angle);
        const outwardY = Math.sin(angle);
        const burstSpeed = 3.5 + Math.random() * 2.0;

        dot.isScattered = true;
        dot.scatterTime = 14;
        dot.scatterVx = outwardX * burstSpeed * (movingForward ? 1 : -1);
        dot.scatterVy = outwardY * burstSpeed * (movingForward ? 1 : -1);
        dot.vx = dot.scatterVx * 0.5;
        dot.vy = dot.scatterVy * 0.5;
      }

      // Update appearance targets smoothly
      const targetR = isPassed ? 2.6 : 1.6;
      const targetO = isPassed ? 0.95 : 0.38;
      dot.baseRadius = targetR;
      dot.baseOpacity = targetO;
      if (!dot.isScattered) {
        // Lerp toward target — spring loop handles positional, we nudge radius/opacity
        dot.radius += (targetR - dot.radius) * 0.18;
        dot.opacity += (targetO - dot.opacity) * 0.18;
      }
      dot.color = isPassed ? activePrimary : (palette.border || '#D8D4C7');
    }

    // Update needle target position — spring physics does the animated travel
    const needleAngle = START_ANGLE + fraction * TOTAL_SPAN;
    const needleDist = radius * 0.62;
    const needle = dots[NEEDLE_DOT_INDEX];
    if (needle) {
      needle.targetX = center + Math.cos(needleAngle) * needleDist;
      needle.targetY = center + Math.sin(needleAngle) * needleDist;
      needle.color = activePrimary;
    }
  }, [currentValue, fractionFromValue, activePrimary, palette, center, radius]);

  // ─── Apply tangential angular impulse during drag ──────────────────────────
  const applyAngularImpulse = useCallback((dragVelocity: number) => {
    // dragVelocity > 0 means dragging down (decreasing value), < 0 means up (increasing)
    const dots = dotsRef.current;
    if (dots.length === 0) return;

    const fraction = fractionFromValue(currentValueRef.current);
    const needleAngle = START_ANGLE + fraction * TOTAL_SPAN;

    for (let i = 0; i < TICK_COUNT; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      const tickFrac = i / (TICK_COUNT - 1);
      const angle = START_ANGLE + tickFrac * TOTAL_SPAN;

      // Tangential direction at this dot's position on the arc
      // Tangent = perpendicular to radial direction = (-sin(angle), cos(angle))
      const tangentX = -Math.sin(angle);
      const tangentY =  Math.cos(angle);

      // Proximity to needle: dots near the needle feel the strongest impulse
      const angleDiff = Math.abs(tickFrac - fraction);
      const proximity = Math.max(0, 1 - angleDiff * 6);

      const impulse = -dragVelocity * 0.18 * proximity;
      dot.vx += tangentX * impulse;
      dot.vy += tangentY * impulse;
    }

    // Needle itself gets a direct tangential kick
    const needle = dots[NEEDLE_DOT_INDEX];
    if (needle && !needle.isScattered) {
      const tangentX = -Math.sin(needleAngle);
      const tangentY =  Math.cos(needleAngle);
      needle.vx += tangentX * (-dragVelocity * 0.3);
      needle.vy += tangentY * (-dragVelocity * 0.3);
    }
  }, [fractionFromValue]);

  // ─── Animation render loop ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, size, size);

      // Inner disc face
      ctx.fillStyle = palette.cardBg || '#F5F2EB';
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = palette.border || '#D8D4C7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Update spring physics for all dots
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        {
          stiffness: animationType === 'elastic-snap' ? 0.38 : 0.28,
          damping:   animationType === 'elastic-snap' ? 0.68 : 0.82,
          mass: 1.0,
        },
        1,
        animationType
      );

      // Draw dots
      dotsRef.current.forEach((dot) => {
        PaperTextureGenerator.drawInkDot(
          ctx, dot.x, dot.y, dot.radius,
          dot.color, dot.opacity, true, dot.shape
        );
      });

      // Center value readout
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = palette.dark;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(currentValueRef.current)}`, center, center);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [size, center, radius, palette, animationType]);

  // ─── Value update helper ───────────────────────────────────────────────────
  const commitValue = useCallback((newVal: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(newVal / step) * step));
    if (clamped === currentValueRef.current) return;

    // Fine detent: click on every step, debounced to 60ms
    const now = Date.now();
    if (now - lastClickTimeRef.current >= 60) {
      // Pitch rises with value — like a real knob
      TactileAudio.playTick();
      lastClickTimeRef.current = now;
    }
    lastDetentRef.current = clamped;

    setInternalValue(clamped);
    onChange?.(clamped);
  }, [min, max, step, onChange]);

  // ─── Pointer handlers ──────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    lastDragYRef.current = e.clientY;
    dragVelRef.current = 0;
    startValRef.current = currentValueRef.current;
    pointerRef.current.isDown = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;

    if (isDraggingRef.current) {
      const rawVel = e.clientY - lastDragYRef.current;
      dragVelRef.current = rawVel * 0.6 + dragVelRef.current * 0.4; // EMA smooth
      lastDragYRef.current = e.clientY;

      // Apply tangential impulse to dot field
      if (Math.abs(dragVelRef.current) > 0.3) {
        applyAngularImpulse(dragVelRef.current);
      }

      // Compute new value from total drag delta
      const deltaY = e.clientY - startYRef.current;
      const range = max - min;
      const sensitivity = range / 150; // 150px = full sweep
      const newVal = startValRef.current - deltaY * sensitivity;
      commitValue(newVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    dragVelRef.current = 0;
    pointerRef.current.isDown = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      pointerRef.current.isInside = false;
    }
  };

  // ─── Scroll wheel support ──────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    // deltaY > 0 = scroll down = decrease value (matches physical knob convention)
    const delta = e.deltaY > 0 ? -step : step;
    commitValue(currentValueRef.current + delta);
  }, [step, commitValue]);

  return (
    <div
      className={`inline-flex flex-col items-center select-none cursor-ns-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block"
      />
      {label && (
        <span
          className="text-[11px] font-mono font-bold uppercase tracking-wider mt-1 opacity-80"
          style={{ color: palette.dark }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
