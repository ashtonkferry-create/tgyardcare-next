import type { Metadata } from 'next';
import GalleryContent from './GalleryContent';

export const metadata: Metadata = {
  title: 'Project Gallery | 33+ Real Transformations | TotalGuard Madison',
  description: "Browse 33+ real before & after photos from TotalGuard Yard Care projects across Madison WI. Lawn mowing, mulching, gutters, pruning, seasonal cleanup — no stock photos.",
  keywords: 'before after lawn care Madison, lawn transformation photos, landscaping portfolio Madison WI, yard makeover gallery, professional lawn results, garden bed photos, gutter cleaning before after',
  alternates: {
    canonical: 'https://tgyardcare.com/gallery',
  },
  openGraph: {
    title: 'Project Gallery | 33+ Real Transformations | TotalGuard Madison',
    description: 'Browse 33+ real before & after photos from TotalGuard Yard Care projects across Madison WI. Lawn mowing, mulching, gutters, pruning, seasonal cleanup — no stock photos.',
    url: 'https://tgyardcare.com/gallery',
    siteName: 'TG Yard Care',
    locale: 'en_US',
    type: 'website',
  },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
