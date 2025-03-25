import { useRef, useEffect } from 'react';

/**
 * A hook that ensures a function is called only once during component lifetime,
 * even if the component re-renders or hot reloads.
 */
export function useStableInitialization(fn: () => void | (() => void), deps: any[] = []) {
  const initialized = useRef(false);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  
  useEffect(() => {
    // Only run initialization once
    if (!initialized.current) {
      initialized.current = true;
      const result = fn();
      
      if (typeof result === 'function') {
        cleanup.current = result;
      }
    }
    
    // Always return the cleanup function
    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}