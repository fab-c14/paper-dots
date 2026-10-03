import type { Dot, PointerState, SpringConfig } from './types';

/**
 * Spring & Particle Physics Engine for PaperDots
 * Provides 60 FPS numerical integration, mouse magnetism, and diverse tactile animations:
 * - Hydraulic Pop
 * - Ripple Wave Shockwaves
 * - Letterpress Stamp Compression
 * - Confetti Drift
 * - Particle Vortex Swirls
 * - Vintage Typewriter Micro-Chatter
 * - Sonic Equalizer Wave
 * - Harmonic Breathing
 */
export class DotPhysicsEngine {
  /**
   * Updates all dots with spring physics, cursor magnetism, and responsive return mechanics.
   */
  public static updateDots(
    dots: Dot[],
    pointer: PointerState,
    defaultSpring: SpringConfig,
    dt: number = 1
  ): void {
    const pRadiusSq = pointer.radius * pointer.radius;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // Delayed animation shockwave handler
      if (dot.delayFrames && dot.delayFrames > 0) {
        dot.delayFrames--;
        if (dot.delayFrames === 0) {
          dot.isScattered = true;
          dot.scatterTime = 20;
        }
        continue;
      }

      const k = dot.stiffness || defaultSpring.stiffness;
      const d = dot.damping || defaultSpring.damping;
      const m = dot.mass || defaultSpring.mass;

      if (dot.isScattered) {
        // Decrement scatter lifetime (guarantees fast, crisp recovery in < 350ms)
        dot.scatterTime = (dot.scatterTime || 22) - 1;

        // Apply decaying scatter impulse
        dot.vx += (dot.scatterVx || 0) * 0.16;
        dot.vy += (dot.scatterVy || 0) * 0.16;
        dot.scatterVx = (dot.scatterVx || 0) * 0.84;
        dot.scatterVy = (dot.scatterVy || 0) * 0.84;

        // Strong restoring Hooke's spring pulls dot back toward target
        const returnForceX = (dot.targetX - dot.x) * (k * 1.45);
        const returnForceY = (dot.targetY - dot.y) * (k * 1.45);

        dot.vx = (dot.vx + returnForceX / m) * d;
        dot.vy = (dot.vy + returnForceY / m) * d;

        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Clamp max displacement so dots never fly off-canvas or freeze
        const dx = dot.x - dot.targetX;
        const dy = dot.y - dot.targetY;
        const dist = Math.hypot(dx, dy);
        const maxDist = 34;
        if (dist > maxDist) {
          dot.x = dot.targetX + (dx / dist) * maxDist;
          dot.y = dot.targetY + (dy / dist) * maxDist;
        }

        // Return to normal resting state when timer expires or close to target
        if (dot.scatterTime <= 0 || (dist < 2.5 && Math.abs(dot.vx) < 0.25 && Math.abs(dot.vy) < 0.25)) {
          dot.isScattered = false;
          dot.scatterVx = 0;
          dot.scatterVy = 0;
          dot.scatterTime = 0;
        }
      } else {
        // Standard Hooke's Law Spring Force: F = -k * dx
        const fx = (dot.targetX - dot.x) * k;
        const fy = (dot.targetY - dot.y) * k;

        dot.vx = (dot.vx + fx / m) * d;
        dot.vy = (dot.vy + fy / m) * d;

        // Pointer magnetic interaction
        if (pointer.isInside) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < pRadiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            // Smooth cubic falloff curve
            const factor = Math.max(0, 1 - dist / pointer.radius);
            const force = (pointer.isDown ? 15 : 7) * factor * factor;

            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;

            // Subtle kinetic scale
            dot.radius = dot.baseRadius * (1 + factor * 0.3);
          } else {
            dot.radius += (dot.baseRadius - dot.radius) * 0.15;
          }
        } else {
          dot.radius += (dot.baseRadius - dot.radius) * 0.15;
        }

        // Numerical step
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Micro organic paper tooth jitter
        if (dot.jitter > 0) {
          dot.x += (Math.random() - 0.5) * (dot.jitter * 0.4);
          dot.y += (Math.random() - 0.5) * (dot.jitter * 0.4);
        }
      }
    }
  }

  /**
   * 1. Hydraulic Pop: Radial explosion with instant snappy spring recovery.
   */
  public static triggerHydraulicPop(
    dots: Dot[],
    centerX: number,
    centerY: number,
    forceMagnitude: number = 12
  ): void {
    const capped = Math.min(18, Math.max(4, forceMagnitude));
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 22;

      const dx = dot.x - centerX;
      const dy = dot.y - centerY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3;
      const speed = (0.5 + Math.random() * 0.8) * capped;

      dot.scatterVx = Math.cos(angle) * speed;
      dot.scatterVy = Math.sin(angle) * speed;
      dot.vx = dot.scatterVx * 0.6;
      dot.vy = dot.scatterVy * 0.6;
    }
  }

  /**
   * 2. Ripple Wave: Circular traveling wave radiating outward from click coordinate.
   */
  public static triggerRippleWave(
    dots: Dot[],
    centerX: number,
    centerY: number,
    speed: number = 18,
    amplitude: number = 10
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dist = Math.hypot(dot.targetX - centerX, dot.targetY - centerY);
      const delay = Math.floor(dist / speed);

      dot.delayFrames = delay;
      const angle = Math.atan2(dot.targetY - centerY, dot.targetX - centerX);
      dot.scatterVx = Math.cos(angle) * amplitude;
      dot.scatterVy = Math.sin(angle) * amplitude;
    }
  }

  /**
   * 3. Letterpress Stamp: Vertical mechanical impact with lateral bulge and spring bounce.
   */
  public static triggerLetterpressStamp(
    dots: Dot[],
    centerX: number,
    _centerY: number,
    depth: number = 8
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 18;

      const lateral = (dot.x - centerX) > 0 ? 3 : -3;
      dot.scatterVx = lateral + (Math.random() - 0.5) * 2;
      dot.scatterVy = depth + (Math.random() - 0.5) * 3;
      dot.vx = dot.scatterVx * 0.7;
      dot.vy = dot.scatterVy * 0.7;
    }
  }

  /**
   * 4. Confetti Drift: Upward eruptive spray of paper chips that gently flutter down.
   */
  public static triggerConfettiDrift(
    dots: Dot[],
    centerX: number,
    _centerY: number,
    forceMagnitude: number = 14
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 26;

      const deltaX = dot.x - centerX;
      const spread = (deltaX > 0 ? 1 : -1) * (Math.random() * forceMagnitude * 0.8);
      const upward = -forceMagnitude * (0.8 + Math.random() * 0.6);

      dot.scatterVx = spread;
      dot.scatterVy = upward;
      dot.vx = spread * 0.5;
      dot.vy = upward * 0.5;
    }
  }

  /**
   * 5. Particle Vortex: Swirling cyclone that spins around click point.
   */
  public static triggerParticleVortex(
    dots: Dot[],
    centerX: number,
    centerY: number,
    spinVelocity: number = 12
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 24;

      const dx = dot.x - centerX;
      const dy = dot.y - centerY;
      const dist = Math.hypot(dx, dy) || 1;

      // Tangential velocity: perpendicular to radial vector (-dy, dx)
      const tangentX = -dy / dist;
      const tangentY = dx / dist;

      dot.scatterVx = tangentX * spinVelocity + (Math.random() - 0.5) * 2;
      dot.scatterVy = tangentY * spinVelocity + (Math.random() - 0.5) * 2;
      dot.vx = dot.scatterVx * 0.6;
      dot.vy = dot.scatterVy * 0.6;
    }
  }

  /**
   * 6. Micro-Chatter: High-frequency typewriter carriage tremor.
   */
  public static triggerMicroChatter(dots: Dot[], intensity: number = 6): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 12;

      const dir = (i % 2 === 0 ? 1 : -1);
      dot.scatterVx = dir * intensity;
      dot.scatterVy = (Math.random() - 0.5) * intensity * 0.8;
      dot.vx = dot.scatterVx * 0.8;
      dot.vy = dot.scatterVy * 0.8;
    }
  }

  /**
   * 7. Sonic Equalizer Wave: Living vertical wave modulation across dots (for Play state).
   */
  public static applySonicEqualizerWave(
    dots: Dot[],
    time: number,
    frequency: number = 0.08,
    amplitude: number = 6
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (!dot.isScattered) {
        const offset = Math.sin(dot.targetX * frequency + time * 0.08) * amplitude;
        dot.y = dot.targetY + offset;
      }
    }
  }

  /**
   * 8. Harmonic Breathing: Soft sinusoidal radial expansion and contraction (for Pause/Loaders).
   */
  public static applyHarmonicBreathing(
    dots: Dot[],
    time: number,
    centroidX: number,
    centroidY: number,
    frequency: number = 0.05,
    amplitude: number = 3
  ): void {
    const scale = 1 + Math.sin(time * frequency) * (amplitude / 40);
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (!dot.isScattered) {
        const dx = dot.targetX - centroidX;
        const dy = dot.targetY - centroidY;
        dot.x = centroidX + dx * scale;
        dot.y = centroidY + dy * scale;
      }
    }
  }

  /**
   * Legacy alias for backward compatibility.
   */
  public static triggerScatter(
    dots: Dot[],
    centerX: number,
    centerY: number,
    forceMagnitude: number = 12
  ): void {
    this.triggerHydraulicPop(dots, centerX, centerY, forceMagnitude);
  }

  /**
   * 9. Snake Trail: Serpentine traveling pulse through matrix/perimeter dots.
   */
  public static applySnakeTrail(
    dots: Dot[],
    frame: number,
    width: number,
    _height: number,
    surge: number = 0
  ): void {
    const cols = Math.max(1, Math.round(width / 7));
    const speed = surge > 0 ? 3.0 : 0.8;
    const totalSlots = dots.length + 15;
    const snakeHead = (frame * speed) % totalSlots;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      const c = Math.round(dot.targetX / 7);
      const r = Math.round(dot.targetY / 7);
      const serpIdx = r * cols + (r % 2 === 0 ? c : Math.max(0, cols - 1 - c));
      const distFromHead = (serpIdx - snakeHead + totalSlots) % totalSlots;

      if (distFromHead < 12) {
        const t = 1 - distFromHead / 12;
        dot.radius = dot.baseRadius * (1 + t * 0.8);
        dot.opacity = Math.min(1.0, dot.baseOpacity + t * 0.35);
        dot.y = dot.targetY - t * 2.2;
      } else {
        dot.radius += (dot.baseRadius - dot.radius) * 0.15;
        dot.opacity += (dot.baseOpacity * 0.7 - dot.opacity) * 0.1;
        dot.y += (dot.targetY - dot.y) * 0.2;
      }
    }
  }

  /**
   * 10. Border Wrap: Luminous ribbon wrapping smoothly around outer perimeter.
   */
  public static applyBorderWrap(
    dots: Dot[],
    frame: number,
    width: number,
    height: number,
    surge: number = 0
  ): void {
    const P = 2 * (width + height);
    const speed = surge > 0 ? 9.0 : 3.2;
    const head = (frame * speed) % P;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      const x = dot.targetX;
      const y = dot.targetY;
      const isTop = y <= 14;
      const isBottom = y >= height - 14;
      const isLeft = x <= 14;
      const isRight = x >= width - 14;

      if (isTop || isBottom || isLeft || isRight) {
        let perimDist = 0;
        if (isTop) perimDist = x;
        else if (isRight) perimDist = width + y;
        else if (isBottom) perimDist = width + height + (width - x);
        else if (isLeft) perimDist = 2 * width + height + (height - y);

        const dist = (perimDist - head + P) % P;
        if (dist < 50) {
          const factor = 1 - dist / 50;
          dot.radius = dot.baseRadius * (1 + factor * 0.95);
          dot.opacity = 1.0;
        } else {
          dot.radius += (dot.baseRadius - dot.radius) * 0.15;
          dot.opacity += (dot.baseOpacity * 0.75 - dot.opacity) * 0.1;
        }
      } else {
        dot.opacity += (dot.baseOpacity * 0.5 - dot.opacity) * 0.1;
        dot.radius += (dot.baseRadius - dot.radius) * 0.15;
      }
    }
  }

  /**
   * 11. Glow Fade: Smooth breathing ink bloom and soft continuous fade (zero scatter/burst).
   */
  public static applyGlowFade(
    dots: Dot[],
    frame: number,
    pulseProgress: number = 0
  ): void {
    const cycle = (frame * 0.04) % (Math.PI * 2);
    const breath = 0.5 + 0.5 * Math.sin(cycle);
    const extra = pulseProgress > 0 ? Math.sin(pulseProgress * Math.PI) * 0.6 : 0;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      dot.radius = dot.baseRadius * (1.0 + (breath * 0.32 + extra));
      dot.opacity = Math.min(1.0, 0.45 + breath * 0.45 + extra * 0.35);
      dot.x += (dot.targetX - dot.x) * 0.2;
      dot.y += (dot.targetY - dot.y) * 0.2;
    }
  }

  /**
   * 12. Smooth Pulse: Wobble-free harmonic dilation (crafted for Hearts, Badges, and Tactile Pills).
   */
  public static applySmoothPulse(
    dots: Dot[],
    frame: number,
    centroidX: number,
    centroidY: number,
    pulseProgress: number = 0
  ): void {
    const beatTime = (frame * 0.05) % (Math.PI * 2);
    const baseBeat =
      Math.max(0, Math.sin(beatTime)) * 0.16 +
      Math.max(0, Math.sin(beatTime * 2 + 0.2)) * 0.07;
    const clickBoost = pulseProgress > 0 ? Math.sin(pulseProgress * Math.PI) * 0.32 : 0;
    const totalScale = 1.0 + baseBeat + clickBoost;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      const dx = dot.targetX - centroidX;
      const dy = dot.targetY - centroidY;
      dot.x = centroidX + dx * totalScale;
      dot.y = centroidY + dy * totalScale;
      dot.radius = dot.baseRadius * (1.0 + (baseBeat + clickBoost) * 0.45);
      dot.opacity = Math.min(1.0, dot.baseOpacity + (baseBeat + clickBoost) * 0.2);
    }
  }

  /**
   * 13. Wave Sweep: Laminar ink wave rolling smoothly across the x-axis.
   */
  public static applyWaveSweep(
    dots: Dot[],
    frame: number,
    width: number,
    surge: number = 0
  ): void {
    const speed = surge > 0 ? 5.5 : 2.5;
    const waveX = (frame * speed) % (width + 60) - 30;
    const waveWidth = 35;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      if (dot.isScattered) continue;

      const dist = Math.abs(dot.targetX - waveX);
      if (dist < waveWidth) {
        const t = 1 - dist / waveWidth;
        dot.radius = dot.baseRadius * (1 + t * 0.7);
        dot.opacity = Math.min(1.0, dot.baseOpacity + t * 0.3);
        dot.y = dot.targetY - t * 2.5;
      } else {
        dot.radius += (dot.baseRadius - dot.radius) * 0.15;
        dot.opacity += (dot.baseOpacity * 0.75 - dot.opacity) * 0.1;
        dot.y += (dot.targetY - dot.y) * 0.2;
      }
    }
  }

  /**
   * Smoothly morphs dots to new target coordinates.
   */
  public static morphTargets(dots: Dot[], newPositions: { x: number; y: number }[]): void {
    for (let i = 0; i < dots.length; i++) {
      if (i < newPositions.length) {
        dots[i].targetX = newPositions[i].x;
        dots[i].targetY = newPositions[i].y;
        dots[i].opacity = dots[i].baseOpacity;
        dots[i].isScattered = false;
      } else {
        dots[i].targetX = dots[0]?.targetX || dots[i].targetX;
        dots[i].targetY = dots[0]?.targetY || dots[i].targetY;
        dots[i].opacity = 0;
      }
    }
  }
}
