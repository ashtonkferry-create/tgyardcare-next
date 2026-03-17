import type { Metadata } from 'next';
import AnnualPlanContent from './AnnualPlanContent';

export const metadata: Metadata = {
  title: 'Build Your Custom Annual Lawn Care Plan | TotalGuard Yard Care',
  description:
    'Toggle services by season, see your price instantly, and lock in your annual lawn care plan. Save 15% when you bundle 3+ services. Serving Madison WI & Dane County.',
  keywords:
    'annual lawn care plan Madison WI, lawn care package Dane County, custom lawn maintenance plan, seasonal lawn care bundle, lawn care subscription Wisconsin',
  alternates: {
    canonical: 'https://tgyardcare.com/annual-plan',
  },
  openGraph: {
    title: 'Build Your Custom Annual Lawn Care Plan | TotalGuard Yard Care',
    description:
      'Toggle services by season, see your price instantly, and save 15% with a bundle. TotalGuard Yard Care — Madison, WI.',
    url: 'https://tgyardcare.com/annual-plan',
    siteName: 'TG Yard Care',
    locale: 'en_US',
    type: 'website',
  },
};

export default function AnnualPlanPage() {
  return <AnnualPlanContent />;
}
