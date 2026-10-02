/**
 * Procedural Paper Texture & Ink Bleed Renderer
 * Emulates the tactile tactile tooth of printmaking paper and organic ink bleeding.
 */

export class PaperTextureGenerator {
  private static cachedPatternCanvas: HTMLCanvasElement | null = null;

  /**
   * Generates or retrieves a subtle procedural paper fiber pattern.
   */
  public static getPaperPattern(intensity: number = 0.05): HTMLCanvasElement {
    if (this.cachedPatternCanvas) {
      return this.cachedPatternCanvas;
    }

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    // Generate random micro-fiber and paper grain noise
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 50;
      const grain = 240 + noise;

      data[i] = grain;     // R
      data[i + 1] = grain; // G
      data[i + 2] = grain; // B
      data[i + 3] = Math.floor(Math.random() * (intensity * 255)); // Alpha
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw some subtle organic fibers
    ctx.strokeStyle = `rgba(80, 60, 40, ${intensity * 1.5})`;
    ctx.lineWidth = 0.5;
    for (let f = 0; f < 12; f++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const length = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    this.cachedPatternCanvas = canvas;
    return canvas;
  }

  /**
   * Draws an organic paper dot with ink bleed and micro-stipple edges.
   */
  public static drawInkDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    opacity: number,
    bleed: boolean = true
  ): void {
    if (radius <= 0.1 || opacity <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (bleed && radius > 2.5) {
      // Draw subtle ink bleed halo
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity * 0.15;
      ctx.fill();

      // Main ink droplet with slight organic shape jitter
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.globalAlpha = opacity * 0.95;
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.restore();
  }
}
