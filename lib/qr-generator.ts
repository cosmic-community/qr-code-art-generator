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
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  
  if (!arr[1]) {
    throw new Error('Invalid data URL format');
  }
  
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Apply artistic effects using CSS filters and DOM manipulation
export async function applyArtisticEffects(
  dataUrl: string, 
  style: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply base image
      ctx.drawImage(img, 0, 0);

      // Apply style-specific effects
      switch (style) {
        case 'rounded':
          applyRoundedCorners(ctx, canvas.width, canvas.height);
          break;
        case 'dots':
          applyDotOverlay(ctx, canvas.width, canvas.height);
          break;
        case 'artistic':
          applyGradientOverlay(ctx, canvas.width, canvas.height);
          break;
      }

      resolve(canvas.toDataURL('image/png'));
    };
    
    img.src = dataUrl;
  });
}

// Apply rounded corners using canvas clipping
function applyRoundedCorners(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const radius = Math.min(width, height) * 0.1;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  
  // Create rounded rectangle path
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height - radius);
  ctx.quadraticCurveTo(width, height, width - radius, height);
  ctx.lineTo(radius, height);
  ctx.quadraticCurveTo(0, height, 0, height - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

// Apply dot overlay effect
function applyDotOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.globalCompositeOperation = 'multiply';
  const dotSize = Math.max(2, Math.floor(width / 100));
  
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
  gradient.addColorStop(0.5, 'rgba(128, 128, 128, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
}

// Generate PDF from image data
export async function generatePDF(dataUrl: string, filename: string): Promise<string> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const pdf = new jsPDF();
        const imgWidth = 190; // A4 width minus margins
        const imgHeight = (img.height * imgWidth) / img.width;
        
        pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
        
        const pdfDataUrl = pdf.output('datauristring');
        resolve(pdfDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for PDF generation'));
    };
    
    img.src = dataUrl;
  });
}

// Enhanced download function with PDF support
export async function downloadQRCode(
  dataUrl: string, 
  filename: string, 
  format: ExportFormat,
  style?: string
): Promise<void> {
  try {
    let finalDataUrl = dataUrl;
    
    // Apply artistic effects if specified
    if (style && style !== 'square') {
      finalDataUrl = await applyArtisticEffects(dataUrl, style);
    }
    
    // Handle PDF generation
    if (format === 'pdf') {
      const pdfDataUrl = await generatePDF(finalDataUrl, filename);
      downloadFile(pdfDataUrl, filename, format);
      return;
    }
    
    // Handle SVG format
    if (format === 'svg') {
      // SVG should be handled separately in the component
      downloadFile(finalDataUrl, filename, format);
      return;
    }
    
    // Handle PNG format
    downloadFile(finalDataUrl, filename, format);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}