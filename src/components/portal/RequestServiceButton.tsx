'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES = ['Lawn Mowing','Fertilization & Weed Control','Gutter Cleaning','Gutter Guard Installation','Fall Cleanup','Spring Cleanup','Snow Removal','Hardscaping','Mulching','Aeration','Leaf Removal','Pruning','Weeding','Garden Bed Care','Power Washing'];

export default function RequestServiceButton({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType) return;
    setSubmitting(true);
    await fetch('/api/portal/request-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, serviceType, preferredDate, notes }),
    });
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); setSubmitting(false); setServiceType(''); setPreferredDate(''); setNotes(''); }, 2000);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        + Request Additional Service
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-2xl p-8"
              style={{ background: '#0a1a0e', border: '1px solid rgba(34,197,94,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
                    <span style={{ color: '#22c55e', fontSize: '28px' }}>&#x2713;</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Request Sent!</h3>
                  <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>We&apos;ll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>Request a Service</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.6)' }}>Service Type *</label>
                      <select value={serviceType} onChange={e => setServiceType(e.target.value)} required
                        className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="">Select a service...</option>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.6)' }}>Preferred Date</label>
                      <input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.6)' }}>Notes</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                        placeholder="Any special instructions or areas of concern..."
                        className="w-full rounded-xl px-4 py-3 text-white text-sm resize-none outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setOpen(false)}
                      className="flex-1 py-3 rounded-xl text-sm" style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Cancel
                    </button>
                    <motion.button type="submit" disabled={!serviceType || submitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                      style={{ background: '#22c55e', color: '#050d07' }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {submitting ? 'Sending...' : 'Send Request'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
