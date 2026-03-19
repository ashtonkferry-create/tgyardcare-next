'use client';

import { useState, useEffect } from 'react';
import { Phone, FileText } from 'lucide-react';
import { useSeasonalTheme } from '@/contexts/SeasonalThemeContext';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';

const seasonalCtaBg: Record<string, string> = {
  summer: '#052e16',
  fall:   '#1a0d00',
  winter: '#020810',
};

const seasonalBtnGradient: Record<string, string> = {
  summer: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-900/30',
  fall:   'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/30',
  winter: 'from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-900/30',
};

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { activeSeason } = useSeasonalTheme();

  const ctaBg = seasonalCtaBg[activeSeason] ?? seasonalCtaBg.summer;
  const btnGradient = seasonalBtnGradient[activeSeason] ?? seasonalBtnGradient.summer;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      setVisible(scrollY > 500);
      setAtFooter(scrollY + winHeight > docHeight - 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const show = visible && !atFooter;

  const handleCTATap = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ease-out ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ backgroundColor: ctaBg }}
    >
      <div
        className="backdrop-blur-xl border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        style={{ backgroundColor: `${ctaBg}f2` }}
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => { handleCTATap(); setQuoteOpen(true); }}
            className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${btnGradient} text-white font-semibold text-sm rounded-lg py-3 px-4 shadow-lg transition-all duration-200 relative overflow-hidden`}
          >
            {/* Subtle shimmer on the button */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer-sticky 3s infinite linear' }}
            />
            <FileText className="w-4 h-4 relative" />
            <span className="relative">Get Free Quote</span>
          </button>

          <a
            href="tel:+16085356057"
            onClick={handleCTATap}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-lg py-3 px-4 border border-white/10 transition-all duration-200 sm:min-w-[100px]"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Now</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
      {/* Quote modal */}
      <SmartQuoteFlow
        serviceSlug=""
        serviceName=""
        serviceEmoji="🌿"
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
      <style>{`
        @keyframes shimmer-sticky {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
