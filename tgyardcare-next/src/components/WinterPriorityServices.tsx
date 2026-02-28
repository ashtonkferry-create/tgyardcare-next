'use client';

import { Button } from '@/components/ui/button';
import Link from "next/link";
import { ArrowRight, Snowflake, Shield, Clock, AlertTriangle, CheckCircle2, Phone, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageProps {
  name: string;
  badge: string;
  tagline: string;
  features: string[];
  isBestDeal?: boolean;
  isCommercial?: boolean;
  ctaText: string;
  serviceKey: string;
}

function CompactPackageCard({
  name,
  badge,
  tagline,
  features,
  isBestDeal,
  isCommercial,
  ctaText,
  serviceKey
}: PackageProps) {
  return (
    <div className={cn(
      "relative rounded-xl transition-all duration-300 flex flex-col",
      "hover:shadow-lg",
      isCommercial
        ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white ring-1 ring-amber-500/30"
        : isBestDeal
          ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white ring-2 ring-cyan-400/50 scale-[1.02] z-10"
          : "bg-white border border-slate-200 shadow-sm"
    )}>
      {/* Badge */}
      <div className={cn(
        "absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1",
        isCommercial
          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950"
          : isBestDeal
            ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900"
            : "bg-slate-800 text-white"
      )}>
        {(isBestDeal || isCommercial) && <Crown className="h-3 w-3" />}
        {badge}
      </div>

      <div className="p-4 pt-5 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-3">
          <h3 className={cn(
            "text-base font-bold mb-0.5",
            isCommercial || isBestDeal ? "text-white" : "text-slate-900"
          )}>
            {tagline}
          </h3>
          <p className={cn(
            "text-xs",
            isCommercial ? "text-amber-200/70" : isBestDeal ? "text-cyan-100/80" : "text-slate-500"
          )}>
            {name === "Essential" ? "Pay per visit" : name === "Premium" ? "Unlimited visits" : "Custom pricing"}
          </p>
        </div>

        {/* Features - Compact */}
        <ul className="space-y-1.5 mb-4 flex-grow">
          {features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className={cn(
                "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                isCommercial ? "text-amber-400" : isBestDeal ? "text-cyan-200" : "text-blue-600"
              )} />
              <span className={cn(
                "font-medium leading-snug",
                isCommercial ? "text-slate-300" : isBestDeal ? "text-white/95" : "text-slate-700"
              )}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          size="sm"
          className={cn(
            "w-full font-bold text-xs h-9",
            isCommercial
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950"
              : isBestDeal
                ? "bg-white text-blue-600 hover:bg-blue-50"
                : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
          asChild
        >
          <Link href={`/contact?service=${serviceKey}`}>
            {ctaText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>

        {isBestDeal && (
          <p className="text-[10px] text-center mt-2 font-semibold text-amber-300 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Limited spots remaining
          </p>
        )}
      </div>
    </div>
  );
}

export function WinterPriorityServices() {
  const packages: PackageProps[] = [
    {
      name: "Essential",
      badge: "FLEXIBLE",
      tagline: "Per-Visit Service",
      features: [
        "Response within 12 hours",
        "Driveway & walkway clearing",
        "Salt treatment included"
      ],
      ctaText: "Get Quote",
      serviceKey: "snow-essential"
    },
    {
      name: "Premium",
      badge: "BEST VALUE",
      tagline: "Seasonal Contract",
      features: [
        "Priority 24/7 response",
        "Unlimited visits all winter",
        "Fixed pricing - no surprises"
      ],
      isBestDeal: true,
      ctaText: "See Options",
      serviceKey: "snow-premium"
    },
    {
      name: "Commercial",
      badge: "ENTERPRISE",
      tagline: "Business Priority",
      features: [
        "Commercial-grade equipment",
        "Parking lot clearing",
        "24/7 emergency response"
      ],
      isCommercial: true,
      ctaText: "Get Quote",
      serviceKey: "snow-commercial"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-md">
            <Snowflake className="h-4 w-4" />
            Winter 2024-25
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 leading-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Winter Protection
            </span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto">
            Three options for every need. All backed by our 24/7 response guarantee.
          </p>
        </div>

        {/* Urgency Banner */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-bold">
            <AlertTriangle className="h-4 w-4" />
            Only 8 Premium spots left for Madison
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5 max-w-4xl mx-auto mb-12">
          {packages.map((pkg, idx) => (
            <CompactPackageCard key={idx} {...pkg} />
          ))}
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: Shield, text: 'Fully Insured' },
            { icon: Clock, text: '24/7 Response' },
            { icon: Star, text: '4.9★ Rating' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-sm">
              <item.icon className="h-4 w-4 text-blue-600" />
              <span className="text-slate-700 font-semibold">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Questions? Let's Talk!
          </h3>
          <p className="text-slate-400 mb-6 text-base max-w-md mx-auto">
            Not sure which package is right? Get a free custom quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 shadow-lg"
              asChild
            >
              <Link href="/contact">
                Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:bg-white hover:text-slate-900 font-bold px-8"
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
