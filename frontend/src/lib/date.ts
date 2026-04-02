export function formatUpdatedAt(dateValue: string): string {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
