import type { Dot, PointerState, SpringConfig } from './types';

/**
 * Spring & Particle Physics Engine for PaperDots
 * Provides 60 FPS numerical integration, mouse magnetism, and controlled tactile bursts.
 * Engineered for silky smooth 60 FPS response with ZERO stuck dots or lagging returns.
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
      const k = dot.stiffness || defaultSpring.stiffness;
      const d = dot.damping || defaultSpring.damping;
      const m = dot.mass || defaultSpring.mass;

      if (dot.isScattered) {
        // Decrement scatter lifetime (guarantees fast, crisp recovery in < 400ms)
        dot.scatterTime = (dot.scatterTime || 25) - 1;

        // Apply decaying scatter impulse
        dot.vx += (dot.scatterVx || 0) * 0.15;
        dot.vy += (dot.scatterVy || 0) * 0.15;
        dot.scatterVx = (dot.scatterVx || 0) * 0.85;
        dot.scatterVy = (dot.scatterVy || 0) * 0.85;

        // Strong restoring spring pulls dot back toward target
        const returnForceX = (dot.targetX - dot.x) * (k * 1.4);
        const returnForceY = (dot.targetY - dot.y) * (k * 1.4);

        dot.vx = (dot.vx + returnForceX / m) * d;
        dot.vy = (dot.vy + returnForceY / m) * d;

        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Clamp max displacement so dots never fly off-screen or freeze
        const dx = dot.x - dot.targetX;
        const dy = dot.y - dot.targetY;
        const dist = Math.hypot(dx, dy);
        const maxDist = 32;
        if (dist > maxDist) {
          dot.x = dot.targetX + (dx / dist) * maxDist;
          dot.y = dot.targetY + (dy / dist) * maxDist;
        }

        // Return to normal resting state when timer expires or close to target
        if (dot.scatterTime <= 0 || (dist < 3 && Math.abs(dot.vx) < 0.3 && Math.abs(dot.vy) < 0.3)) {
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
            const force = (pointer.isDown ? 16 : 8) * factor * factor;

            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;

            // Subtle kinetic scale
            dot.radius = dot.baseRadius * (1 + factor * 0.35);
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
          dot.x += (Math.random() - 0.5) * (dot.jitter * 0.5);
          dot.y += (Math.random() - 0.5) * (dot.jitter * 0.5);
        }
      }
    }
  }

  /**
   * Triggers a responsive, controlled tactile pop / paper confetti burst.
   * forceMagnitude is capped and returns cleanly in under 400ms.
   */
  public static triggerScatter(
    dots: Dot[],
    centerX: number,
    centerY: number,
    forceMagnitude: number = 12
  ): void {
    const cappedForce = Math.min(18, Math.max(4, forceMagnitude));

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;
      dot.scatterTime = 22; // ~360ms at 60 FPS

      const dx = dot.x - centerX;
      const dy = dot.y - centerY;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
      const speed = (0.6 + Math.random() * 0.8) * cappedForce;

      dot.scatterVx = Math.cos(angle) * speed;
      dot.scatterVy = Math.sin(angle) * speed;

      dot.vx = dot.scatterVx * 0.6;
      dot.vy = dot.scatterVy * 0.6;
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
