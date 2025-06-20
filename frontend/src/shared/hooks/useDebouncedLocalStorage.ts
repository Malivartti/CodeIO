import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebouncedLocalStorage = <T>(key: string, defaultValue: T, delay = 300) => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const timeoutRef = useRef<number | null>(null);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setState((currentState) => {
      const valueToStore = value instanceof Function ? value(currentState) : value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }, delay);

      return valueToStore;
    });
  }, [key, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setValue] as const;
};
