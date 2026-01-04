// Olive Baby Web - useTimezone Hook
// Manages user timezone with persistence and auto-detection

import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DEFAULT_TIMEZONE, 
  detectUserTimezone, 
  formatDateInTimezone,
  formatTimeInTimezone,
  formatDateTimeInTimezone,
  parseLocalDateTimeToUTC,
  formatUTCToLocalDateTime,
  formatRelativeTime,
} from '../lib/timezone';
import { api } from '../services/api';

// Types
interface TimezoneState {
  timezone: string;
  isLoaded: boolean;
  setTimezone: (timezone: string) => void;
  setLoaded: (loaded: boolean) => void;
}

// Zustand store for timezone
export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set) => ({
      timezone: DEFAULT_TIMEZONE,
      isLoaded: false,
      setTimezone: (timezone) => set({ timezone }),
      setLoaded: (loaded) => set({ isLoaded: loaded }),
    }),
    {
      name: 'olive-baby-timezone',
    }
  )
);

/**
 * Hook to manage user timezone
 */
export function useTimezone() {
  const { timezone, isLoaded, setTimezone, setLoaded } = useTimezoneStore();

  // Load timezone from server or detect from browser
  const loadTimezone = useCallback(async () => {
    try {
      const response = await api.get('/settings/timezone');
      if (response.data?.data?.timezone) {
        setTimezone(response.data.data.timezone);
      } else {
        // Fallback to browser detection
        const detected = detectUserTimezone();
        setTimezone(detected);
        // Save to server
        await api.put('/settings/timezone', { timezone: detected });
      }
    } catch {
      // If API fails, use browser detection
      const detected = detectUserTimezone();
      setTimezone(detected);
    } finally {
      setLoaded(true);
    }
  }, [setTimezone, setLoaded]);

  // Update timezone on server
  const updateTimezone = useCallback(async (newTimezone: string) => {
    try {
      await api.put('/settings/timezone', { timezone: newTimezone });
      setTimezone(newTimezone);
    } catch (error) {
      console.error('Failed to update timezone:', error);
      throw error;
    }
  }, [setTimezone]);

  // Formatting helpers bound to current timezone
  const formatDate = useCallback(
    (date: Date | string) => formatDateInTimezone(date, timezone),
    [timezone]
  );

  const formatTime = useCallback(
    (date: Date | string) => formatTimeInTimezone(date, timezone),
    [timezone]
  );

  const formatDateTime = useCallback(
    (date: Date | string) => formatDateTimeInTimezone(date, timezone),
    [timezone]
  );

  const toUTC = useCallback(
    (localDateTime: string) => parseLocalDateTimeToUTC(localDateTime, timezone),
    [timezone]
  );

  const fromUTC = useCallback(
    (utcDate: Date | string) => formatUTCToLocalDateTime(utcDate, timezone),
    [timezone]
  );

  const relative = useCallback(
    (date: Date | string) => formatRelativeTime(date),
    []
  );

  return {
    timezone,
    isLoaded,
    loadTimezone,
    updateTimezone,
    formatDate,
    formatTime,
    formatDateTime,
    toUTC,
    fromUTC,
    relative,
  };
}

/**
 * Provider component to initialize timezone on app load
 */
export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const { loadTimezone, isLoaded } = useTimezone();

  useEffect(() => {
    if (!isLoaded) {
      loadTimezone();
    }
  }, [loadTimezone, isLoaded]);

  return <>{children}</>;
}

export default useTimezone;
