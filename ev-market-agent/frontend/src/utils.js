export function formatCurrency(value) {
  if (value == null) return 'Price unavailable';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function formatDateTime(value) {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
