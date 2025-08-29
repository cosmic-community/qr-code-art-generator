import QRCode from 'qrcode';
import type { QRCodeConfig, ExportFormat } from '@/types';

// Generate QR code data URL with enhanced error handling and artistic styles
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
    let dataUrl = await QRCode.toDataURL(config.text, options);
    console.log('QR code generated successfully, data URL length:', dataUrl.length);
    
    // Apply artistic effects based on style or image pattern
    if ((config.style && config.style !== 'square') || config.foregroundImage) {
      try {
        dataUrl = await applyArtisticEffects(dataUrl, config.style, config);
      } catch (error) {
        console.warn('Failed to apply artistic effects, using base QR code:', error);
      }
    }
    
    return dataUrl;
  } catch (error) {
    console.error('Error in generateQRCode:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate QR code SVG with enhanced error handling and artistic styles
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

    let svgString = await QRCode.toString(config.text, { 
      ...options, 
      type: 'svg' 
    });
    
    // Apply SVG-specific artistic effects
    if ((config.style && config.style !== 'square') || config.foregroundImage) {
      svgString = applySVGArtisticEffects(svgString, config.style, config);
    }
    
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

// Enhanced artistic effects application for PNG/Canvas with image pattern support
export async function applyArtisticEffects(
  dataUrl: string, 
  style: string,
  config: QRCodeConfig
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

          // NEW: Handle image pattern first
          if (config.foregroundImage) {
            applyImagePattern(ctx, canvas.width, canvas.height, config)
              .then(() => {
                // After image pattern, apply style effects
                if (style && style !== 'square') {
                  switch (style) {
                    case 'rounded':
                      applyRoundedCorners(ctx, canvas.width, canvas.height, config);
                      break;
                    case 'dots':
                      // Skip dot style when using image pattern (conflicts with image rendering)
                      break;
                    case 'artistic':
                      applyArtisticStyle(ctx, canvas.width, canvas.height, config);
                      break;
                  }
                }
                resolve(canvas.toDataURL('image/png'));
              })
              .catch(() => {
                // If image pattern fails, fall back to regular effects
                console.warn('Image pattern failed, falling back to color effects');
                applyRegularStyleEffects(ctx, canvas.width, canvas.height, style, config);
                resolve(canvas.toDataURL('image/png'));
              });
          } else {
            // Apply regular style effects
            applyRegularStyleEffects(ctx, canvas.width, canvas.height, style, config);
            resolve(canvas.toDataURL('image/png'));
          }
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

// NEW: Apply image pattern to QR code
async function applyImagePattern(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  config: QRCodeConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!config.foregroundImage) {
      reject('No foreground image provided');
      return;
    }

    const patternImg = new Image();
    
    patternImg.onload = () => {
      try {
        // Get current image data to determine QR pattern
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Create pattern canvas
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        if (!patternCtx) {
          reject('Could not create pattern canvas');
          return;
        }
        
        patternCanvas.width = width;
        patternCanvas.height = height;
        
        // Draw tiled pattern image
        const patternWidth = Math.min(patternImg.width, width / 4);
        const patternHeight = Math.min(patternImg.height, height / 4);
        
        for (let x = 0; x < width; x += patternWidth) {
          for (let y = 0; y < height; y += patternHeight) {
            patternCtx.drawImage(
              patternImg, 
              x, y, 
              Math.min(patternWidth, width - x), 
              Math.min(patternHeight, height - y)
            );
          }
        }
        
        // Create mask from original QR code
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);
        
        // Redraw background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Apply image pattern only where QR code modules exist
        const moduleSize = Math.max(1, Math.floor(width / 25)); // Estimate module size
        
        for (let x = 0; x < width; x += moduleSize) {
          for (let y = 0; y < height; y += moduleSize) {
            const pixelIndex = (y * width + x) * 4;
            
            if (pixelIndex >= 0 && pixelIndex + 2 < data.length) {
              const r = data[pixelIndex];
              const g = data[pixelIndex + 1];
              const b = data[pixelIndex + 2];
              
              if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number') {
                const brightness = (r + g + b) / 3;
                
                // If pixel is dark (part of QR code), draw pattern
                if (brightness < 128) {
                  ctx.drawImage(
                    patternCanvas,
                    x, y, moduleSize, moduleSize,
                    x, y, moduleSize, moduleSize
                  );
                }
              }
            }
          }
        }
        
        resolve();
      } catch (error) {
        console.error('Error applying image pattern:', error);
        reject(error);
      }
    };
    
    patternImg.onerror = () => {
      reject('Failed to load pattern image');
    };
    
    patternImg.src = config.foregroundImage;
  });
}

// Regular style effects (existing functionality)
function applyRegularStyleEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: string,
  config: QRCodeConfig
): void {
  switch (style) {
    case 'rounded':
      applyRoundedCorners(ctx, width, height, config);
      break;
    case 'dots':
      applyDotStyle(ctx, width, height, config);
      break;
    case 'artistic':
      applyArtisticStyle(ctx, width, height, config);
      break;
    default:
      // No special effects for 'square' style
      break;
  }
}

// Apply SVG artistic effects with image pattern support
function applySVGArtisticEffects(svgString: string, style: string, config: QRCodeConfig): string {
  try {
    let modifiedSvg = svgString;
    
    // NEW: Handle image patterns in SVG (simplified approach)
    if (config.foregroundImage) {
      // For SVG, we'll create a pattern definition
      const patternId = 'qr-image-pattern-' + Math.random().toString(36).substr(2, 9);
      
      const patternDef = `
        <defs>
          <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="20" height="20">
            <image href="${config.foregroundImage}" x="0" y="0" width="20" height="20" preserveAspectRatio="xMidYMid slice"/>
          </pattern>
        </defs>
      `;
      
      modifiedSvg = modifiedSvg.replace('<svg', patternDef + '<svg');
      modifiedSvg = modifiedSvg.replace(
        /fill="([^"]*)" /g,
        `fill="url(#${patternId})" `
      );
      
      return modifiedSvg; // Return early for image patterns
    }
    
    // Regular style effects for SVG
    switch (style) {
      case 'rounded':
        // Add rounded corners to SVG rectangles
        modifiedSvg = modifiedSvg.replace(
          /<rect([^>]*)>/g, 
          '<rect$1 rx="2" ry="2">'
        );
        break;
        
      case 'dots':
        // Convert rectangles to circles
        modifiedSvg = modifiedSvg.replace(
          /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"([^>]*)\/>/g,
          (match, x, y, width, height, attrs) => {
            const centerX = parseInt(x) + parseInt(width) / 2;
            const centerY = parseInt(y) + parseInt(height) / 2;
            const radius = Math.min(parseInt(width), parseInt(height)) / 2;
            return `<circle cx="${centerX}" cy="${centerY}" r="${radius}"${attrs}/>`;
          }
        );
        break;
        
      case 'artistic':
        // Add gradient and shadow effects
        const gradientId = 'qr-gradient-' + Math.random().toString(36).substr(2, 9);
        const shadowId = 'qr-shadow-' + Math.random().toString(36).substr(2, 9);
        
        const defs = `
          <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${config.foregroundColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${adjustColorBrightness(config.foregroundColor, -20)};stop-opacity:1" />
            </linearGradient>
            <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="1" flood-color="${config.foregroundColor}" flood-opacity="0.3"/>
            </filter>
          </defs>
        `;
        
        modifiedSvg = modifiedSvg.replace('<svg', defs + '<svg');
        modifiedSvg = modifiedSvg.replace(
          /fill="([^"]*)" /g,
          `fill="url(#${gradientId})" filter="url(#${shadowId})" `
        );
        break;
    }
    
    return modifiedSvg;
  } catch (error) {
    console.error('Error applying SVG artistic effects:', error);
    return svgString;
  }
}

// Apply rounded corners using canvas clipping with enhanced styling
function applyRoundedCorners(ctx: CanvasRenderingContext2D, width: number, height: number, config: QRCodeConfig): void {
  const radius = Math.min(width, height) * 0.08;
  
  // Create rounded rectangle mask
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
  
  // Add subtle shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
}

// Enhanced dot style effect with proper undefined checks - FIXED
function applyDotStyle(ctx: CanvasRenderingContext2D, width: number, height: number, config: QRCodeConfig): void {
  // Get image data to analyze QR pattern
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Redraw background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Apply dot pattern based on original QR data
  const dotSize = Math.max(3, Math.floor(width / 50));
  const spacing = dotSize * 2;
  
  ctx.fillStyle = config.foregroundColor;
  
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      const pixelIndex = (y * width + x) * 4;
      
      // FIXED: Add proper bounds checking and undefined validation
      if (pixelIndex >= 0 && pixelIndex + 2 < data.length) {
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Check if r, g, b are defined before using them - TYPESCRIPT FIX
        if (typeof r === 'number' && typeof g === 'number' && typeof b === 'number') {
          // If pixel is dark (part of QR code)
          const brightness = (r + g + b) / 3;
          if (brightness < 128) {
            ctx.beginPath();
            ctx.arc(x + dotSize/2, y + dotSize/2, dotSize/2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }
}

// Enhanced artistic style with gradients and effects
function applyArtisticStyle(ctx: CanvasRenderingContext2D, width: number, height: number, config: QRCodeConfig): void {
  // Create gradient effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const baseColor = config.foregroundColor;
  const lightColor = adjustColorBrightness(baseColor, 30);
  const darkColor = adjustColorBrightness(baseColor, -30);
  
  gradient.addColorStop(0, lightColor);
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, darkColor);
  
  // Apply gradient overlay
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle texture overlay
  ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < width * height / 1000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
    ctx.fillRect(x, y, size, size);
  }
  
  ctx.globalCompositeOperation = 'source-over';
  
  // Add subtle glow effect
  ctx.shadowColor = config.foregroundColor;
  ctx.shadowBlur = 2;
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  try {
    const hex = color.replace('#', '');
    
    // Ensure we have valid hex values and handle potential NaN
    const rHex = hex.substr(0, 2);
    const gHex = hex.substr(2, 2);
    const bHex = hex.substr(4, 2);
    
    const rParsed = parseInt(rHex, 16);
    const gParsed = parseInt(gHex, 16);
    const bParsed = parseInt(bHex, 16);
    
    // Check if parsing was successful (not NaN)
    const r = isNaN(rParsed) ? 0 : Math.max(0, Math.min(255, rParsed + amount));
    const g = isNaN(gParsed) ? 0 : Math.max(0, Math.min(255, gParsed + amount));
    const b = isNaN(bParsed) ? 0 : Math.max(0, Math.min(255, bParsed + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch (error) {
    return color; // Return original color if adjustment fails
  }
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
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate optimal size (maintain aspect ratio, fit within page)
          const imgAspect = img.width / img.height;
          const maxWidth = pageWidth - 20; // 10mm margin on each side
          const maxHeight = pageHeight - 20;
          
          let imgWidth = maxWidth;
          let imgHeight = maxWidth / imgAspect;
          
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = maxHeight * imgAspect;
          }
          
          // Center the image
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
          
          pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
          
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
    
    // Handle PDF generation
    if (format === 'pdf') {
      const pdfDataUrl = await generatePDF(finalDataUrl, filename);
      downloadFile(pdfDataUrl, filename, format);
      return;
    }
    
    // Handle other formats
    downloadFile(finalDataUrl, filename, format);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error(`Failed to download QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}