import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, SliderAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: SliderAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
}

export const PaperDotSlider: React.FC<PaperDotSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'elastic-string',
  inkColor,
  width = 240,
  height = 48,
  label,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackDotsRef = useRef<Dot[]>([]);
  const thumbDotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastValRef = useRef<number>(value);

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 30,
  });

  const paddingX = 24;
  const trackWidth = width - paddingX * 2;
  const progress = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const thumbX = paddingX + progress * trackWidth;
  const centerY = height / 2;

  // Initialize track & thumb dots
  useEffect(() => {
    // 1. Track dots
    const trackDots: Dot[] = [];
    const numTrackDots = 24;
    for (let i = 0; i < numTrackDots; i++) {
      const x = paddingX + (i / (numTrackDots - 1)) * trackWidth;
      const y = centerY;
      trackDots.push({
        id: `track-${i}`,
        x,
        y,
        targetX: x,
        targetY: y,
        vx: 0,
        vy: 0,
        radius: 2.2,
        baseRadius: 2.2,
        color: palette.muted,
        opacity: 0.7,
        baseOpacity: 0.7,
        mass: 1.0,
        stiffness: 0.20,
        damping: 0.80,
        jitter: 0.1,
        shape: dotShape,
      });
    }
    trackDotsRef.current = trackDots;

    // 2. Thumb dots (stippled circular or square cluster)
    const thumbDots: Dot[] = [];
    const thumbRadius = 12;
    const numThumbDots = 26;
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numThumbDots; i++) {
      const r = Math.sqrt(i / numThumbDots) * thumbRadius;
      const theta = i * 2 * Math.PI * phi;
      const relX = r * Math.cos(theta);
      const relY = r * Math.sin(theta);

      thumbDots.push({
        id: `thumb-${i}`,
        x: thumbX + relX,
        y: centerY + relY,
        targetX: thumbX + relX,
        targetY: centerY + relY,
        vx: 0,
        vy: 0,
        radius: i === 0 ? 3.4 : 2.2,
        baseRadius: i === 0 ? 3.4 : 2.2,
        color: inkColor ? inkColor : (i % 2 === 0 ? palette.primary : palette.secondary),
        opacity: 0.95,
        baseOpacity: 0.95,
        mass: 0.8,
        stiffness: 0.28,
        damping: 0.76,
        jitter: 0.1,
        shape: dotShape,
      });
    }
    thumbDotsRef.current = thumbDots;
  }, [width, height, min, max, palette, trackWidth, centerY, dotShape, inkColor]);

  // Update thumb positions when value changes
  useEffect(() => {
    const thumbDots = thumbDotsRef.current;
    const thumbRadius = 12;
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < thumbDots.length; i++) {
      const r = Math.sqrt(i / thumbDots.length) * thumbRadius;
      const theta = i * 2 * Math.PI * phi;

      // Elastic string vertical deflection
      let offsetY = 0;
      if (animationType === 'elastic-string' && isDragging) {
        offsetY = Math.sin(progress * Math.PI) * 4;
      }

      thumbDots[i].targetX = thumbX + r * Math.cos(theta);
      thumbDots[i].targetY = centerY + relY(r, theta) + offsetY;

      // Ink dilation effect on dragging
      if (animationType === 'ink-dilation' && isDragging) {
        thumbDots[i].radius = thumbDots[i].baseRadius * 1.35;
      } else {
        thumbDots[i].radius = thumbDots[i].baseRadius;
      }
    }

    function relY(r: number, theta: number) {
      return r * Math.sin(theta);
    }

    const trackDots = trackDotsRef.current;
    for (let t = 0; t < trackDots.length; t++) {
      if (trackDots[t].x <= thumbX) {
        trackDots[t].color = inkColor || palette.primary;
        trackDots[t].opacity = 0.9;
      } else {
        trackDots[t].color = palette.muted;
        trackDots[t].opacity = 0.5;
      }
    }
  }, [thumbX, centerY, palette, isDragging, progress, animationType, inkColor]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(trackDotsRef.current, pointerRef.current, {
        stiffness: 0.20,
        damping: 0.80,
        mass: 1.0,
      }, 1, animationType);

      DotPhysicsEngine.updateDots(thumbDotsRef.current, pointerRef.current, {
        stiffness: 0.28,
        damping: 0.76,
        mass: 0.8,
      }, 1, animationType);

      // Connecting tactile string line
      ctx.beginPath();
      ctx.strokeStyle = palette.muted;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.moveTo(paddingX, centerY);
      ctx.lineTo(width - paddingX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw track
      const track = trackDotsRef.current;
      for (let i = 0; i < track.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          track[i].x,
          track[i].y,
          track[i].radius,
          track[i].color,
          track[i].opacity,
          false,
          track[i].shape || dotShape
        );
      }

      // Draw thumb
      const thumb = thumbDotsRef.current;
      for (let i = 0; i < thumb.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          thumb[i].x,
          thumb[i].y,
          thumb[i].radius,
          thumb[i].color,
          thumb[i].opacity,
          true,
          thumb[i].shape || dotShape
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette, paddingX, centerY, dotShape]);

  const updateFromPointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const clampedX = Math.max(paddingX, Math.min(width - paddingX, localX));
    const newProgress = (clampedX - paddingX) / trackWidth;
    const rawVal = min + newProgress * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    const finalVal = Math.max(min, Math.min(max, steppedVal));

    if (finalVal !== lastValRef.current) {
      if (animationType === 'magnetic-tick') {
        TactileAudio.playClick(600);
        DotPhysicsEngine.triggerMicroChatter(thumbDotsRef.current, 4);
      } else {
        TactileAudio.playTick();
      }
      lastValRef.current = finalVal;
      onChange(finalVal);
    }
  }, [min, max, step, onChange, paddingX, width, trackWidth, animationType]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    pointerRef.current.isDown = true;
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      pointerRef.current.isDown = false;
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 select-none ${className}`}>
      {label && (
        <div className="flex justify-between items-center px-1 text-xs font-mono font-extrabold uppercase tracking-wider" style={{ color: palette.dark }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: inkColor || palette.primary }} />
            {label}
          </span>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: palette.muted }}
          >
            {value}%
          </span>
        </div>
      )}
      <div
        className="relative cursor-pointer touch-none"
        style={{ width, height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-lg shadow-xs"
        />
      </div>
    </div>
  );
};
