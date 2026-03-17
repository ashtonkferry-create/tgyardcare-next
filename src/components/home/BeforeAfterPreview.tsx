import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ScrollRevealWrapper } from "@/components/home/ScrollRevealWrapper";

const highlights = [
  { label: "Consistent visits", desc: "Same crew, same schedule" },
  { label: "Visible improvement", desc: "Within 2-4 weeks" },
  { label: "Documented work", desc: "Before/after photos on request" },
];

export function BeforeAfterPreview() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-px bg-gray-200 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Real Results. <span className="text-primary">Real Properties.</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Actual transformations from Madison-area homes—no stock photos.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <ScrollRevealWrapper
            direction="left"
            className="order-2 lg:order-1"
          >
            <div className="relative border border-blue-100/30 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-100/20 transition-all duration-500">
              <Image
                alt="Before and after lawn transformation showing improved grass quality and curb appeal"
                className="w-full rounded-xl shadow-lg"
                src="/lovable-uploads/01f91d74-e152-48d0-961c-a2ebcf1e03bf.webp"
                width={600}
                height={400}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-sm">
                Madison, WI
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span><strong className="text-gray-900">4-week result:</strong> Weekly mowing + trimming + debris removal</span>
            </div>
          </ScrollRevealWrapper>

          <ScrollRevealWrapper
            direction="right"
            delay={0.15}
            className="order-1 lg:order-2 space-y-4"
          >
            <div className="space-y-3">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200/50 hover:border-primary/30 hover:bg-blue-50/50 hover:border-blue-200/50 transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="default" variant="accent" asChild className="mt-4">
              <Link href="/gallery">
                View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </ScrollRevealWrapper>
        </div>
      </div>
    </section>
  );
}
