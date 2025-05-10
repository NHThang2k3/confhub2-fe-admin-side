// src/hooks/useTimer.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export interface TimerControls {
  timeCounter: string;
  startTimer: () => void;
  stopTimer: () => void;
  isRunning: boolean;
}

export function useTimer(): TimerControls {
  const [timeCounter, setTimeCounter] = useState<string>('0.0s');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerInterval = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true); // Track mount status within the hook

  useEffect(() => {
      isMountedRef.current = true;
      // Cleanup on unmount
      return () => {
          isMountedRef.current = false;
          stopTimerInternal();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  const stopTimerInternal = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
      setIsRunning(false);
      // console.log("Timer stopped.");
    }
  };

  const stopTimer = useCallback(() => {
    stopTimerInternal();
  }, []);

  const startTimer = useCallback(() => {
    stopTimer(); // Ensure only one timer runs
    startTimeRef.current = Date.now();
    setTimeCounter('0.0s'); // Start with decimal
    setIsRunning(true);

    timerInterval.current = window.setInterval(() => {
        // Check mount status before updating state
        if (isMountedRef.current) {
            const elapsedTime = Date.now() - startTimeRef.current;
            const seconds = (elapsedTime / 1000).toFixed(1);
            setTimeCounter(`${seconds}s`);
        } else {
            // If component unmounted while timer was running, clear interval
            stopTimerInternal();
        }
    }, 100); // Update every 100ms for .1s precision
  }, [stopTimer]); // stopTimer is stable due to its own useCallback


  return { timeCounter, startTimer, stopTimer, isRunning };
}