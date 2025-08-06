/**
 * Shared formatting utilities for the Nully app
 */

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format session duration from start time to current time
 */
export function formatDuration(startTime: number): string {
  const duration = Math.floor((Date.now() - startTime) / 1000);
  if (duration < 60) return `${duration}s`;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}m ${seconds}s`;
}

/**
 * Format transfer speed in MB/s
 */
export function formatSpeed(speed: number): string {
  return `${speed.toFixed(2)} MB/s`;
}

/**
 * Format ETA (Estimated Time of Arrival) in seconds to human-readable format
 */
export function formatETA(seconds: number): string {
  if (seconds === 0 || !isFinite(seconds)) return '--';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}