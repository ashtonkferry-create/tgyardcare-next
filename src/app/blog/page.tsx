import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
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

const POSTS_PER_PAGE = 9;

async function getInitialPosts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, count } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, published_at, content, category', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(0, POSTS_PER_PAGE - 1);

    return { posts: data || [], totalCount: count ?? 0 };
  } catch {
    return { posts: [], totalCount: 0 };
  }
}

export default async function BlogPage() {
  const { posts, totalCount } = await getInitialPosts();

  return (
    <Suspense>
      <BlogContent initialPosts={posts} initialTotalCount={totalCount} />
    </Suspense>
  );
}
