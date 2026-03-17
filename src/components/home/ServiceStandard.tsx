import { Clock, CheckCircle2, Users, Shield } from "lucide-react";
import { ScrollRevealWrapper } from "@/components/home/ScrollRevealWrapper";

const standardItems = [
  { icon: Clock, title: '24hr Response', desc: 'Same-day quotes' },
  { icon: CheckCircle2, title: 'Quality Walk', desc: 'Inspected before leaving' },
  { icon: Users, title: 'Same Crew', desc: 'Every single visit' },
  { icon: Shield, title: 'Make-It-Right', desc: 'Free return guarantee' },
];

export function ServiceStandard() {
  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="w-10 h-0.5 bg-gradient-to-r from-blue-300/50 to-transparent mb-4" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              The TotalGuard Standard
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="text-primary font-bold">4.9&#9733;</span> Google Rating
              </span>
              <span className="hidden sm:block w-px h-4 bg-gray-200" />
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="text-primary font-bold">500+</span> Clients Served
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 py-4 border-t border-blue-100/40">
            {standardItems.map((item, index) => (
              <ScrollRevealWrapper
                key={item.title}
                direction="left"
                delay={index * 0.1}
              >
                <div className="flex items-center gap-2.5 group">
                  <div className="p-1.5 rounded-lg bg-primary/5 group-hover:bg-primary/15 transition-colors">
                    <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block leading-tight">{item.title}</span>
                    <span className="text-xs text-gray-500">{item.desc}</span>
                  </div>
                </div>
              </ScrollRevealWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
