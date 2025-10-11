// Convert 2025-05-31 to firefly format
export function parseDate(d: string) {
  return d.replace(/(\d{4}-\d{2}-\d{2})/, '$1T00:00:00Z');
}

// Convert firefly format to 2025-05-31
export function parseDateReverse(d: string) {
  return d.replace(/(\d{4}-\d{2}-\d{2})T00:00:00Z/, '$1')
}
