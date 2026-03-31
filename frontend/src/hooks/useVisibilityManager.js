import { useEffect, useState, useRef } from 'react';

export const useVisibilityManager = (isActive) => {
  const [distractions, setDistractions] = useState(0);
  const [isDistracted, setIsDistracted] = useState(false);
  
  // In seconds
  const [activeTime, setActiveTime] = useState(0);
  const timerRef = useRef(null);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isActive) return;

      if (document.hidden) {
        // User switched tabs or minimized
        setIsDistracted(true);
        setDistractions((prev) => prev + 1);
        
        // Stop timer when hidden based on user requirement (mark as distraction)
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        // User returned
        setIsDistracted(false);
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            setActiveTime((prev) => prev + 1);
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial timer start
    if (isActive && !document.hidden && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  return { activeTime, distractions, isDistracted, setActiveTime, setDistractions };
};
