import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick, CheckCircle2, XCircle, AlertCircle, ArrowUpRight } from "lucide-react";

interface EventStatusProps {
  name: string;
  description: string;
  status: "active" | "inactive" | "unknown";
}

function EventStatus({ name, description, status }: EventStatusProps) {
  const statusConfig = {
    active: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Firing" },
    inactive: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Not Found" },
    unknown: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Check GA4" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{name}</code>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${config.bg}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const requiredEvents = [
  {
    name: "generate_lead",
    description: "Fires when contact form is submitted",
    status: "unknown" as const,
  },
  {
    name: "click_call",
    description: "Fires when phone number is clicked",
    status: "unknown" as const,
  },
  {
    name: "click_email",
    description: "Fires when email link is clicked",
    status: "unknown" as const,
  },
  {
    name: "click_get_quote",
    description: "Fires when 'Get a Free Quote' button is clicked",
    status: "unknown" as const,
  },
];

export default function EventsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Events & Click Tracking</h2>
        <p className="text-muted-foreground">
          Monitor GA4 events for lead tracking and user engagement.
        </p>
      </div>

      {/* Required Events */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MousePointerClick className="h-5 w-5" />
            Required GA4 Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requiredEvents.map((event) => (
            <EventStatus
              key={event.name}
              name={event.name}
              description={event.description}
              status={event.status}
            />
          ))}
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Add GA4 Tag to Site</p>
                <p className="text-sm text-muted-foreground">
                  Ensure gtag.js is loaded with your GA4 Measurement ID
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Configure Custom Events</p>
                <p className="text-sm text-muted-foreground">
                  Add gtag('event', 'event_name') calls to buttons and forms
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Set Up Conversions in GA4</p>
                <p className="text-sm text-muted-foreground">
                  Mark generate_lead as a conversion event in GA4 Admin
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Test with GA4 DebugView</p>
                <p className="text-sm text-muted-foreground">
                  Use GA4 DebugView to verify events are firing correctly
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Code Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Contact Form Submit:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`gtag('event', 'generate_lead', {
  'event_category': 'engagement',
  'event_label': 'contact_form'
});`}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Phone Click:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`gtag('event', 'click_call', {
  'event_category': 'engagement',
  'phone_number': '608-XXX-XXXX'
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GA4 Link */}
      <Card className="border border-border bg-muted/30">
        <CardContent className="p-6 text-center">
          <MousePointerClick className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-2">View Full Event Data</p>
          <p className="text-sm text-muted-foreground mb-4">
            Check event firing status and debug in Google Analytics 4
          </p>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Open GA4 Dashboard <ArrowUpRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
