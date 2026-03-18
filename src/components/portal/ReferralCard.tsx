'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ReferralEvent {
  id: string;
  status: string;
  referred_email: string;
  referred_name: string | null;
}

export default function ReferralCard({
  referralCode, referrals, totalCredit,
}: { referralCode: string; referrals: ReferralEvent[]; totalCredit: number; }) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://tgyardcare.com/r/${referralCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pending = referrals.filter(r => r.status === 'pending').length;
  const qualified = referrals.filter(r => r.status === 'qualified').length;
  const credited = referrals.filter(r => r.status === 'credited').length;

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.12)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Referral Program</h2>
        {totalCredit > 0 && (
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
            ${totalCredit} earned
          </span>
        )}
      </div>

      {/* How it works */}
      <div className="flex items-start gap-4 mb-6 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
        <div className="flex-1 space-y-2">
          {['Share your link', 'They book a service', 'You both get $50 off'].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>{i + 1}</div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referral link */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 rounded-xl px-4 py-3 text-sm font-mono truncate"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
          tgyardcare.com/r/{referralCode}
        </div>
        <motion.button
          onClick={copyLink}
          className="px-4 py-3 rounded-xl text-sm font-semibold shrink-0"
          style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Shared', value: referrals.length, color: 'rgba(255,255,255,0.5)' },
          { label: 'Pending', value: pending + qualified, color: '#f59e0b' },
          { label: 'Credited', value: credited, color: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)' }}>
            <p className="text-xl font-bold" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
