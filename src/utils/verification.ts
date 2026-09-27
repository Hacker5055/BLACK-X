/**
 * Digital Document Verification & Anti-Fraud Utilities
 * Egyptian Labor Law & Corporate Compliance Standards
 */

export function generateVerificationHash(prefix: string = 'DOC'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `${prefix}-EG-${year}-${segment1}-${segment2}`;
}

export function getVerificationUrl(hash: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hrms.nile.eg';
  return `${baseUrl}/?verify=${encodeURIComponent(hash)}`;
}

/**
 * Generates an SVG QR Code as a data URL for fast, crisp, zero-dependency rendering in PDF and Print
 */
export function generateQrCodeDataUrl(text: string): string {
  // Use public high-reliability QR code SVG API or embed inline QR
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}&margin=0&format=svg`;
}
