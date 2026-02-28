import type { Metadata } from 'next';
import FitchburgContent from './FitchburgContent';

export const metadata: Metadata = {
  title: 'Lawn Care Fitchburg WI | Same Crew Weekly | TG Yard Care',
  description: 'Top-rated lawn care services in Fitchburg, Wisconsin. Expert mowing, mulching, gutter cleaning & seasonal services. 4.9★ rated. Same-day quotes. Call today!',
  keywords: 'Fitchburg lawn care, Fitchburg landscaping, lawn mowing Fitchburg WI, gutter cleaning Fitchburg, mulching Fitchburg',
};

export default function FitchburgPage() {
  return <FitchburgContent />;
}
