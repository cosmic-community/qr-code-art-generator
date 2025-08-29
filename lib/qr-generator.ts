import QRCode from 'qrcode';
import type { QRCodeConfig, ExportFormat } from '@/types';

// Generate QR code data URL with enhanced error handling
export async function generateQRCode(config: QRCodeConfig): Promise<string> {
  try {
    // Validate input
    if (!config.text || typeof config.text !== 'string') {
      throw new Error('Invalid text input for QR code generation');
    }

    const options = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: config.margin || 2,
      color: {
        dark: config.foregroundColor || '#000000',
        light: config.backgroundColor || '#ffffff',
      },
      width: config.size || 400,
    };

    console.log('Generating QR code with options:', options);
    const dataUrl = await QRCode.toDataURL(config.text, options);
    console.log('QR code generated successfully, data URL length:', dataUrl.length);
    
    return dataUrl;
  } catch (error) {
    console.error('Error in generateQRCode:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate QR code SVG with enhanced error handling
export async function generateQRCodeSVG(config: QRCodeConfig): Promise<string> {
  try {
    // Validate input
    if (!config.text || typeof config.text !== 'string') {
      throw new Error('Invalid text input for QR code SVG generation');
    }

    const options = {
      errorCorrectionLevel: 'M' as const,
      margin: config.margin || 2,
      color: {
        dark: config.foregroundColor || '#000000',
        light: config.backgroundColor || '#ffffff',
      },
      width: config.size || 400,
    };

    const svgString = await QRCode.toString(config.text, { 
      ...options, 
      type: 'svg' 
    });
    
    console.log('QR code SVG generated successfully');
    return svgString;
  } catch (error) {
    console.error('Error in generateQRCodeSVG:', error);
    throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced URL validation with better pattern matching
export function isValidUrl(text: string): boolean {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return false;
  }

  const trimmedText = text.trim();
  
  try {
    // Try parsing as-is first
    new URL(trimmedText);
    return true;
  } catch {
    // Try adding https:// prefix
    try {
      new URL(`https://${trimmedText}`);
      
      // Additional validation for common patterns
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\/.*)?$/;
      
      return domainPattern.test(trimmedText) || urlPattern.test(trimmedText);
    } catch {
      return false;
    }
  }
}

// Enhanced URL formatting
export function formatUrl(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const trimmedText = text.trim();
  
  try {
    // If it's already a valid URL, return as-is
    new URL(trimmedText);
    return trimmedText;
  } catch {
    // Add https:// prefix if missing
    const formatted = `https://${trimmedText}`;
    
    try {
      // Validate the formatted URL
      new URL(formatted);
      return formatted;
    } catch {
      // If still invalid, return the original text
      return trimmedText;
    }
  }
}

// Download file with better error handling
export function downloadFile(dataUrl: string, filename: string, format: ExportFormat): void {
  try {
    if (!dataUrl || !filename) {
      throw new Error('Invalid parameters for file download');
    }

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Downloaded ${filename}.${format}`);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Convert data URL to blob with better error handling
export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    if (!dataUrl || typeof dataUrl !== 'string') {
      throw new Error('Invalid data URL');
    }

    const arr = dataUrl.split(',');
    if (arr.length !== 2) {
      throw new Error('Invalid data URL format');
    }

    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch?.[1] ?? 'image/png';
    
    const base64Data = arr[1];
    if (!base64Data) {
      throw new Error('No base64 data found in data URL');
    }
    
    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error('Error converting data URL to blob:', error);
    throw new Error(`Failed to convert data URL to blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Apply artistic effects using CSS filters and DOM manipulation
export async function applyArtisticEffects(
  dataUrl: string, 
  style: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        try {
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
            default:
              // No special effects for 'square' style
              break;
          }

          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          console.error('Error applying artistic effects:', error);
          resolve(dataUrl); // Fall back to original
        }
      };
      
      img.onerror = () => {
        console.error('Error loading image for artistic effects');
        resolve(dataUrl); // Fall back to original
      };
      
      img.src = dataUrl;
    } catch (error) {
      console.error('Error in applyArtisticEffects:', error);
      resolve(dataUrl); // Fall back to original
    }
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
  try {
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
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced download function with PDF support and better error handling
export async function downloadQRCode(
  dataUrl: string, 
  filename: string, 
  format: ExportFormat,
  style?: string
): Promise<void> {
  try {
    if (!dataUrl || !filename) {
      throw new Error('Missing required parameters for download');
    }

    let finalDataUrl = dataUrl;
    
    // Apply artistic effects if specified
    if (style && style !== 'square') {
      try {
        finalDataUrl = await applyArtisticEffects(dataUrl, style);
      } catch (error) {
        console.warn('Failed to apply artistic effects, using original:', error);
        // Continue with original dataUrl
      }
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
    
    // Handle PNG format (default)
    downloadFile(finalDataUrl, filename, format);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error(`Failed to download QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}