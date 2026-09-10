// Official Default SVG Logo and Resilient Logo Resolver for Samriddhi SFMS
// Storing as an embedded Data URI guarantees it displays 100% reliably in ANY environment
// (GitHub Pages, cPanel root/subfolder, offline, etc.) without 404 path issues.

export const DEFAULT_SAMRIDDHI_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#047857" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Background Rounded Shield -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)" stroke="#10b981" stroke-width="8" stroke-opacity="0.3" filter="url(#glow)" />

  <!-- Inner Subtle Accent Ring -->
  <rect x="44" y="44" width="424" height="424" rx="92" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.5" stroke-dasharray="16 8" />

  <!-- Central Finance Shield & Growth Symbol -->
  <g transform="translate(256, 256)">
    <!-- Protective Shield Base -->
    <path d="M 0 -130 L 110 -80 C 110 50 60 130 0 160 C -60 130 -110 50 -110 -80 Z" fill="#064e3b" stroke="url(#goldGrad)" stroke-width="12" stroke-linejoin="round" />

    <!-- Growth Bars / Rising Chart Pillar -->
    <rect x="-64" y="10" width="22" height="45" rx="6" fill="url(#accentGrad)" />
    <rect x="-26" y="-25" width="22" height="80" rx="6" fill="url(#accentGrad)" />
    <rect x="12" y="-60" width="22" height="115" rx="6" fill="url(#accentGrad)" />
    <rect x="50" y="-95" width="22" height="150" rx="6" fill="url(#goldGrad)" />

    <!-- Rising Star / Sprout on Top Right -->
    <circle cx="61" cy="-115" r="14" fill="#fde047" />
    <path d="M 61 -135 L 64 -119 L 80 -115 L 64 -111 L 61 -95 L 58 -111 L 42 -115 L 58 -119 Z" fill="#ffffff" />

    <!-- Bangla "সম" Typography Emblem at Bottom Arc -->
    <circle cx="0" cy="50" r="32" fill="#022c22" stroke="url(#goldGrad)" stroke-width="4" />
    <text x="0" y="61" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="900" fill="#fde047" text-anchor="middle">সম</text>
  </g>
</svg>`;

export const DEFAULT_SAMRIDDHI_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  DEFAULT_SAMRIDDHI_LOGO_SVG
)}`;

/**
 * Resolves any logo URL string safely:
 * - If empty, missing, or pointing to old /favicon.svg, returns the embedded Data URI.
 * - If it's already a Data URI or absolute HTTP/HTTPS URL, returns as-is.
 * - Handles relative paths so GitHub Pages or cPanel subfolders don't 404.
 */
export function resolveLogo(logoUrl?: string | null): string {
  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.trim()) {
    return DEFAULT_SAMRIDDHI_LOGO_DATA_URI;
  }

  const trimmed = logoUrl.trim();

  // Any legacy or relative reference to favicon.svg is converted to the embedded SVG Data URI
  if (
    trimmed === '/favicon.svg' ||
    trimmed === './favicon.svg' ||
    trimmed === 'favicon.svg' ||
    trimmed.endsWith('/favicon.svg')
  ) {
    return DEFAULT_SAMRIDDHI_LOGO_DATA_URI;
  }

  // Already an embedded data URI or fully qualified external link
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // If a root-relative path was stored (e.g. "/images/logo.png"), convert to relative "./images/logo.png"
  // so subfolders (GitHub Pages / cPanel subdirectories) do not 404
  if (trimmed.startsWith('/')) {
    return '.' + trimmed;
  }

  return trimmed;
}
