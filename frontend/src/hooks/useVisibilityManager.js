import { useEffect, useState, useRef, useCallback } from 'react';

export const useVisibilityManager = (isActive) => {
  const [distractions, setDistractions] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  const [activeTime, setActiveTime] = useState(0);
  const timerRef = useRef(null);

  // Start/stop timer helper — stable references via useCallback
  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      // If session is paused/stopped externally, stop immediately
      stopTimer();
      setIsDistracted(false);
      return;
    }

    // Start immediately if visible
    if (!document.hidden) {
      startTimer();
    }

    const handleVisibilityChange = () => {
      if (!isActive) return;

      if (document.hidden) {
        setIsDistracted(true);
        setDistractions((prev) => prev + 1);
        stopTimer();
      } else {
        setIsDistracted(false);
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTimer();
    };
  }, [isActive, startTimer, stopTimer]);

  return { activeTime, distractions, isDistracted, setActiveTime, setDistractions };
};
