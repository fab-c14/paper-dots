import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette } from '../types';
import { DotPhysicsEngine } from '../physics';
import { PaperTextureGenerator } from '../paper-texture';
import { DEFAULT_PALETTE } from '../palettes';

export interface PaperDotButtonProps {
  label: string;
  onClick?: () => void;
  palette?: RisographPalette;
  variant?: 'solid' | 'outline' | 'halftone';
  width?: number;
  height?: number;
  dotSpacing?: number;
  disabled?: boolean;
  className?: string;
}

export const PaperDotButton: React.FC<PaperDotButtonProps> = ({
  label,
  onClick,
  palette = DEFAULT_PALETTE,
  variant = 'solid',
  width = 160,
  height = 52,
  dotSpacing = 7,
  disabled = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // Initialize dot lattice
  useEffect(() => {
    const dots: Dot[] = [];
    const cols = Math.floor((width - 16) / dotSpacing);
    const rows = Math.floor((height - 16) / dotSpacing);
    const startX = (width - cols * dotSpacing) / 2 + dotSpacing / 2;
    const startY = (height - rows * dotSpacing) / 2 + dotSpacing / 2;

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * dotSpacing;
        const y = startY + r * dotSpacing;

        // Skip corners for rounded look
        const cornerR = 12;
        const distTL = Math.hypot(x - cornerR, y - cornerR);
        const distTR = Math.hypot(x - (width - cornerR), y - cornerR);
        const distBL = Math.hypot(x - cornerR, y - (height - cornerR));
        const distBR = Math.hypot(x - (width - cornerR), y - (height - cornerR));

        const inCorner =
          (x < cornerR && y < cornerR && distTL > cornerR) ||
          (x > width - cornerR && y < cornerR && distTR > cornerR) ||
          (x < cornerR && y > height - cornerR && distBL > cornerR) ||
          (x > width - cornerR && y > height - cornerR && distBR > cornerR);

        if (inCorner) continue;

        const isBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
        if (variant === 'outline' && !isBorder) continue;

        const baseRad = isBorder ? 2.5 : variant === 'halftone' ? (r % 2 === 0 ? 1.8 : 2.6) : 2.2;
        const dotColor = isBorder ? palette.primary : (c + r) % 3 === 0 ? palette.secondary : palette.primary;

        dots.push({
          id: id++,
          x: x + (Math.random() - 0.5) * 1.5,
          y: y + (Math.random() - 0.5) * 1.5,
          targetX: x,
          targetY: y,
          vx: 0,
          vy: 0,
          radius: baseRad,
          baseRadius: baseRad,
          color: dotColor,
          opacity: 0.9,
          baseOpacity: 0.9,
          mass: 1.0,
          stiffness: 0.16,
          damping: 0.82,
          jitter: 0.2,
        });
      }
    }

    dotsRef.current = dots;
  }, [width, height, dotSpacing, palette, variant]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Clear with slight alpha to produce tactile motion blur trail
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);

      // Update physics
      DotPhysicsEngine.updateDots(
        dotsRef.current,
        pointerRef.current,
        { stiffness: 0.16, damping: 0.82, mass: 1.0 }
      );

      // Render dots
      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        PaperTextureGenerator.drawInkDot(
          ctx,
          d.x,
          d.y,
          d.radius,
          d.color,
          d.opacity,
          true
        );
      }

      // Draw subtle paper fiber overlay
      const paperPattern = PaperTextureGenerator.getPaperPattern(0.04);
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.drawImage(paperPattern, 0, 0, width, height);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, palette]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = x;
    pointerRef.current.y = y;
    pointerRef.current.isInside = true;
  };

  const handlePointerEnter = () => {
    pointerRef.current.isInside = true;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
    pointerRef.current.isDown = false;
    setIsHovered(false);
  };

  const handleClick = () => {
    if (disabled) return;
    // Trigger tactile burst confetti
    DotPhysicsEngine.triggerScatter(
      dotsRef.current,
      pointerRef.current.x || width / 2,
      pointerRef.current.y || height / 2,
      22
    );
    if (onClick) onClick();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{
        width,
        height,
        filter: isHovered ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.04))',
        transform: pointerRef.current.isDown ? 'scale(0.97)' : isHovered ? 'translateY(-1px)' : 'none',
        transition: 'transform 0.15s ease, filter 0.15s ease',
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={() => { pointerRef.current.isDown = true; }}
      onPointerUp={() => { pointerRef.current.isDown = false; }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 rounded-xl"
        style={{ pointerEvents: 'none' }}
      />
      <span
        className="relative z-10 font-bold tracking-wider uppercase text-sm pointer-events-none"
        style={{
          color: palette.dark,
          fontFamily: '"Courier New", Courier, monospace',
          textShadow: '0 1px 2px rgba(255,255,255,0.7)',
        }}
      >
        {label}
      </span>
    </div>
  );
};
