'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const origin = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/portal/auth/callback`,
      },
    });

    setIsLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#052e16' }}>
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(34,197,94,0.06) 0%, transparent 70%)'
      }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1" fill="#22c55e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span style={{ color: '#22c55e', fontSize: '16px' }}>&#x2726;</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              TotalGuard
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Customer Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Enter your email to receive a secure login link
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(34,197,94,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSubmit}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-all duration-200 mb-4"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />

                {error && (
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                  style={{ background: '#22c55e', color: '#052e16' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Sending link...' : 'Send Magic Link'}
                </motion.button>

                <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No password needed. Link expires in 10 minutes.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
                >
                  <span style={{ color: '#22c55e', fontSize: '28px' }}>&#x2713;</span>
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Check your inbox
                </h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  We sent a login link to <strong className="text-white">{email}</strong>.<br />
                  Link expires in 10 minutes.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-xs underline"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Try a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer link */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Link href="/" className="hover:text-white transition-colors">&larr; Back to TotalGuard</Link>
        </p>
      </motion.div>
    </div>
  );
}
