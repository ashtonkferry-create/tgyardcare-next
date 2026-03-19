'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SmartQuoteFlow from '@/components/SmartQuoteFlow';
import { ContactPageSchema } from '@/components/schemas/ContactPageSchema';
import { WebPageSchema } from '@/components/schemas/WebPageSchema';
import { BreadcrumbSchema } from '@/components/schemas/BreadcrumbSchema';
import { AmbientParticles } from "@/components/AmbientParticles";

export default function GetQuoteContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative isolate min-h-screen" style={{ background: '#052e16' }}>
      <AmbientParticles density="sparse" className="-z-10" />
      <ContactPageSchema />
      <WebPageSchema
        name="Get a Free Quote"
        description="Request a free lawn care quote from TotalGuard Yard Care in Madison, WI"
        url="/get-quote"
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://tgyardcare.com' },
          { name: 'Get a Free Quote', url: 'https://tgyardcare.com/get-quote' },
        ]}
      />

      <section className="sr-only">
        <h2>Get a Free Quote from TotalGuard Yard Care</h2>
        <p>
          Request a free, no-obligation quote for professional lawn care and landscaping services
          in Madison, Wisconsin. TotalGuard Yard Care serves Dane County with mowing, mulching,
          gutter cleaning, seasonal cleanups, fertilization, snow removal, and more. Call
          (608) 535-6057 or fill out our online form.
        </p>
      </section>

      <Navigation />

      {mounted && (
        <SmartQuoteFlow
          serviceSlug=""
          serviceName=""
          serviceEmoji=""
          isOpen={true}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
