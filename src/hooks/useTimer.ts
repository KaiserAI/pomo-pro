import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = () => setIsActive(!isActive);

  const reset = (newTime?: number) => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSeconds(newTime ?? initialSeconds);
  };

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds]);

  return { seconds, setSeconds, isActive, toggle, reset };
};
