export function safePath(d) {
  if (!d || typeof d !== 'string') return '';
  // Remove common problematic characters (ellipsis) and normalize whitespace
  const cleaned = d.replace(/\u2026/g, '').replace(/\s+/g, ' ').trim();

  // Basic validation: allow commands and numbers, commas, spaces, dots, minus
  const invalid = /[^MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]/.test(cleaned);
  if (invalid) {
    console.warn('safePath: path contains unexpected characters, returning cleaned string', { original: d, cleaned });
  }

  return cleaned;
}
