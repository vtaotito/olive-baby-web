// Olive Baby Web - Timezone Utilities
// Handles timezone conversions for consistent date/time display

// Default timezone for Brazil
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

// Common Brazilian timezones
export const BRAZILIAN_TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)', offset: -3 },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)', offset: -4 },
  { value: 'America/Cuiaba', label: 'Cuiabá (GMT-4)', offset: -4 },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)', offset: -5 },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)', offset: -2 },
];

// All supported timezones
export const SUPPORTED_TIMEZONES = [
  ...BRAZILIAN_TIMEZONES,
  { value: 'America/New_York', label: 'Nova York (EST)', offset: -5 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: -8 },
  { value: 'Europe/London', label: 'Londres (GMT)', offset: 0 },
  { value: 'Europe/Lisbon', label: 'Lisboa (WET)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tóquio (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 11 },
];

/**
 * Detects the user's timezone from the browser
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Validates if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a date in a specific timezone
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    timeZone: timezone,
    ...options,
  });
}

/**
 * Formats date only in user's timezone
 */
export function formatDateInTimezone(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, timezone, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formats time only in user's timezone
 */
export function formatTimeInTimezone(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, timezone, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats date and time in user's timezone
 */
export function formatDateTimeInTimezone(
  date: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, timezone, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets current time in a specific timezone
 */
export function nowInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  const now = new Date();
  const localStr = now.toLocaleString('en-US', { timeZone: timezone });
  return new Date(localStr);
}

/**
 * Parses a datetime-local input value and converts to UTC Date
 * datetime-local inputs don't include timezone, so we need to interpret
 * the value as being in the user's timezone
 * @param localDateTimeString - String from datetime-local input (YYYY-MM-DDTHH:mm)
 * @param timezone - User's timezone
 * @returns ISO string in UTC
 */
export function parseLocalDateTimeToUTC(
  localDateTimeString: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const [datePart, timePart] = localDateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);

  const tempDate = new Date();
  const utcStr = tempDate.toLocaleString('en-US', { timeZone: 'UTC' });
  const tzStr = tempDate.toLocaleString('en-US', { timeZone: timezone });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  const offsetMs = tzDate.getTime() - utcDate.getTime();

  // Use Date.UTC so the raw numbers are treated as UTC, then subtract
  // the configured-timezone offset to get the real UTC instant.
  const rawUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const utcTime = new Date(rawUtc - offsetMs);

  return utcTime.toISOString();
}

/**
 * Converts a UTC Date to datetime-local format in user's timezone
 * @param utcDate - UTC Date or ISO string
 * @param timezone - User's timezone
 * @returns String in datetime-local format (YYYY-MM-DDTHH:mm)
 */
export function formatUTCToLocalDateTime(
  utcDate: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const d = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Format in the user's timezone
  const formatted = d.toLocaleString('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Convert from 'YYYY-MM-DD HH:mm' to 'YYYY-MM-DDTHH:mm'
  return formatted.replace(' ', 'T');
}

/**
 * Gets the timezone offset in hours
 */
export function getTimezoneOffset(timezone: string = DEFAULT_TIMEZONE): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Formats a relative time description
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days === 1 ? 'há 1 dia' : `há ${days} dias`;
  }
  if (hours > 0) {
    return hours === 1 ? 'há 1 hora' : `há ${hours} horas`;
  }
  if (minutes > 0) {
    return minutes === 1 ? 'há 1 minuto' : `há ${minutes} minutos`;
  }
  return 'agora';
}

/**
 * Gets start of day in user's timezone as UTC
 */
export function getStartOfDayUTC(
  date: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const localStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(localStr);
  localDate.setHours(0, 0, 0, 0);
  
  // Convert back to UTC
  return new Date(parseLocalDateTimeToUTC(
    `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}T00:00`,
    timezone
  ));
}

/**
 * Gets end of day in user's timezone as UTC
 */
export function getEndOfDayUTC(
  date: Date = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const localStr = date.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(localStr);
  localDate.setHours(23, 59, 59, 999);
  
  // Convert back to UTC
  return new Date(parseLocalDateTimeToUTC(
    `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}T23:59`,
    timezone
  ));
}

export default {
  DEFAULT_TIMEZONE,
  BRAZILIAN_TIMEZONES,
  SUPPORTED_TIMEZONES,
  detectUserTimezone,
  isValidTimezone,
  formatInTimezone,
  formatDateInTimezone,
  formatTimeInTimezone,
  formatDateTimeInTimezone,
  nowInTimezone,
  parseLocalDateTimeToUTC,
  formatUTCToLocalDateTime,
  getTimezoneOffset,
  formatRelativeTime,
  getStartOfDayUTC,
  getEndOfDayUTC,
};
