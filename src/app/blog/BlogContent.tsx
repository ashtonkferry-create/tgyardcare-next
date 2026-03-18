'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import SeasonalContentBanner from '@/components/SeasonalContentBanner';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  Clock,
  Leaf,
  Snowflake,
  Scissors,
  MapPin,
  HelpCircle,
  Rss,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';

const POSTS_PER_PAGE = 9;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  content: string;
  category: string;
}

const CATEGORIES = [
  { slug: 'all', name: 'All Posts', icon: null },
  { slug: 'seasonal-tips', name: 'Seasonal Tips', icon: Leaf },
  { slug: 'service-guides', name: 'Service Guides', icon: Scissors },
  { slug: 'local-guides', name: 'Local Guides', icon: MapPin },
  { slug: 'how-to', name: 'How-To', icon: HelpCircle },
  { slug: 'faq-answers', name: 'FAQ', icon: HelpCircle },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'seasonal-tips': { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  'service-guides': { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
  'local-guides': { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  'how-to': { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', text: '#8b5cf6' },
  'faq-answers': { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', text: '#06b6d4' },
  'lawn-care': { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
};

function getCategoryIcon(category: string) {
  switch (category) {
    case 'seasonal-tips':
      return <Leaf className="h-4 w-4" />;
    case 'service-guides':
      return <Scissors className="h-4 w-4" />;
    case 'local-guides':
      return <MapPin className="h-4 w-4" />;
    case 'how-to':
    case 'faq-answers':
      return <HelpCircle className="h-4 w-4" />;
    default:
      return <Leaf className="h-4 w-4" />;
  }
}

function getPostIcon(slug: string) {
  if (slug.includes('spring') || slug.includes('summer')) return <Leaf className="h-5 w-5" />;
  if (slug.includes('fall') || slug.includes('autumn')) return <Leaf className="h-5 w-5" />;
  if (slug.includes('winter') || slug.includes('snow')) return <Snowflake className="h-5 w-5" />;
  if (slug.includes('mowing') || slug.includes('trim')) return <Scissors className="h-5 w-5" />;
  if (slug.includes('madison') || slug.includes('dane') || slug.includes('wisconsin'))
    return <MapPin className="h-5 w-5" />;
  return <Leaf className="h-5 w-5" />;
}

function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export default function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get('category') || 'all';

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const setCategory = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug === 'all') {
        params.delete('category');
      } else {
        params.set('category', slug);
      }
      router.push(`/blog?${params.toString()}`, { scroll: false });
      setCurrentPage(1);
    },
    [searchParams, router]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, published_at, content, category', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Error fetching blog posts:', error);
        setLoading(false);
        return;
      }

      setBlogPosts(data || []);
      setTotalCount(count ?? 0);
      setLoading(false);
    };

    fetchPosts();
  }, [currentPage, activeCategory]);

  return (
    <div className="min-h-screen" style={{ background: '#052e16' }}>
      <WebPageSchema
        name="Blog"
        description="Lawn care tips and guides for Madison homeowners"
        url="/blog"
      />
      <Navigation />

      {/* TL;DR for AI/Answer Engines */}
      <section className="sr-only" aria-label="Blog Summary">
        <p>
          TotalGuard Yard Care blog provides expert lawn care tips and advice for Madison, Wisconsin
          homeowners. Learn seasonal maintenance guides, landscaping tips, and best practices to keep
          your yard healthy year-round. Free tips from local Madison lawn care professionals.
        </p>
      </section>

      {/* Hero */}
      <section className="pt-24 pb-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#052e16' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
            >
              Expert Insights
            </span>
            <a
              href="/blog/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}
              title="RSS Feed"
            >
              <Rss className="h-3.5 w-3.5" />
              RSS
            </a>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lawn Care Tips &amp; Guides
          </h1>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Professional advice from Madison&apos;s trusted yard care experts. Everything you need
            to keep your property looking its best.
          </p>

          {/* Animated Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    background: isActive ? 'transparent' : 'transparent',
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="blog-tab-indicator"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(34,197,94,0.3)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 md:py-20" style={{ background: '#052e16' }}>
        <div className="container mx-auto px-4">
          <SeasonalContentBanner />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-4 bg-white/[0.08]" />
                    <Skeleton className="h-6 w-full mb-3 bg-white/[0.08]" />
                    <Skeleton className="h-20 w-full mb-4 bg-white/[0.08]" />
                    <Skeleton className="h-4 w-32 bg-white/[0.08]" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {activeCategory !== 'all'
                  ? `No posts in this category yet. Check back soon!`
                  : 'No blog posts yet. Check back soon!'}
              </p>
              {activeCategory !== 'all' && (
                <button
                  onClick={() => setCategory('all')}
                  className="mt-4 text-sm font-medium"
                  style={{ color: '#22c55e' }}
                >
                  View all posts →
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {blogPosts.map((post) => {
                  const readTime = calculateReadingTime(post.content);
                  const catColors = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['lawn-care'];
                  const catName =
                    CATEGORIES.find((c) => c.slug === post.category)?.name ||
                    post.category?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
                    'Lawn Care';

                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(34,197,94,0.08)',
                      }}
                    >
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                        style={{
                          boxShadow: 'inset 0 0 0 1px rgba(34,197,94,0.25)',
                        }}
                      />

                      <div className="p-6 flex flex-col flex-grow">
                        {/* Top row: category badge + read time */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: catColors.bg,
                              color: catColors.text,
                              border: `1px solid ${catColors.border}`,
                            }}
                          >
                            {getCategoryIcon(post.category)}
                            {catName}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 text-xs"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                          >
                            <Clock className="h-3 w-3" />
                            {readTime} min
                          </span>
                        </div>

                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                          style={{
                            background: 'rgba(34,197,94,0.08)',
                            color: '#22c55e',
                          }}
                        >
                          {getPostIcon(post.slug)}
                        </div>

                        {/* Title */}
                        <h2
                          className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-green-400 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p
                          className="text-sm mb-4 line-clamp-3 flex-grow"
                          style={{ color: 'rgba(255,255,255,0.45)' }}
                        >
                          {post.excerpt}
                        </p>

                        {/* Footer: date + read more */}
                        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="inline-flex items-center text-xs font-semibold group-hover:gap-2 transition-all" style={{ color: '#22c55e' }}>
                            Read <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="pb-16" style={{ background: '#052e16' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-2" aria-label="Blog pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {(() => {
                const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push('ellipsis-start');
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push('ellipsis-end');
                  pages.push(totalPages);
                }
                return pages.map((page) =>
                  typeof page === 'string' ? (
                    <span key={page} className="px-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background:
                          page === currentPage ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                        border:
                          page === currentPage
                            ? '1px solid rgba(34,197,94,0.3)'
                            : '1px solid rgba(255,255,255,0.08)',
                        color: page === currentPage ? '#22c55e' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {page}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to Transform Your Lawn?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Let our experts handle your lawn care while you enjoy the results. Get started with a
            free quote today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                Get a Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
              <Link href="/services">View Our Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer showCloser={false} />
    </div>
  );
}
