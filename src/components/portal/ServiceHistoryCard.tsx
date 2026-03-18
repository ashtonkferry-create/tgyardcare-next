'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import RateCrewModal from './RateCrewModal';

interface ServiceRecord {
  id: string;
  service_date: string;
  service_type: string;
  description: string | null;
  amount_cents: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ServiceHistoryCard({
  history, ratedIds, customerId,
}: { history: ServiceRecord[]; ratedIds: Set<string>; customerId: string; }) {
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [localRated, setLocalRated] = useState<Set<string>>(new Set());

  const isRated = (id: string) => ratedIds.has(id) || localRated.has(id);

  return (
    <>
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.12)' }}>
        <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>Service History</h2>

        {history.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p className="text-sm">No completed services yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-3 bottom-3 w-px" style={{ background: 'rgba(34,197,94,0.15)' }} />
            <div className="space-y-4">
              {history.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-4 relative"
                >
                  {/* Circle on timeline */}
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>&#x2713;</span>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{record.service_type}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(record.service_date)}</p>
                        {record.description && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{record.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>${(record.amount_cents / 100).toFixed(2)}</p>
                        {!isRated(record.id) ? (
                          <button
                            onClick={() => setRatingFor(record.id)}
                            className="text-xs mt-1 underline transition-colors"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                          >
                            Rate visit
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#22c55e' }}>&#x2605; Rated</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      {ratingFor && (
        <RateCrewModal
          serviceRecordId={ratingFor}
          onClose={() => setRatingFor(null)}
          onSuccess={() => {
            setLocalRated(prev => new Set([...prev, ratingFor]));
            setRatingFor(null);
          }}
        />
      )}
    </>
  );
}
