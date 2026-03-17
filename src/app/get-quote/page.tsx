import type { Metadata } from 'next';
import GetQuoteContent from './GetQuoteContent';

export const metadata: Metadata = {
  title: 'Get a Free Quote | TotalGuard Yard Care',
  description:
    "Get a custom lawn care quote in minutes. We'll look up your property and ask the right questions — then call you with an accurate price. Serving Madison, WI & Dane County.",
  alternates: {
    canonical: 'https://tgyardcare.com/get-quote',
  },
};

export default function GetQuotePage() {
  return <GetQuoteContent />;
}
