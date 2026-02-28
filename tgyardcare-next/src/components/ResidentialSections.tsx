'use client';

import { AlertCircle, CheckCircle2, Home, Users, Clock, MessageSquare, Calendar, Shield, Heart, Briefcase, DollarSign, Sparkles } from "lucide-react";

// ===============================
// INTERFACE DEFINITIONS
// ===============================

export interface ResidentialSectionsProps {
  serviceName: string;
  problemPoints?: string[];
  solutionPoints?: string[];
}

export interface HomeownerType {
  title: string;
  description: string;
}

export interface Expectation {
  title: string;
  description: string;
}

export interface ResidentialHomeownerTypesSectionProps {
  serviceName: string;
  homeownerTypes?: HomeownerType[];
}

export interface ResidentialExpectationsSectionProps {
  serviceName: string;
  expectations?: Expectation[];
}

// ===============================
// DEFAULT DATA
// ===============================

const defaultProblemPoints: string[] = [
  "Providers who ghost after the first month—no communication, no explanation, no service",
  "Different crew every visit—no one knows your property, your preferences, or your gate code",
  "Quotes that expand after work begins—\"we found extra work\" becomes a recurring theme",
  "Rushed execution with visible corners cut—uneven edges, missed spots, debris left behind",
  "No response system—calls go to voicemail, texts ignored, issues unresolved for weeks"
];

const defaultSolutionPoints: string[] = [
  "Crew assignment locked—same 2-person team handles your property every scheduled visit",
  "Service confirmations via text before arrival and completion photos after every job",
  "Written scope with flat-rate pricing—quote matches invoice, no exceptions",
  "Quality walk before departure—crew lead inspects work against scope checklist",
  "48-hour issue resolution—text a photo, we acknowledge same day, return to fix for free"
];

const defaultHomeownerTypes: HomeownerType[] = [
  {
    title: "Busy Professionals & Parents",
    description: "Scheduled service means your yard is handled without coordination. No calls, no reminders needed."
  },
  {
    title: "Rental & Investment Property Owners",
    description: "Documented service with photos. Consistent maintenance that protects property value."
  },
  {
    title: "Homeowners Switching Providers",
    description: "Structured operations with accountability. Systems replace guesswork."
  },
  {
    title: "Those Preparing to Sell",
    description: "Documented curb appeal improvements. Before/after records for buyer confidence."
  }
];

const defaultExpectations: Expectation[] = [
  {
    title: "Scheduled Day + Time Window",
    description: "Service day locked. Same window each visit. Weather delays communicated by 8am."
  },
  {
    title: "Assigned 2-Person Crew",
    description: "Your crew knows your property. No substitutes without advance notice."
  },
  {
    title: "Written Scope, Flat Pricing",
    description: "Quote itemizes work. Invoice matches quote. No add-ons without approval."
  },
  {
    title: "Completion Verification",
    description: "Crew walks property before leaving. Photos available upon request."
  },
  {
    title: "Same-Day Rescheduling",
    description: "Text to reschedule. Confirmation sent within 2 hours."
  },
  {
    title: "Seasonal Recommendations",
    description: "Proactive guidance on aeration, fertilization, and cleanups—timed to your property."
  }
];

// ===============================
// COMPONENTS
// ===============================

export function ResidentialProblemSection({
  serviceName,
  problemPoints = defaultProblemPoints
}: ResidentialSectionsProps) {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start sm:items-center gap-3 mb-4 md:mb-6">
            <div className="bg-destructive/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              The Homeowner&apos;s {serviceName} Struggle
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
            These aren&apos;t rare events--they&apos;re the industry standard. Finding a provider with actual systems is harder than it should be.
          </p>
          <div className="space-y-3 md:space-y-4">
            {problemPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg border border-border">
                <div className="bg-destructive/10 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
                </div>
                <span className="text-sm md:text-base text-foreground leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResidentialSolutionSection({
  serviceName,
  solutionPoints = defaultSolutionPoints
}: ResidentialSectionsProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start sm:items-center gap-3 mb-4 md:mb-6">
            <div className="bg-primary/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              How TotalGuard Is Different
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
            TotalGuard operates with documented processes. Here&apos;s how each one works.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {solutionPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3 bg-secondary/30 p-3 md:p-4 rounded-lg">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm md:text-base text-foreground leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResidentialHomeownerTypesSection({
  serviceName,
  homeownerTypes = defaultHomeownerTypes
}: ResidentialHomeownerTypesSectionProps) {
  const icons = [Briefcase, Home, Heart, DollarSign];

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 md:mb-6 sm:justify-center">
            <div className="bg-primary/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Who This Service Is For
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-10 text-base md:text-lg text-left sm:text-center max-w-3xl mx-auto leading-relaxed">
            We work with homeowners who value their time and want a provider they can actually count on.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {homeownerTypes.map((type, index) => {
              const IconComponent = icons[index % icons.length];
              return (
                <div key={index} className="bg-background p-4 md:p-5 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                    <h3 className="font-bold text-foreground text-sm md:text-base">{type.title}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResidentialExpectationsSection({
  serviceName,
  expectations = defaultExpectations
}: ResidentialExpectationsSectionProps) {
  const icons = [Calendar, Users, Sparkles, Shield, Clock, Heart];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-left sm:text-center mb-6 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
              What You Can Expect
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Not promises--standards. Here&apos;s what working with TotalGuard actually looks like.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {expectations.map((expectation, index) => {
              const IconComponent = icons[index % icons.length];
              return (
                <div key={index} className="bg-card p-4 md:p-5 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-1.5 md:p-2 flex-shrink-0">
                      <IconComponent className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{expectation.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{expectation.description}</p>
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
