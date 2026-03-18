'use client';
import { motion } from 'framer-motion';

interface Invoice {
  id: string;
  invoice_date: string;
  due_date: string | null;
  amount_cents: number;
  status: 'pending' | 'paid' | 'overdue';
  description: string | null;
  invoice_number: string | null;
}

const STATUS_CONFIG = {
  paid: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Paid' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
  overdue: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Overdue' },
};

export default function InvoicesCard({ invoices }: { invoices: Invoice[] }) {
  const totalOwed = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount_cents, 0);

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.12)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Invoices</h2>
        {totalOwed > 0 && (
          <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
            ${(totalOwed / 100).toFixed(2)} outstanding
          </span>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <p className="text-sm mb-1">All clear &mdash; no invoices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, i) => {
            const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{inv.description ?? `Invoice ${inv.invoice_number ?? inv.id.slice(0, 6).toUpperCase()}`}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(inv.invoice_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${(inv.amount_cents / 100).toFixed(2)}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
