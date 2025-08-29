import QRCode from 'qrcode';
import type { QRCodeConfig, ExportFormat } from '@/types';

// Generate QR code data URL
export async function generateQRCode(config: QRCodeConfig): Promise<string> {
  try {
    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: config.margin,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor,
      },
      width: config.size,
    };

    const dataUrl = await QRCode.toDataURL(config.text, options);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate QR code SVG
export async function generateQRCodeSVG(config: QRCodeConfig): Promise<string> {
  try {
    const options = {
      errorCorrectionLevel: 'M' as const,
      margin: config.margin,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor,
      },
      width: config.size,
    };

    const svgString = await QRCode.toString(config.text, { 
      ...options, 
      type: 'svg' 
    });
    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

// Validate URL
export function isValidUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    // Try adding https:// prefix
    try {
      new URL(`https://${text}`);
      return true;
    } catch {
      return false;
    }
  }
}

// Format URL with protocol
export function formatUrl(text: string): string {
  try {
    new URL(text);
    return text;
  } catch {
    // Add https:// prefix if missing
    return `https://${text}`;
  }
}

// Download file
export function downloadFile(dataUrl: string, filename: string, format: ExportFormat): void {
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Convert data URL to blob
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Apply artistic effects to canvas
export function applyArtisticEffects(
  canvas: HTMLCanvasElement, 
  style: string
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  switch (style) {
    case 'rounded':
      // Apply corner rounding effect
      applyRoundedCorners(ctx, canvas.width, canvas.height);
      break;
    case 'dots':
      // Convert squares to dots
      applyDotPattern(ctx, canvas.width, canvas.height);
      break;
    case 'artistic':
      // Apply gradient overlay
      applyGradientOverlay(ctx, canvas.width, canvas.height);
      break;
  }

  return canvas;
}

// Apply rounded corners
function applyRoundedCorners(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const radius = Math.min(width, height) * 0.1;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

// Apply dot pattern
function applyDotPattern(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // This would require more complex image processing
  // For now, just add a subtle dot overlay
  ctx.globalCompositeOperation = 'multiply';
  const dotSize = 2;
  for (let x = 0; x < width; x += dotSize * 2) {
    for (let y = 0; y < height; y += dotSize * 2) {
      ctx.beginPath();
      ctx.arc(x + dotSize, y + dotSize, dotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

// Apply gradient overlay
function applyGradientOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.globalCompositeOperation = 'overlay';
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
}