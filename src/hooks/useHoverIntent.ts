import { useRef, useCallback } from 'react';

interface UseHoverIntentOptions {
  /** Delay before onOpen fires (ms) — prevents accidental hover-throughs */
  openDelay?: number;
  /** Grace period before onClose fires (ms) — forgiveness zone */
  closeDelay?: number;
  onOpen: () => void;
  onClose: () => void;
}

export function useHoverIntent({
  openDelay = 120,
  closeDelay = 250,
  onOpen,
  onClose,
}: UseHoverIntentOptions) {
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = useRef(false);

  const handleMouseEnter = useCallback(() => {
    // Cancel any pending close
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    // If already open, no delay needed
    if (isOpen.current) return;

    // Delay open to detect intent
    openTimer.current = setTimeout(() => {
      isOpen.current = true;
      onOpen();
    }, openDelay);
  }, [openDelay, onOpen]);

  const handleMouseLeave = useCallback(() => {
    // Cancel any pending open
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }

    // Grace period before close
    closeTimer.current = setTimeout(() => {
      isOpen.current = false;
      onClose();
    }, closeDelay);
  }, [closeDelay, onClose]);

  // Cleanup function for unmount
  const cleanup = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return { handleMouseEnter, handleMouseLeave, cleanup };
}
