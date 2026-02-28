'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ChatBot component with SSR disabled
const ChatBot = dynamic(() => import('./ChatBot').then(m => ({ default: m.ChatBot })), { ssr: false });

export function DeferredChatBot() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer loading until after initial paint and user interaction or timeout
    const loadAfterInteraction = () => {
      setShouldLoad(true);
      cleanup();
    };

    // Load after 3 seconds or first user interaction, whichever comes first
    const timeout = setTimeout(loadAfterInteraction, 3000);

    const interactionEvents = ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'];

    const handleInteraction = () => {
      // Small delay after interaction to not block the interaction
      requestAnimationFrame(() => {
        loadAfterInteraction();
      });
    };

    const cleanup = () => {
      clearTimeout(timeout);
      interactionEvents.forEach(event => {
        window.removeEventListener(event, handleInteraction, { capture: true });
      });
    };

    // Add listeners with passive option for better scroll performance
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleInteraction, {
        capture: true,
        once: true,
        passive: true
      } as AddEventListenerOptions);
    });

    return cleanup;
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return <ChatBot />;
}
