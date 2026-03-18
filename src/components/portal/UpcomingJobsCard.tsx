'use client';
import { motion } from 'framer-motion';

interface Job {
  id: string;
  scheduled_date: string;
  service_type: string;
  description: string | null;
  time_window: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#22c55e',
  confirmed: '#3b82f6',
  en_route: '#f97316',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return { month: d.toLocaleDateString('en-US', { month: 'short' }), day: d.getDate() };
}

export default function UpcomingJobsCard({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.12)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Upcoming Jobs</h2>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
          {jobs.length} scheduled
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <p className="text-sm mb-1">No upcoming jobs scheduled</p>
          <p className="text-xs">Request a service below to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const { month, day } = formatDate(job.scheduled_date);
            const statusColor = STATUS_COLORS[job.status] ?? '#22c55e';
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Date badge */}
                <div className="shrink-0 text-center w-12 rounded-lg py-2" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-[10px] uppercase font-medium" style={{ color: '#22c55e' }}>{month}</p>
                  <p className="text-xl font-bold text-white leading-none">{day}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{job.service_type}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{job.time_window}</p>
                  {job.description && <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{job.description}</p>}
                </div>
                <div className="shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: `${statusColor}18`, color: statusColor }}>
                    {job.status}
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
