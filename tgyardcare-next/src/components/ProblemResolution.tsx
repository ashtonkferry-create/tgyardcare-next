'use client';

import { MessageSquare, Camera, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Transparent problem resolution process
 * Answers: "What happens if something goes wrong?"
 */

interface ProblemResolutionProps {
  variant?: "full" | "compact";
  className?: string;
}

const resolutionSteps = [
  {
    icon: Camera,
    step: "1",
    title: "You Spot an Issue",
    action: "Text us a photo",
    detail: "No phone trees, no waiting. Text the issue directly to our crew line.",
    timing: "Takes 30 seconds"
  },
  {
    icon: MessageSquare,
    step: "2",
    title: "We Acknowledge",
    action: "Response within 2 hours",
    detail: "We confirm receipt and let you know when we'll fix it. No runaround.",
    timing: "Usually under 1 hour"
  },
  {
    icon: Clock,
    step: "3",
    title: "We Return & Fix",
    action: "Back on-site within 48 hours",
    detail: "Your crew returns to address the issue. No charge, no hassle.",
    timing: "At no extra cost"
  },
  {
    icon: CheckCircle2,
    step: "4",
    title: "You Confirm",
    action: "Issue resolved to your satisfaction",
    detail: "We follow up to make sure you're 100% happy with the resolution.",
    timing: "Your approval required"
  }
];

export function ProblemResolution({ variant = "full", className }: ProblemResolutionProps) {
  if (variant === "compact") {
    return (
      <div className={cn(
        "bg-muted/50 rounded-xl p-5 border border-border",
        className
      )}>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          If Something&apos;s Not Right
        </h4>
        <ol className="space-y-2 text-sm">
          {resolutionSteps.map((step, idx) => (
            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {step.step}
              </span>
              <span>{step.action}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          No phone trees. No excuses. Just fixed.
        </p>
      </div>
    );
  }

  return (
    <section className={cn("py-10 md:py-14 bg-muted/30", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              What If Something Goes Wrong?
            </h2>
            <p className="text-muted-foreground">
              No runaround. No excuses. Here&apos;s exactly how we handle issues.
            </p>
          </div>

          {/* Horizontal process flow */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {resolutionSteps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === resolutionSteps.length - 1;

              return (
                <div key={idx} className="relative">
                  {/* Connector arrow (desktop) */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-8 -right-3 z-10">
                      <ArrowRight className="h-4 w-4 text-primary/40" />
                    </div>
                  )}

                  <div className="text-center">
                    {/* Step number with icon */}
                    <div className="relative inline-flex mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {step.step}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground mb-1">{step.title}</h4>
                    <p className="text-xs text-primary font-medium mb-2">{step.action}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wide">{step.timing}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom guarantee line */}
          <div className="text-center pt-6 border-t border-border">
            <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-5 py-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Make-It-Right Guarantee: Your satisfaction, or we come back free.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemResolution;
