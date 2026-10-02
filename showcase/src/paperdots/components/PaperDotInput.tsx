import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { ShapeGenerator } from '../shapes';
import { DEFAULT_PALETTE } from '../palettes';
import { TactileAudio } from '../audio';

export interface PaperDotInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  palette?: RisographPalette;
  dotShape?: DotGeometry;
  width?: number;
  height?: number;
  className?: string;
}

export const PaperDotInput: React.FC<PaperDotInputProps> = ({
  value,
  onChange,
  placeholder = 'Type something...',
  palette = DEFAULT_PALETTE,
  dotShape = 'circle',
  width = 280,
  height = 46,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    isDown: false,
    isInside: false,
    radius: 35,
  });

  useEffect(() => {
    const borderPoints = ShapeGenerator.generateRoundedRect(4, 4, width - 8, height - 8, 10, 8);
    const dots: Dot[] = [];

    for (let i = 0; i < borderPoints.length; i++) {
      const pt = borderPoints[i];
      dots.push({
        id: `inp-${i}`,
        x: pt.x,
        y: pt.y,
        targetX: pt.x,
        targetY: pt.y,
        vx: 0,
        vy: 0,
        radius: 2.0,
        baseRadius: 2.0,
        color: isFocused ? palette.primary : palette.muted,
        opacity: isFocused ? 0.9 : 0.6,
        baseOpacity: isFocused ? 0.9 : 0.6,
        mass: 0.9,
        stiffness: 0.22,
        damping: 0.78,
        jitter: 0.1,
        shape: dotShape,
      });
    }

    dotsRef.current = dots;
  }, [width, height, isFocused, palette, dotShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const bgColor = palette.cardBg || palette.background;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      DotPhysicsEngine.updateDots(dotsRef.current, pointerRef.current, {
        stiffness: 0.22,
        damping: 0.78,
        mass: 0.9,
      });

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        PaperTextureGenerator.drawInkDot(
          ctx,
          dots[i].x,
          dots[i].y,
          dots[i].radius,
          dots[i].color,
          dots[i].opacity,
          true,
          dots[i].shape || dotShape
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette, dotShape]);

  const handleKeyDown = () => {
    TactileAudio.playClick(600 + Math.random() * 200);
    // Micro jitter kick on dots when typing
    const dots = dotsRef.current;
    for (let i = 0; i < Math.min(6, dots.length); i++) {
      const idx = Math.floor(Math.random() * dots.length);
      dots[idx].vx += (Math.random() - 0.5) * 3;
      dots[idx].vy += (Math.random() - 0.5) * 3;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center overflow-hidden rounded-xl ${className}`}
      style={{ width, height }}
      onMouseEnter={() => { pointerRef.current.isInside = true; }}
      onMouseLeave={() => { pointerRef.current.isInside = false; }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
      }}
    >
      <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          TactileAudio.playClick(500);
        }}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="relative z-10 w-full h-full bg-transparent px-4 text-xs font-mono outline-none"
        style={{ color: palette.dark }}
      />
    </div>
  );
};
