'use client';

import { useState, useEffect } from 'react';
import { Phone, FileText } from 'lucide-react';
import Link from 'next/link';

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      // Show after scrolling 500px
      setVisible(scrollY > 500);

      // Hide when near footer (last 300px)
      setAtFooter(scrollY + winHeight > docHeight - 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const show = visible && !atFooter;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-transform duration-300 ease-out ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Glass bar */}
      <div className="bg-[#0a1f14]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          {/* Primary CTA */}
          <Link
            href="/get-quote"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm rounded-lg py-3 px-4 shadow-lg shadow-emerald-900/30 transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            Get Free Quote
          </Link>

          {/* Phone CTA */}
          <a
            href="tel:+16085356057"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-sm rounded-lg py-3 px-4 border border-white/10 transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        </div>
      </div>
    </div>
  );
}
