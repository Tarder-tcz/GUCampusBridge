/**
 * Formats an ISO date string or timestamp into dynamic relative time (e.g. 1m ago, 2h ago, 1d ago, 2w ago, 1mo ago, 1y ago).
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return 'Just now';
  if (dateInput === 'Just now') return 'Just now';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return dateInput; // Return as-is if raw static string like "10m ago"
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
