import baseUrl from '../baseUrl/baseUrl';

/**
 * Returns a usable URL for a stored file_path.
 * - If already a full https:// URL (B2/CDN) → return as-is
 * - If a relative path → prepend baseUrl
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  // relative path — strip leading slash if present
  const rel = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${baseUrl}${rel}`;
};

/**
 * Open/download a file in a new tab
 */
export const openFile = (filePath) => {
  const url = getFileUrl(filePath);
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};
