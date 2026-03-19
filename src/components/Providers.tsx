'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ChatProvider } from '@/contexts/ChatContext';
import { SeasonalThemeProvider } from '@/contexts/SeasonalThemeContext';
import BackToTop from '@/components/BackToTop';
import { DeferredChatBot } from '@/components/DeferredChatBot';
import { ExitIntentModal } from '@/components/ExitIntentModal';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          <SeasonalThemeProvider>
            <Toaster />
            <Sonner />
            <BackToTop />
            <DeferredChatBot />
            <ExitIntentModal />

            {children}
          </SeasonalThemeProvider>
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
