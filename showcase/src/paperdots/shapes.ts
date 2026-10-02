import type { PresetShape } from './types';

/**
 * Shape Generator for PaperDots
 * Produces 2D coordinate sets for stippled dot matrices, icons, and curves.
 */
export class ShapeGenerator {
  /**
   * Generates a circular stippled dot cloud or ring.
   */
  public static generateCircle(
    centerX: number,
    centerY: number,
    radius: number,
    count: number = 80,
    filled: boolean = true
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    if (filled) {
      // Fermat spiral / sunflower distribution for organic stippling
      const phi = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(i / count) * radius;
        const theta = i * 2 * Math.PI * phi;
        points.push({
          x: centerX + r * Math.cos(theta),
          y: centerY + r * Math.sin(theta)
        });
      }
    } else {
      // Ring boundary
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * 2 * Math.PI;
        points.push({
          x: centerX + radius * Math.cos(theta),
          y: centerY + radius * Math.sin(theta)
        });
      }
    }

    return points;
  }

  /**
   * Generates a stippled heart shape.
   */
  public static generateHeart(
    centerX: number,
    centerY: number,
    size: number = 50,
    count: number = 80
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const scale = size / 16;

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      // Parametric heart formula
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      points.push({
        x: centerX + x * scale,
        y: centerY + y * scale
      });
    }

    return points;
  }

  /**
   * Generates a 5-pointed stippled star.
   */
  public static generateStar(
    centerX: number,
    centerY: number,
    outerRadius: number = 50,
    innerRadius: number = 22,
    count: number = 80
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const pointsPerSegment = count / 10;

    for (let i = 0; i < 10; i++) {
      const isOuter = i % 2 === 0;
      const r1 = isOuter ? outerRadius : innerRadius;
      const r2 = isOuter ? innerRadius : outerRadius;
      const a1 = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 1) / 10) * Math.PI * 2 - Math.PI / 2;

      const p1 = { x: centerX + r1 * Math.cos(a1), y: centerY + r1 * Math.sin(a1) };
      const p2 = { x: centerX + r2 * Math.cos(a2), y: centerY + r2 * Math.sin(a2) };

      for (let s = 0; s < pointsPerSegment; s++) {
        const t = s / pointsPerSegment;
        points.push({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t
        });
      }
    }

    return points;
  }

  /**
   * Generates a triangular Play icon.
   */
  public static generatePlay(
    centerX: number,
    centerY: number,
    size: number = 45,
    count: number = 80
  ): { x: number; y: number }[] {
    const p1 = { x: centerX - size * 0.5, y: centerY - size * 0.7 };
    const p2 = { x: centerX + size * 0.7, y: centerY };
    const p3 = { x: centerX - size * 0.5, y: centerY + size * 0.7 };

    const vertices = [p1, p2, p3, p1];
    const points: { x: number; y: number }[] = [];
    const pointsPerEdge = count / 3;

    for (let edge = 0; edge < 3; edge++) {
      const start = vertices[edge];
      const end = vertices[edge + 1];
      for (let s = 0; s < pointsPerEdge; s++) {
        const t = s / pointsPerEdge;
        points.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        });
      }
    }

    return points;
  }

  /**
   * Generates two vertical Pause bars.
   */
  public static generatePause(
    centerX: number,
    centerY: number,
    size: number = 45,
    count: number = 80
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const half = Math.floor(count / 2);
    const gap = size * 0.35;
    const height = size * 1.2;

    // Left bar
    for (let i = 0; i < half; i++) {
      const t = (i / (half - 1)) - 0.5;
      points.push({
        x: centerX - gap,
        y: centerY + t * height
      });
    }

    // Right bar
    for (let i = 0; i < half; i++) {
      const t = (i / (half - 1)) - 0.5;
      points.push({
        x: centerX + gap,
        y: centerY + t * height
      });
    }

    return points;
  }

  /**
   * Generates a Checkmark icon.
   */
  public static generateCheck(
    centerX: number,
    centerY: number,
    size: number = 45,
    count: number = 80
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const pStart = { x: centerX - size * 0.6, y: centerY };
    const pMid = { x: centerX - size * 0.15, y: centerY + size * 0.45 };
    const pEnd = { x: centerX + size * 0.65, y: centerY - size * 0.55 };

    const firstSegmentCount = Math.floor(count * 0.35);
    const secondSegmentCount = count - firstSegmentCount;

    for (let i = 0; i < firstSegmentCount; i++) {
      const t = i / firstSegmentCount;
      points.push({
        x: pStart.x + (pMid.x - pStart.x) * t,
        y: pStart.y + (pMid.y - pStart.y) * t
      });
    }

    for (let i = 0; i < secondSegmentCount; i++) {
      const t = i / secondSegmentCount;
      points.push({
        x: pMid.x + (pEnd.x - pMid.x) * t,
        y: pMid.y + (pEnd.y - pMid.y) * t
      });
    }

    return points;
  }

  /**
   * Generates an Arrow icon pointing right.
   */
  public static generateArrow(
    centerX: number,
    centerY: number,
    size: number = 45,
    count: number = 80
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const stemCount = Math.floor(count * 0.5);
    const wingCount = Math.floor(count * 0.25);

    // Stem (horizontal line)
    for (let i = 0; i < stemCount; i++) {
      const t = (i / stemCount) - 0.5;
      points.push({
        x: centerX + t * size * 1.2,
        y: centerY
      });
    }

    // Upper wing
    for (let i = 0; i < wingCount; i++) {
      const t = i / wingCount;
      points.push({
        x: centerX + size * 0.6 - t * size * 0.4,
        y: centerY - t * size * 0.45
      });
    }

    // Lower wing
    for (let i = 0; i < count - stemCount - wingCount; i++) {
      const t = i / (count - stemCount - wingCount);
      points.push({
        x: centerX + size * 0.6 - t * size * 0.4,
        y: centerY + t * size * 0.45
      });
    }

    return points;
  }

  /**
   * Generates a rounded rectangle stippled border / grid.
   */
  public static generateRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number = 12,
    spacing: number = 10
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    // Perimeter points
    const perimeter = 2 * (w + h) - 8 * radius + 2 * Math.PI * radius;
    const numPoints = Math.max(20, Math.floor(perimeter / spacing));

    for (let i = 0; i < numPoints; i++) {
      const d = (i / numPoints) * perimeter;
      const pt = this.getPointOnRoundedRect(x, y, w, h, radius, d);
      points.push(pt);
    }

    return points;
  }

  private static getPointOnRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    dist: number
  ): { x: number; y: number } {
    const straightTop = w - 2 * r;
    const straightRight = h - 2 * r;
    const straightBottom = straightTop;
    const straightLeft = straightRight;
    const cornerArc = (Math.PI / 2) * r;

    let d = dist;

    // Top straight
    if (d < straightTop) {
      return { x: x + r + d, y };
    }
    d -= straightTop;

    // Top-right corner
    if (d < cornerArc) {
      const angle = (d / cornerArc) * (Math.PI / 2);
      return { x: x + w - r + Math.sin(angle) * r, y: y + r - Math.cos(angle) * r };
    }
    d -= cornerArc;

    // Right straight
    if (d < straightRight) {
      return { x: x + w, y: y + r + d };
    }
    d -= straightRight;

    // Bottom-right corner
    if (d < cornerArc) {
      const angle = (d / cornerArc) * (Math.PI / 2);
      return { x: x + w - r + Math.cos(angle) * r, y: y + h - r + Math.sin(angle) * r };
    }
    d -= cornerArc;

    // Bottom straight
    if (d < straightBottom) {
      return { x: x + w - r - d, y: y + h };
    }
    d -= straightBottom;

    // Bottom-left corner
    if (d < cornerArc) {
      const angle = (d / cornerArc) * (Math.PI / 2);
      return { x: x + r - Math.sin(angle) * r, y: y + h - r + Math.cos(angle) * r };
    }
    d -= cornerArc;

    // Left straight
    if (d < straightLeft) {
      return { x, y: y + h - r - d };
    }
    d -= straightLeft;

    // Top-left corner
    const angle = (d / cornerArc) * (Math.PI / 2);
    return { x: x + r - Math.cos(angle) * r, y: y + r - Math.sin(angle) * r };
  }

  /**
   * Helper router to get coordinates by preset shape name.
   */
  public static getShapePoints(
    shape: PresetShape,
    centerX: number,
    centerY: number,
    size: number = 45,
    count: number = 80
  ): { x: number; y: number }[] {
    switch (shape) {
      case 'heart':
        return this.generateHeart(centerX, centerY, size, count);
      case 'star':
        return this.generateStar(centerX, centerY, size, size * 0.45, count);
      case 'play':
        return this.generatePlay(centerX, centerY, size, count);
      case 'pause':
        return this.generatePause(centerX, centerY, size, count);
      case 'check':
        return this.generateCheck(centerX, centerY, size, count);
      case 'arrow':
        return this.generateArrow(centerX, centerY, size, count);
      case 'circle':
      default:
        return this.generateCircle(centerX, centerY, size * 0.8, count, true);
    }
  }
}
