import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogContent from './BlogContent';

export const metadata: Metadata = {
  title: 'Lawn Care Tips Madison WI | Expert Blog | TG Yard Care',
  description: 'Expert lawn care advice from Madison pros. Seasonal guides, maintenance tips & landscaping insights to keep your yard beautiful year-round. Free tips!',
  keywords: 'lawn care tips Madison, Wisconsin landscaping advice, seasonal lawn guides, yard maintenance blog',
  alternates: {
    canonical: 'https://tgyardcare.com/blog',
  },
  openGraph: {
    title: 'Lawn Care Tips Madison WI | Expert Blog | TG Yard Care',
    description: 'Expert lawn care advice from Madison pros. Seasonal guides, maintenance tips & landscaping insights to keep your yard beautiful year-round.',
    url: 'https://tgyardcare.com/blog',
  },
};

export default function BlogPage() {
  return (
    <Suspense>
      <BlogContent />
    </Suspense>
  );
}
