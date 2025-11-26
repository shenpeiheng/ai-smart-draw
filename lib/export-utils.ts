export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'pdf';
  quality?: number; // For JPEG/PNG, 0-1
  scale?: number;  // For scaling the output
}

/**
 * Convert SVG string to canvas and then to desired format
 */
export async function exportSVGAs(svgString: string, options: ExportOptions): Promise<Blob> {
  const { format, quality = 1, scale = 1 } = options;
  
  // Sanitize the SVG by removing external resources that might cause CORS issues
  const sanitizedSVG = sanitizeSVGForExport(svgString);
  
  // Create a temporary DOM parser to extract dimensions
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedSVG, 'image/svg+xml');
  const svgElement = doc.documentElement;
  
  // Get dimensions
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');
  const viewBoxAttr = svgElement.getAttribute('viewBox');
  
  let width = 800;
  let height = 600;
  
  // Handle percentage-based widths
  if (widthAttr) {
    if (widthAttr.endsWith('%')) {
      // For percentage widths, use a default or extract from viewBox
      if (viewBoxAttr) {
        const viewBoxValues = viewBoxAttr.split(' ');
        if (viewBoxValues.length === 4) {
          width = parseFloat(viewBoxValues[2]) || 800;
          height = parseFloat(viewBoxValues[3]) || 600;
        }
      }
    } else {
      width = parseInt(widthAttr, 10);
      if (heightAttr) {
        height = parseInt(heightAttr, 10);
      }
    }
  } else if (viewBoxAttr) {
    // If no width/height, try to get from viewBox
    const viewBoxValues = viewBoxAttr.split(' ');
    if (viewBoxValues.length === 4) {
      width = parseFloat(viewBoxValues[2]) || 800;
      height = parseFloat(viewBoxValues[3]) || 600;
    }
  }
  
  // Apply scale
  width = width * scale;
  height = height * scale;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Set white background for non-transparent export
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create an image from the SVG
  const img = new Image();
  // Add crossOrigin attribute to prevent CORS issues
  img.crossOrigin = 'anonymous';
  
  // Create data URL from sanitized SVG with proper encoding
  const svgBlob = new Blob([sanitizedSVG], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to desired format
        let mimeType: string;
        switch (format) {
          case 'png':
            mimeType = 'image/png';
            break;
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'svg':
            // For SVG, just return the original blob
            URL.revokeObjectURL(url);
            resolve(svgBlob);
            return;
          default:
            mimeType = 'image/png';
        }
        
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create blob'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(new Error(`Canvas export failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      console.error('Image loading error:', e);
      reject(new Error('Could not load SVG image - possibly due to external resources or fonts'));
    };
    
    // Add error handling for the image source
    img.src = url;
  });
}

/**
 * Sanitize SVG for export by removing external resources that might cause CORS issues
 * and ensuring fonts are properly handled
 */
function sanitizeSVGForExport(svgString: string): string {
  // Parse the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;
  
  // Add viewBox if it doesn't exist but width/height do
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');
  const viewBoxAttr = svgElement.getAttribute('viewBox');
  
  if (!viewBoxAttr && widthAttr && heightAttr) {
    const width = parseInt(widthAttr, 10);
    const height = parseInt(heightAttr, 10);
    if (!isNaN(width) && !isNaN(height)) {
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
  }
  
  // Add font information to ensure text renders correctly
  // Check if there's already a style element
  let styleElement = svgElement.querySelector('style');
  if (!styleElement) {
    styleElement = doc.createElement('style');
    svgElement.prepend(styleElement);
  }
  
  // Ensure common fonts are available with better font-face definitions
  const fontStyles = `
    @namespace svg url(http://www.w3.org/2000/svg);
    svg|text {
      font-family: 'trebuchet ms', verdana, arial, sans-serif !important;
      fill: #000 !important;
    }
  `;
  
  // Add font styles if not already present
  if (!styleElement.textContent?.includes('font-family')) {
    styleElement.textContent = (styleElement.textContent || '') + fontStyles;
  }
  
  // Also add inline font styles to all text elements to ensure they're properly rendered
  const textElements = svgElement.querySelectorAll('text');
  textElements.forEach(textEl => {
    const currentFontFamily = textEl.getAttribute('font-family');
    if (!currentFontFamily || !currentFontFamily.includes('trebuchet')) {
      textEl.setAttribute('font-family', "'trebuchet ms', verdana, arial, sans-serif");
    }
    
    // Ensure fill is set
    if (!textEl.getAttribute('fill')) {
      textEl.setAttribute('fill', '#000');
    }
  });
  
  // Remove any external resources that might cause CORS issues
  // Remove xlink:href attributes that point to external resources
  const elementsWithXlink = svgElement.querySelectorAll('[*|href]:not([*|href^="#"]):not([*|href^="data:"])');
  elementsWithXlink.forEach(el => {
    el.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
  });
  
  // Remove href attributes that point to external resources
  const elementsWithHref = svgElement.querySelectorAll('[href]:not([href^="#"]):not([href^="data:"])');
  elementsWithHref.forEach(el => {
    el.removeAttribute('href');
  });
  
  // Remove any script elements
  const scripts = svgElement.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove any foreignObject elements which might contain external content
  const foreignObjects = svgElement.querySelectorAll('foreignObject');
  foreignObjects.forEach(fo => fo.remove());
  
  // Serialize back to string
  return new XMLSerializer().serializeToString(svgElement);
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy blob to clipboard (if supported)
 */
export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  if (!(navigator.clipboard as any)?.write) {
    throw new Error('Clipboard API not supported');
  }
  
  const clipboardItem = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([clipboardItem]);
}