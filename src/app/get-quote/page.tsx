import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import QuoteFlow from '@/components/QuoteFlow';

export const metadata: Metadata = {
  title: 'Get a Free Quote | TotalGuard Yard Care',
  description:
    "Get a custom lawn care quote in minutes. Tell us about your property and services needed — we'll reach out to schedule your free assessment. Serving Madison, WI & Dane County.",
  alternates: {
    canonical: 'https://tgyardcare.com/get-quote',
  },
};

export default function GetQuotePage() {
  return (
    <div className="min-h-screen" style={{ background: '#050d07' }}>
      <Navigation />
      <QuoteFlow />
      <Footer showCloser={false} />
    </div>
  );
}
