'use client';

import { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Phone, CheckCircle2, Leaf } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  image_url: string | null;
  meta_description: string;
  seo_keywords: string[];
}

function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export default function BlogPostContent({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const readingTime = useMemo(() => {
    if (!post) return 0;
    return calculateReadingTime(post.content);
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        setLoading(false);
        return;
      }

      setPost(data as BlogPost);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-6 w-1/2 mb-12" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog post not found</h1>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Header */}
      <header className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-24 pb-16 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to all posts
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author}</p>
                <p className="text-xs">Lawn Care Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <Clock className="h-4 w-4" />
              {readingTime} min read
            </div>
          </div>
        </div>
      </header>

      <article className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
                  ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote', 'img'],
                  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
                  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
                  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                }) }}
              />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* CTA Card */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg">
                  <h3 className="text-xl font-bold mb-3">
                    Ready for Professional Help?
                  </h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm leading-relaxed">
                    Get a free, no-obligation quote from Madison&apos;s trusted lawn care experts.
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full font-semibold"
                    asChild
                  >
                    <Link href="/contact">Get Free Quote</Link>
                  </Button>
                  <a href="tel:608-535-6057" className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                    <span>(608) 535-6057</span>
                  </a>
                </div>

                {/* Trust Signals */}
                <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                  <h4 className="font-semibold text-foreground mb-4">Why Choose TotalGuard?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">10+ years serving Madison homeowners</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Licensed & fully insured</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">5-star rated on Google & Nextdoor</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">100% satisfaction guarantee</span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Bottom CTA Section */}
      <section className="bg-muted/30 border-t border-border py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Let Us Handle Your Lawn Care
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop spending weekends on yard work. Our professional team delivers beautiful results so you can enjoy your outdoor space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/contact">Get a Free Quote</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/services/mowing">View Our Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: hsl(var(--muted-foreground));
        }

        .blog-content > * + * {
          margin-top: 1.5rem;
        }

        .blog-content p.lead {
          font-size: 1.25rem;
          line-height: 1.7;
          color: hsl(var(--foreground));
          padding: 1.5rem;
          background: hsl(var(--muted) / 0.5);
          border-left: 4px solid hsl(var(--primary));
          border-radius: 0 0.75rem 0.75rem 0;
          margin-bottom: 2rem;
        }

        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid hsl(var(--border));
        }

        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .blog-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          margin-bottom: 1.25rem;
        }

        .blog-content strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }

        .blog-content em {
          color: hsl(var(--foreground) / 0.8);
          font-style: italic;
        }

        .blog-content ul, .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 0;
        }

        .blog-content ul {
          list-style: none;
        }

        .blog-content ul li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
        }

        .blog-content ul li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.6rem;
          width: 8px;
          height: 8px;
          background: hsl(var(--primary));
          border-radius: 50%;
        }

        .blog-content ol {
          list-style: none;
          counter-reset: item;
        }

        .blog-content ol li {
          position: relative;
          padding-left: 2.5rem;
          margin-bottom: 0.75rem;
          counter-increment: item;
        }

        .blog-content ol li::before {
          content: counter(item);
          position: absolute;
          left: 0;
          top: 0;
          width: 1.75rem;
          height: 1.75rem;
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .blog-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: color 0.2s;
        }

        .blog-content a:hover {
          color: hsl(var(--primary) / 0.8);
        }

        .blog-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          background: hsl(var(--muted) / 0.3);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .blog-content {
            font-size: 1rem;
          }

          .blog-content h2 {
            font-size: 1.5rem;
          }

          .blog-content h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
