'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, CheckCircle2 } from "lucide-react";

interface CTASectionProps {
  title?: string;
  description?: string;
  variant?: "default" | "compact" | "final";
}

export default function CTASection({
  title = "Get Your Quote Today. We'll Respond by Tomorrow.",
  description = "Tell us what you need. We'll send a clear, no-obligation quote within 24 hours\u2014usually faster.",
  variant = "default"
}: CTASectionProps) {
  // Compact variant for mid-page CTAs
  if (variant === "compact") {
    return (
      <section className="py-10 md:py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="font-bold bg-amber-500 hover:bg-amber-400 text-black" asChild>
                <Link href="/contact">
                  Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-bold" asChild>
                <a href="tel:608-535-6057">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Final CTA - stronger visual weight for page end
  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Visual connector from previous section */}
        <div className="w-12 h-px bg-border mx-auto mb-10" />

        <div className="bg-card border-2 border-border rounded-2xl p-8 md:p-12 text-center shadow-lg hover:shadow-xl transition-shadow max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Operational proof strip */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Quote within 24 hours
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Written scope, flat pricing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Same crew assigned
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 h-auto bg-amber-500 hover:bg-amber-400 text-black"
              asChild
            >
              <Link href="/contact">
                Get My Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg font-bold"
              asChild
            >
              <a href="tel:608-535-6057">
                <Phone className="mr-2 h-5 w-5" />
                (608) 535-6057
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
