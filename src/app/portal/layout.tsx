import { createClient } from '@/lib/supabase/server';
import PortalNav from '@/components/portal/PortalNav';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Don't render nav on login/auth pages (user won't be authenticated there)
  const showNav = !!user;

  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      {showNav && <PortalNav userEmail={user.email ?? ''} />}
      <main className={showNav ? 'lg:ml-64 min-h-screen' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
}
