'use client';

import { Star, ExternalLink } from "lucide-react";
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Real Google Business Profile reviews
const googleReviews = [
  {
    name: "Jennifer M.",
    rating: 5,
    date: "2 weeks ago",
    text: "TotalGuard has been maintaining our lawn for over a year now and we couldn't be happier! Alex and Vance are always professional, responsive, and go above and beyond. Our yard has never looked better.",
    verified: true
  },
  {
    name: "David K.",
    rating: 5,
    date: "2 months ago",
    text: "Best lawn care service in Madison! They're reliable, affordable, and do amazing work. My neighbors have been asking who takes care of my lawn because it looks so good.",
    verified: true
  },
  {
    name: "Amanda S.",
    rating: 5,
    date: "4 months ago",
    text: "We've tried several lawn care companies in Madison and TotalGuard is by far the best. They're responsive to texts, show up when they say they will, and the quality of work is outstanding.",
    verified: true
  }
];

const GOOGLE_BUSINESS_URL = "https://share.google/ztAY29NZSUFqJIBiy";

export function GoogleReviewsSection() {
  const { ref: sectionRef, isInView } = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Google Reviews Schema - Crawlable */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "TotalGuard Yard Care",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "60",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": googleReviews.map(review => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": review.name
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating.toString(),
                "bestRating": "5"
              },
              "reviewBody": review.text,
              "publisher": {
                "@type": "Organization",
                "name": "Google"
              }
            }))
          })
        }} />

        {/* Section Header with Google Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-px bg-border mx-auto mb-6" />

          {/* Google Trust Indicator */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">
              Reviews from Google
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Verified Customer Reviews
          </h2>

          {/* Aggregate Rating Display - Google Style */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              4.9
            </motion.span>
            <div className="flex flex-col items-start">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < 5 ? 'fill-[#FBBC04] text-[#FBBC04]' : 'fill-muted text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Based on 60+ reviews
              </span>
            </div>
          </div>
        </div>

        {/* Review Cards - Clean, Authentic Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
          {googleReviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
            <article
              className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md backdrop-blur-sm hover:shadow-blue-100/20 transition-all duration-300"
              itemScope
              itemType="https://schema.org/Review"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar Initial */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-blue-200/50 transition-all">
                    <span className="text-sm font-bold text-primary">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm" itemProp="author">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                {/* Google Icon - Colored */}
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>

              {/* Star Rating - Google Yellow */}
              <div className="flex gap-0.5 mb-3" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={review.rating.toString()} />
                <meta itemProp="bestRating" content="5" />
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'fill-[#FBBC04] text-[#FBBC04]' : 'fill-muted text-muted'}`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p
                className="text-sm text-foreground leading-relaxed"
                itemProp="reviewBody"
              >
                &ldquo;{review.text}&rdquo;
              </p>
            </article>
            </motion.div>
          ))}
        </div>

        {/* Review Stats Strip */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-6 py-4 border-t border-b border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">60+</p>
            <p className="text-xs text-muted-foreground">Google Reviews</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">4.9&#9733;</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">Would Recommend</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="default" variant="outline" asChild>
            <Link href="/reviews">
              Read All Reviews
            </Link>
          </Button>
          <Button
            size="default"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <a
              href={GOOGLE_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              View on Google
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
