'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RateCrewModal({
  serviceRecordId, onClose, onSuccess,
}: { serviceRecordId: string; onClose: () => void; onSuccess: () => void; }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch('/api/portal/rate-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRecordId, rating, comment }),
      });
      setSubmitted(true);
      setTimeout(onSuccess, 1200);
    } catch { setSubmitting(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="w-full max-w-md rounded-2xl p-8"
          style={{ background: '#0a1a0e', border: '1px solid rgba(34,197,94,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          {submitted ? (
            <div className="text-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="text-5xl mb-4">&#x2B50;</motion.div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Thank you!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Your rating helps us serve Madison better.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Rate Your Visit</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>How did we do?</p>

              {/* Stars */}
              <div className="flex gap-3 justify-center mb-6">
                {[1,2,3,4,5].map(star => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-4xl transition-all"
                    style={{ color: star <= (hovered || rating) ? '#f59e0b' : 'rgba(255,255,255,0.15)', filter: star <= (hovered || rating) ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'none' }}
                  >&#x2605;</motion.button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Optional comment for the crew..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: '#22c55e', color: '#050d07' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? 'Saving...' : 'Submit Rating'}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
