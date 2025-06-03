// Format video duration from seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) {
    return '00:00';
  }
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  // Format with leading zeros
  const minStr = mins.toString().padStart(2, '0');
  const secStr = secs.toString().padStart(2, '0');
  
  // Only include hours if the video is at least 1 hour long
  return hrs > 0 
    ? `${hrs}:${minStr}:${secStr}` 
    : `${minStr}:${secStr}`;
}

// Format date to a readable format
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  // If it's today, show time
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If it's yesterday, show "Yesterday"
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise, show date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
  });
}

// Format file size to human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}