'use client';

import { AlertTriangle, Shield, Building2, CheckCircle2, Users, Clock, FileText, MessageSquare } from "lucide-react";

interface CommercialSectionsProps {
  serviceName: string;
  problemPoints?: string[];
  solutionPoints?: string[];
}

interface PropertyType {
  name: string;
  description: string;
}

interface Expectation {
  title: string;
  description: string;
}

interface CommercialPropertyTypesSectionProps {
  serviceName: string;
  propertyTypes?: PropertyType[];
}

interface CommercialExpectationsSectionProps {
  serviceName: string;
  expectations?: Expectation[];
}

const defaultProblemPoints = [
  "Vendors who skip visits without notice—leaving your property looking neglected",
  "Inconsistent crew quality that forces you to re-explain standards every time",
  "Lack of documentation when boards, owners, or tenants ask questions",
  "Poor communication that requires you to chase down updates",
  "Liability exposure from deferred maintenance or missed safety issues"
];

const defaultSolutionPoints = [
  "Scheduled service windows with same-day confirmation when complete",
  "Assigned crews who learn your property's specific standards and expectations",
  "Photo documentation and service reports after every visit",
  "Direct communication with your account manager—not a call center",
  "Proactive issue reporting before small problems become complaints"
];

const defaultPropertyTypes: PropertyType[] = [
  { name: "HOAs & Condo Associations", description: "Board accountability, resident expectations, common area standards" },
  { name: "Apartment Complexes", description: "Tenant satisfaction, curb appeal for leasing, high-traffic durability" },
  { name: "Retail & Shopping Centers", description: "Customer-facing appearance, after-hours service, parking lot safety" },
  { name: "Office Buildings & Corporate Parks", description: "Professional image, minimal disruption, consistent standards" },
  { name: "Municipal & Park Properties", description: "Public safety, compliance documentation, budget predictability" },
  { name: "Medical & Educational Facilities", description: "ADA compliance, sensitive scheduling, liability awareness" }
];

const defaultExpectations: Expectation[] = [
  { title: "Same-day service confirmation", description: "You'll know when we've been there—not wonder if we showed up" },
  { title: "Consistent crew assignments", description: "The same team handles your property, reducing oversight burden" },
  { title: "Service documentation", description: "Photo reports and visit logs available for boards, owners, or audits" },
  { title: "Response within 24 hours", description: "Questions, concerns, or changes—we respond by next business day" },
  { title: "No-excuse accountability", description: "If something's missed, we fix it without back-and-forth" },
  { title: "Long-term partnership focus", description: "We plan for next season, not just this week's visit" }
];

export function CommercialProblemSection({
  serviceName,
  problemPoints = defaultProblemPoints
}: CommercialSectionsProps) {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start sm:items-center gap-3 mb-4 md:mb-6">
            <div className="bg-destructive/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              The Commercial {serviceName} Problem
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
            Property managers and facilities directors know the frustration: vendors who treat commercial accounts as afterthoughts, leaving you to manage complaints and chase accountability.
          </p>
          <div className="space-y-3 md:space-y-4">
            {problemPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg border border-border">
                <div className="bg-destructive/10 rounded-full p-1 mt-0.5 flex-shrink-0">
                  <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
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

export function CommercialSolutionSection({
  serviceName,
  solutionPoints = defaultSolutionPoints
}: CommercialSectionsProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start sm:items-center gap-3 mb-4 md:mb-6">
            <div className="bg-primary/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Our Commercial Solution
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
            We operate like an extension of your property management team—disciplined, communicative, and accountable to the same standards you're held to.
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

export function CommercialPropertyTypesSection({
  serviceName,
  propertyTypes = defaultPropertyTypes
}: CommercialPropertyTypesSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 md:mb-6 sm:justify-center">
            <div className="bg-primary/10 rounded-full p-2.5 md:p-3 flex-shrink-0">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Who This Service Is Built For
            </h2>
          </div>
          <p className="text-muted-foreground mb-6 md:mb-10 text-base md:text-lg text-left sm:text-center max-w-3xl mx-auto leading-relaxed">
            We understand the unique pressures of managing commercial properties—from board meetings to tenant complaints to budget constraints.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {propertyTypes.map((type, index) => (
              <div key={index} className="bg-background p-4 md:p-5 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-foreground text-sm md:text-base">{type.name}</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommercialExpectationsSection({
  serviceName,
  expectations = defaultExpectations
}: CommercialExpectationsSectionProps) {
  const icons = [Clock, FileText, FileText, MessageSquare, Shield, Users];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-left sm:text-center mb-6 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
              What Commercial Clients Can Expect
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Clear standards, not vague promises. Here's how we operate for every commercial account.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {expectations.map((item, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div key={index} className="bg-card p-4 md:p-5 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-1.5 md:p-2 flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{item.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
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
