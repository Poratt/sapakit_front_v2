// src/app/utils/date.utils.ts

/**
 * Converts a YYYY-MM-DD string to a Date object representing the specified date 
 * at midnight (00:00:00) in the LOCAL timezone. This ensures no timezone shifting issues.
 * @param dateString A string in YYYY-MM-DD format (e.g., "2025-07-25")
 * @returns A Date object set to midnight of the specified date in local time
 * @throws Error if the date string is invalid
 */
export function parseDateStringAsLocal(dateString: string): Date {
  // Validate input format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`Invalid date string format: ${dateString}. Expected YYYY-MM-DD.`);
  }

  const [year, month, day] = dateString.split('-').map(Number);

  // Validate numeric values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components in: ${dateString}`);
  }

  // Create a Date object in local timezone
  const date = new Date(year, month - 1, day);

  // Verify the date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date created from: ${dateString}`);
  }

  return date;
}

/**
 * Formats a Date object to a YYYY-MM-DD string for consistent server communication
 * @param date A Date object
 * @returns A string in YYYY-MM-DD format (e.g., "2025-07-25")
 */
export function formatDateToYYYYMMDD(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object');
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}