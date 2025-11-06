// Convert 2025-05-31 to firefly format
export function parseDate(d: string) {
  return d.replace(/(\d{4}-\d{2}-\d{2})/, '$1T00:00:00Z');
}

// Convert firefly format to 2025-05-31
export function parseDateReverse(d: string) {
  return d.replace(/(\d{4}-\d{2}-\d{2})T00:00:00Z/, '$1')
}

// Format 2025-05-31T00:00:00Z to 31 May 2025
export function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}
