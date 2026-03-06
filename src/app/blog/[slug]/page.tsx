import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import SpringLawnCareContent from '../spring-lawn-care-checklist/SpringLawnCareContent';
import FallCleanupImportanceContent from '../fall-cleanup-importance/FallCleanupImportanceContent';
import DynamicBlogContent from './DynamicBlogContent';

const HARDCODED_SLUGS: Record<string, React.ComponentType> = {
  'spring-lawn-care-checklist': SpringLawnCareContent,
  'fall-cleanup-importance': FallCleanupImportanceContent,
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getPost(slug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Hardcoded posts have their own metadata in their page files
  if (HARDCODED_SLUGS[slug]) {
    return {};
  }

  const post = await getPost(slug);
  if (!post) {
    return { title: 'Post Not Found | TotalGuard Yard Care' };
  }

  const title = `${post.title} | TotalGuard Yard Care Blog`;
  const description = post.meta_description || post.excerpt;
  const canonical = `https://tgyardcare.com/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.seo_keywords?.join(', ') || undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: canonical,
      siteName: 'TotalGuard Yard Care',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      ...(post.image_url ? { images: [{ url: post.image_url }] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Render hardcoded posts with their existing components
  const HardcodedComponent = HARDCODED_SLUGS[slug];
  if (HardcodedComponent) {
    return <HardcodedComponent />;
  }

  // Fetch dynamic post from Supabase
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <DynamicBlogContent
      title={post.title}
      slug={post.slug}
      excerpt={post.excerpt}
      content={post.content}
      category={post.category || 'service-guides'}
      published_at={post.published_at}
      reading_time={
        Math.ceil(post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
      }
      meta_description={post.meta_description || post.excerpt}
    />
  );
}
