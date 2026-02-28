import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileText, Clock, BarChart3, MousePointerClick } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
}

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-6">
          Connect your analytics to see real-time data. Embed your Looker Studio dashboard below.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Sessions"
          value="—"
          subtitle="Last 7 days"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Leads"
          value="—"
          subtitle="This month"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Conversion Rate"
          value="—"
          subtitle="Leads / Sessions"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Top Pages"
          value="—"
          subtitle="By pageviews"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Bounce Rate"
          value="—"
          subtitle="Engagement"
          icon={<MousePointerClick className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Page Load"
          value="—"
          subtitle="Avg time"
          icon={<Clock className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Looker Studio Embed */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Looker Studio Dashboard Embed</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Paste your Looker Studio embed URL below to display your analytics dashboard here.
              Create a dashboard at{" "}
              <a
                href="https://lookerstudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                lookerstudio.google.com
              </a>
            </p>
            <div className="mt-4 w-full max-w-lg">
              <input
                type="text"
                placeholder="https://lookerstudio.google.com/embed/reporting/..."
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <p className="font-medium">Google Analytics 4</p>
              <p className="text-sm text-muted-foreground">Open in new tab</p>
            </CardContent>
          </Card>
        </a>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <p className="font-medium">Search Console</p>
              <p className="text-sm text-muted-foreground">Open in new tab</p>
            </CardContent>
          </Card>
        </a>
        <a
          href="https://business.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <p className="font-medium">Google Business Profile</p>
              <p className="text-sm text-muted-foreground">Open in new tab</p>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
