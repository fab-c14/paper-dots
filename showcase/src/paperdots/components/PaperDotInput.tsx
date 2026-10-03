import React, { useEffect, useRef, useState } from 'react';
import type { Dot, PointerState, RisographPalette, DotGeometry, InputAnimationType } from '../types';
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
  animationType?: InputAnimationType;
  inkColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const PaperDotInput: React.FC<PaperDotInputProps> = ({
  value,
  onChange,
  placeholder = 'Type something...',
  palette = DEFAULT_PALETTE,
  dotShape = 'square',
  animationType = 'typewriter-recoil',
  inkColor,
  width = 280,
  height = 46,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
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
        color: isFocused ? (inkColor || palette.primary) : palette.muted,
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
  }, [width, height, isFocused, palette, dotShape, inkColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      frameCountRef.current++;

      const bgColor = palette.cardBg || palette.background;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Focus halo breathing
      if (isFocused && animationType === 'focus-halo') {
        DotPhysicsEngine.applyHarmonicBreathing(dotsRef.current, frameCountRef.current, width / 2, height / 2, 0.08, 1.8);
      }

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
  }, [width, height, palette, dotShape, isFocused, animationType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    if (animationType === 'typewriter-recoil') {
      TactileAudio.playTick();
      DotPhysicsEngine.triggerMicroChatter(dotsRef.current, 5);
    } else if (animationType === 'perimeter-wave') {
      TactileAudio.playClick(700);
      DotPhysicsEngine.triggerRippleWave(dotsRef.current, 10, height / 2, 14, 8);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 rounded-xl"
        style={{ pointerEvents: 'none' }}
      />
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="relative z-10 w-full h-full bg-transparent px-4 font-mono text-xs outline-none"
        style={{
          color: palette.dark,
        }}
      />
    </div>
  );
};
