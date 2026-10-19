import { useCallback, useRef } from 'react';

// Prevents double submits: a second tap while a request is running is
// ignored, even before React re-renders the disabled button.
export function useSubmitLock() {
  const busy = useRef(false);
  return useCallback(async (run: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await run();
    } finally {
      busy.current = false;
    }
  }, []);
}
