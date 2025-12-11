// Olive Baby Web - Timer Hook
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
  onTick?: (seconds: number) => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { initialSeconds = 0, autoStart = false, onTick } = options;
  
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const start = useCallback((fromSeconds?: number) => {
    if (fromSeconds !== undefined) {
      setSeconds(fromSeconds);
    }
    startTimeRef.current = new Date();
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
    startTimeRef.current = null;
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    const finalSeconds = seconds;
    setSeconds(initialSeconds);
    startTimeRef.current = null;
    return finalSeconds;
  }, [seconds, initialSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newValue = prev + 1;
          onTick?.(newValue);
          return newValue;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick]);

  // Calculate seconds from start time (for resuming)
  const calculateElapsed = useCallback((startTime: Date) => {
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / 1000);
  }, []);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    stop,
    setSeconds,
    calculateElapsed,
    startTime: startTimeRef.current,
  };
}
