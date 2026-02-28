'use client';

import { Shield, FileCheck, Award } from "lucide-react";

/**
 * Insurance trust banner for commercial pages
 * Displays insurance and liability coverage information prominently
 */
export function CommercialInsuranceBanner() {
  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 p-2.5 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">Fully Insured</p>
              <p className="text-muted-foreground text-xs">Comprehensive liability coverage</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="bg-primary/15 p-2.5 rounded-full">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">Certificate of Insurance</p>
              <p className="text-muted-foreground text-xs">Available upon request</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-border" />

          <div className="flex items-center gap-3">
            <div className="bg-primary/15 p-2.5 rounded-full">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">500+ Clients Served</p>
              <p className="text-muted-foreground text-xs">Madison area businesses trust us</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
