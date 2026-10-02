import type { Dot, PointerState, SpringConfig } from './types';

/**
 * Spring & Particle Physics Engine for PaperDots
 * Provides 60 FPS numerical integration, mouse magnetism, and confetti scatter.
 */
export class DotPhysicsEngine {
  /**
   * Updates all dots with spring physics, cursor magnetism, and scatter mechanics.
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
        // Scatter / explosion physics
        dot.vx += (dot.scatterVx || 0) * 0.1;
        dot.vy += (dot.scatterVy || 0) * 0.1;

        // Apply friction
        dot.scatterVx = (dot.scatterVx || 0) * 0.92;
        dot.scatterVy = (dot.scatterVy || 0) * 0.92;

        // Return spring slowly kicks in
        const returnForceX = (dot.targetX - dot.x) * (k * 0.4);
        const returnForceY = (dot.targetY - dot.y) * (k * 0.4);

        dot.vx = (dot.vx + returnForceX / m) * d;
        dot.vy = (dot.vy + returnForceY / m) * d;

        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // If slow and close, stop scattering
        const distSq = (dot.targetX - dot.x) ** 2 + (dot.targetY - dot.y) ** 2;
        if (distSq < 4 && Math.abs(dot.vx) < 0.1 && Math.abs(dot.vy) < 0.1) {
          dot.isScattered = false;
          dot.scatterVx = 0;
          dot.scatterVy = 0;
        }
      } else {
        // Standard Spring force toward target position (Hooke's Law: F = -k * x)
        const fx = (dot.targetX - dot.x) * k;
        const fy = (dot.targetY - dot.y) * k;

        dot.vx = (dot.vx + fx / m) * d;
        dot.vy = (dot.vy + fy / m) * d;

        // Pointer magnetic interaction (if pointer is inside canvas)
        if (pointer.isInside) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < pRadiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            // Repulsion force falls off with distance
            const factor = (1 - dist / pointer.radius);
            const force = (pointer.isDown ? 25 : 12) * factor * factor;

            dot.vx += (dx / dist) * force;
            dot.vy += (dy / dist) * force;

            // Subtle dynamic radius stretch
            dot.radius = dot.baseRadius * (1 + factor * 0.4);
          } else {
            // Restore radius smoothly
            dot.radius += (dot.baseRadius - dot.radius) * 0.1;
          }
        } else {
          dot.radius += (dot.baseRadius - dot.radius) * 0.1;
        }

        // Apply velocities
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Micro paper jitter (mimicking tactile physical paper fibers)
        if (dot.jitter > 0) {
          dot.x += (Math.random() - 0.5) * dot.jitter;
          dot.y += (Math.random() - 0.5) * dot.jitter;
        }
      }
    }
  }

  /**
   * Triggers a tactile explosion / paper confetti burst from a center point.
   */
  public static triggerScatter(
    dots: Dot[],
    centerX: number,
    centerY: number,
    forceMagnitude: number = 18
  ): void {
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.isScattered = true;

      // Calculate radial vector from impact center
      const dx = dot.x - centerX;
      const dy = dot.y - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
      const speed = (0.5 + Math.random() * 1.5) * forceMagnitude * (1 + 10 / dist);

      dot.scatterVx = Math.cos(angle) * speed;
      dot.scatterVy = Math.sin(angle) * speed;

      // Impart initial velocity
      dot.vx = dot.scatterVx * 0.5;
      dot.vy = dot.scatterVy * 0.5;
    }
  }

  /**
   * Smoothly morphs dots from their current targets to new target coordinates.
   */
  public static morphTargets(dots: Dot[], newPositions: { x: number; y: number }[]): void {
    for (let i = 0; i < dots.length; i++) {
      if (i < newPositions.length) {
        dots[i].targetX = newPositions[i].x;
        dots[i].targetY = newPositions[i].y;
        dots[i].opacity = dots[i].baseOpacity;
      } else {
        // Extra dots shrink and fade away
        dots[i].targetX = dots[0]?.targetX || dots[i].targetX;
        dots[i].targetY = dots[0]?.targetY || dots[i].targetY;
        dots[i].opacity = 0;
      }
    }
  }
}
