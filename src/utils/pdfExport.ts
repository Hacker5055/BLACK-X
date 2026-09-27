import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape' | 'p' | 'l';
  format?: string | [number, number];
  scale?: number;
  quality?: number;
  marginMm?: number;
  grayscale?: boolean;
}

/**
 * Downloads any HTML element as a high-quality PDF file.
 * Preserves RTL Arabic text, tables, QR codes, logos, and official styling.
 * Supports modern CSS color models including oklch, lab, and oklab via html2canvas-pro.
 * Automatically applies official high-contrast black & white (monochrome) rendering for official documents.
 */
export async function downloadElementAsPdf(
  elementOrSelector: HTMLElement | string,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    fileName = 'document.pdf',
    orientation = 'portrait',
    format = 'a4',
    scale = 2,
    quality = 0.98,
    marginMm = 8,
    grayscale = true, // Default to true for official black & white documents
  } = options;

  let element: HTMLElement | null = null;
  if (typeof elementOrSelector === 'string') {
    element = document.querySelector<HTMLElement>(elementOrSelector);
  } else {
    element = elementOrSelector;
  }

  if (!element) {
    console.error('Target element not found for PDF export');
    return;
  }

  try {
    // Generate high-resolution canvas with full support for modern CSS colors (oklch, etc.)
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc, clonedEl) => {
        // Ensure official documents are rendered with clean light paper background even if user is in dark mode
        clonedDoc.documentElement.classList.remove('dark');
        clonedDoc.body.classList.remove('dark');
        clonedDoc.body.style.backgroundColor = '#ffffff';

        if (clonedEl) {
          clonedEl.classList.remove('dark');
          if (grayscale) {
            clonedEl.style.filter = 'grayscale(100%) contrast(108%)';
          }
        }

        const pdfContentAttr = element?.getAttribute('data-pdf-content');
        if (pdfContentAttr) {
          const clonedTarget = clonedDoc.querySelector<HTMLElement>(`[data-pdf-content="${pdfContentAttr}"]`);
          if (clonedTarget) {
            clonedTarget.classList.remove('dark');
            if (grayscale) {
              clonedTarget.style.filter = 'grayscale(100%) contrast(108%)';
            }
          }
        }
      },
      ignoreElements: (el) => {
        return (
          el.classList.contains('print:hidden') ||
          el.getAttribute('data-pdf-ignore') === 'true'
        );
      },
    });

    // If grayscale mode is enabled, convert canvas pixels to high-definition monochrome
    // for standard, official black-and-white bank & legal document reproduction
    if (grayscale) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imgData.data;
          const numPixels = pixels.length;
          for (let i = 0; i < numPixels; i += 4) {
            // Standard ITU-R BT.601 grayscale conversion formula
            const gray = Math.round(
              0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
            );
            pixels[i] = gray;
            pixels[i + 1] = gray;
            pixels[i + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (canvasErr) {
          console.warn('Canvas pixel monochrome conversion note:', canvasErr);
        }
      }
    }

    const isLandscape = orientation === 'landscape' || orientation === 'l';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const printableWidth = pageWidth - marginMm * 2;
    const printableHeight = pageHeight - marginMm * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate PDF height corresponding to full image width
    const imgHeightMm = (canvasHeight * printableWidth) / canvasWidth;

    const imgData = canvas.toDataURL('image/jpeg', quality);

    // If the content fits on one page (with slight tolerance)
    if (imgHeightMm <= printableHeight + 5) {
      const yOffset = marginMm + Math.max(0, (printableHeight - imgHeightMm) / 6);
      pdf.addImage(imgData, 'JPEG', marginMm, yOffset, printableWidth, imgHeightMm);
    } else {
      // Multi-page document handling
      let heightLeft = imgHeightMm;
      let position = marginMm;

      // First page
      pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeightMm);
      heightLeft -= printableHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeightMm + marginMm;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', marginMm, position, printableWidth, imgHeightMm);
        heightLeft -= printableHeight;
      }
    }

    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(safeFileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Fallback: trigger native print if PDF generation encounters issues
    window.print();
  }
}
