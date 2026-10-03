import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, TabsAnimationType } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotTabsProps {
  items?: string[];
  activeIndex?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  animationType?: TabsAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const PaperDotTabs: React.FC<PaperDotTabsProps> = ({
  items = ['Overview', 'Zine Press', 'Halftones'],
  activeIndex: controlledIndex,
  defaultIndex = 0,
  onChange,
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'crawl-slide',
  inkColor,
  width = 320,
  height = 44,
  className = '',
}) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIdx = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

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

  const activePrimary = inkColor || palette.primary;
  const tabCount = Math.max(1, items.length);
  const tabWidth = (width - 8) / tabCount;

  // Initialize dots for indicator pill and border stipples
  useEffect(() => {
    const dots: Dot[] = [];
    const rows = 4;
    const cols = Math.floor(tabWidth / 7);

    // Indicator bed dots
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const startX = 4 + activeIdx * tabWidth + c * 7 + 3.5;
        const startY = 6 + r * 7 + 3.5;
        dots.push({
          id: `tab-dot-${r}-${c}`,
          x: startX,
          y: startY,
          targetX: startX,
          targetY: startY,
          vx: 0,
          vy: 0,
          radius: 1.8,
          baseRadius: 1.8,
          color: activePrimary,
          opacity: 0.35,
          baseOpacity: 0.35,
          mass: 1.0 + Math.random() * 0.2,
          stiffness: animationType === 'spring-elastic' ? 0.32 : 0.22,
          damping: animationType === 'spring-elastic' ? 0.72 : 0.82,
          jitter: 0.1,
          shape: dotShape,
          delayFrames: c * 2,
        });
      }
    }

    dotsRef.current = dots;
  }, [items.length, width, height, dotShape, animationType, activePrimary]);

  // Update target positions on tab change
  useEffect(() => {
    const rows = 4;
    const cols = Math.floor(tabWidth / 7);
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dotsRef.current[idx]) {
          const targetX = 4 + activeIdx * tabWidth + c * 7 + 3.5;
          const targetY = 6 + r * 7 + 3.5;
          dotsRef.current[idx].targetX = targetX;
          dotsRef.current[idx].targetY = targetY;
          if (animationType === 'crawl-slide') {
            dotsRef.current[idx].vx += (Math.random() - 0.5) * 3;
          }
        }
        idx++;
      }
    }
  }, [activeIdx, tabWidth, animationType]);

  // Animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      frameCountRef.current++;

      ctx.clearRect(0, 0, width, height);

      // Draw container paper track
      ctx.fillStyle = palette.cardBg || '#F5F2EB';
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 10);
      ctx.fill();

      // Outer stippled track border
      ctx.strokeStyle = palette.border || '#D8D4C7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Active tab pill background
      const pillX = 4 + activeIdx * tabWidth;
      ctx.fillStyle = activePrimary + '15'; // 8% opacity wash
      ctx.beginPath();
      ctx.roundRect(pillX, 4, tabWidth, height - 8, 8);
      ctx.fill();

      ctx.strokeStyle = activePrimary + '40';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Apply physics to stipple dots
      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: animationType === 'spring-elastic' ? 0.32 : 0.22,
        damping: animationType === 'spring-elastic' ? 0.72 : 0.82,
        mass: 1.0,
      });

      // Draw indicator dots
      dotsRef.current.forEach((dot) => {
        PaperTextureGenerator.drawInkDot(ctx, dot.x, dot.y, dot.radius, dot.color, dot.opacity, true, dot.shape);
      });

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, activeIdx, tabWidth, palette, activePrimary]);

  const handleTabClick = (idx: number) => {
    if (idx !== activeIdx) {
      TactileAudio.playClick(850 + idx * 80);
      setInternalIndex(idx);
      onChange?.(idx);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.isInside = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
  };

  return (
    <div
      className={`relative inline-block select-none overflow-hidden rounded-xl font-mono ${className}`}
      style={{ width, height }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10 flex h-full p-1 items-center">
        {items.map((item, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleTabClick(idx)}
              className="flex-1 h-full flex items-center justify-center text-xs font-mono font-bold tracking-tight rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-black/20"
              style={{
                color: isSelected ? activePrimary : palette.dark + 'AA',
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
