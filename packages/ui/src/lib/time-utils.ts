/**
 * Flexible time utility functions for UI components
 * Supports configurable intervals and validation strategies
 */

export type TimeValidationStrategy = 'none' | 'duplicates' | 'overlaps';

export interface TimeUtilsConfig {
  /** Interval in minutes (15, 30, etc.) */
  intervalMinutes?: number;
  /** Validation strategy to use */
  validationStrategy?: TimeValidationStrategy;
}

/**
 * Generate all available start times with configurable intervals
 * @param intervalMinutes - Interval between times in minutes (default: 15)
 * @returns Array of time strings in HH:MM format
 */
export function generateAvailableStartTimes(intervalMinutes: number = 15): string[] {
  const times: string[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  
  return times;
}

/**
 * Convert time string to total minutes from 00:00
 * @param time - Time in HH:MM format
 * @returns Total minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Check for duplicate start times
 * @param startTimes - Array of start time strings
 * @returns True if no duplicates exist
 */
export function validateNoDuplicates(startTimes: string[]): boolean {
  const uniqueTimes = new Set(startTimes);
  return uniqueTimes.size === startTimes.length;
}

/**
 * Check for overlapping time ranges
 * @param startTimes - Array of start time strings
 * @param durationHours - Duration of each slot in hours
 * @returns True if no overlaps exist
 */
export function validateNoOverlaps(startTimes: string[], durationHours: number): boolean {
  if (startTimes.length <= 1) return true;
  
  const timeRanges = startTimes.map(startTime => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + (durationHours * 60);
    return { start: startMinutes, end: endMinutes };
  });
  
  timeRanges.sort((a, b) => a.start - b.start);
  
  for (let i = 0; i < timeRanges.length - 1; i++) {
    if (timeRanges[i]!.end > timeRanges[i + 1]!.start) {
      return false; // Overlap detected
    }
  }
  
  return true;
}

/**
 * Flexible start times validation with configurable strategy
 * @param startTimes - Array of start time strings
 * @param durationHours - Duration of each slot in hours
 * @param strategy - Validation strategy to use
 * @returns True if validation passes
 */
export function validateStartTimes(
  startTimes: string[], 
  durationHours: number, 
  strategy: TimeValidationStrategy = 'duplicates'
): boolean {
  switch (strategy) {
    case 'none':
      return true;
    case 'duplicates':
      return validateNoDuplicates(startTimes);
    case 'overlaps':
      return validateNoDuplicates(startTimes) && validateNoOverlaps(startTimes, durationHours);
    default:
      return validateNoDuplicates(startTimes);
  }
}

/**
 * Default time utilities for common use cases
 */
export const TimeUtils = {
  /** 15-minute intervals, duplicates only (like Plotty) */
  plottyStyle: {
    generateTimes: () => generateAvailableStartTimes(15),
    validateTimes: (times: string[], duration: number) => validateStartTimes(times, duration, 'duplicates')
  },
  
  /** 30-minute intervals, overlaps validation (like current UI component) */
  uiComponentStyle: {
    generateTimes: () => generateAvailableStartTimes(30),
    validateTimes: (times: string[], duration: number) => validateStartTimes(times, duration, 'overlaps')
  },
  
  /** Custom configuration */
  custom: (config: TimeUtilsConfig) => ({
    generateTimes: () => generateAvailableStartTimes(config.intervalMinutes || 15),
    validateTimes: (times: string[], duration: number) => 
      validateStartTimes(times, duration, config.validationStrategy || 'duplicates')
  })
};