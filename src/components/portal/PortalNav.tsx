'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: '\u229E' },
  { label: 'Schedule', href: '/portal/schedule', icon: '\uD83D\uDCC5' },
  { label: 'History', href: '/portal/history', icon: '\uD83D\uDCCB' },
  { label: 'Invoices', href: '/portal/invoices', icon: '\uD83D\uDCB3' },
  { label: 'Referral', href: '/portal/referral', icon: '\uD83C\uDF81' },
];

export default function PortalNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/portal/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-40 border-r"
        style={{ background: 'rgba(5,13,7,0.95)', borderColor: 'rgba(34,197,94,0.1)', backdropFilter: 'blur(12px)' }}>

        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span style={{ color: '#22c55e' }}>&#x2726;</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>TotalGuard</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Customer Portal</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    color: isActive ? '#22c55e' : 'rgba(255,255,255,0.5)',
                    background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                  }}
                  whileHover={{ x: 2 }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
          <p className="text-xs mb-3 truncate px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{userEmail}</p>
          <button onClick={handleSignOut} disabled={signingOut}
            className="w-full px-3 py-2 rounded-xl text-sm transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: 'rgba(5,13,7,0.97)', borderColor: 'rgba(34,197,94,0.12)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl"
                style={{ color: isActive ? '#22c55e' : 'rgba(255,255,255,0.4)' }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
