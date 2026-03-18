'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

interface LeadMagnetCTAProps {
  variant?: 'inline' | 'sidebar';
  title?: string;
  description?: string;
  source?: string;
}

export default function LeadMagnetCTA({
  variant: _variant = 'inline',
  title,
  description,
  source = 'blog-post',
}: LeadMagnetCTAProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const season = getCurrentSeason();

  const displayTitle = title ?? `Get Your Free ${season} Lawn Checklist`;
  const displayDesc =
    description ?? 'Madison-specific tips sent straight to your inbox.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
    } catch {
      // Silently handle - the CTA is not critical
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <div
      className="my-8 rounded-2xl p-6"
      style={{
        background: 'rgba(34,197,94,0.05)',
        border: '1px solid rgba(34,197,94,0.15)',
        borderLeft: '3px solid #22c55e',
      }}
    >
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3
              className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {displayTitle}
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {displayDesc}
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-green-500/30"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-60"
                style={{ background: '#22c55e', color: '#ffffff' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? '...' : 'Send It'}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2"
          >
            <span className="text-2xl">✓</span>
            <p className="text-sm font-semibold text-white mt-1">
              Check your inbox!
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Your checklist is on the way.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
