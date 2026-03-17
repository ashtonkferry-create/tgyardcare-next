import { ProcessTimeline } from "@/components/ProcessTimeline";

export function HowItWorks() {
  return (
    <section className="py-10 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              What Happens When You Contact Us
            </h2>
            <p className="text-sm text-gray-500">
              No mystery. No runaround. Here&apos;s exactly how it works.
            </p>
          </div>
          <ProcessTimeline variant="horizontal" />
        </div>
      </div>
    </section>
  );
}
