'use client';

import { Shield, Clock, Users, FileCheck, RefreshCw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Service execution standards and accountability
 * Answers: "How do I know you'll actually do what you say?"
 */

interface ServiceGuaranteesProps {
  variant?: "full" | "compact" | "inline";
  className?: string;
}

const guarantees = [
  {
    icon: Clock,
    title: "24-Hour Response",
    standard: "Every inquiry answered within 24 hours",
    enforcement: "Automated tracking. Missed? You get 10% off.",
    metric: "Avg response: 2 hours"
  },
  {
    icon: Users,
    title: "Crew Consistency",
    standard: "Same 2-person team on every visit",
    enforcement: "Crew assignments locked in your account. No substitutes without notice.",
    metric: "0 surprise workers"
  },
  {
    icon: FileCheck,
    title: "Quote Accuracy",
    standard: "The price quoted is the price invoiced",
    enforcement: "Scope locked before work begins. Changes require your written approval.",
    metric: "100% quote match"
  },
  {
    icon: Eye,
    title: "Quality Inspection",
    standard: "Every job inspected before we leave",
    enforcement: "Crew lead walks the property, checks against scope. Photos taken.",
    metric: "Built-in QA every visit"
  },
  {
    icon: RefreshCw,
    title: "Make-It-Right Return",
    standard: "Not satisfied? We come back free",
    enforcement: "Text a photo, describe the issue. We return within 48 hours—no charge.",
    metric: "Free re-service policy"
  },
  {
    icon: Shield,
    title: "Full Insurance Coverage",
    standard: "Liability and worker's comp on every job",
    enforcement: "Certificate of insurance available on request.",
    metric: "Your property protected"
  }
];

export function ServiceGuarantees({ variant = "full", className }: ServiceGuaranteesProps) {
  if (variant === "inline") {
    return (
      <div className={cn(
        "flex flex-wrap justify-center gap-4 text-sm",
        className
      )}>
        {guarantees.slice(0, 4).map((g, idx) => {
          const Icon = g.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              <span>{g.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("py-6", className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{g.title}</h4>
                  <p className="text-xs text-muted-foreground">{g.metric}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant with enforcement details
  return (
    <section className={cn("py-10 md:py-14", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              How We Enforce Our Standards
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Promises are easy. Here&apos;s exactly how we hold ourselves accountable on every job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guarantees.map((g, idx) => {
              const Icon = g.icon;
              return (
                <div
                  key={idx}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground">{g.title}</h3>
                        <span className="text-xs text-primary font-medium">{g.metric}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{g.standard}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-muted-foreground">How it&apos;s enforced: </span>
                        {g.enforcement}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceGuarantees;
