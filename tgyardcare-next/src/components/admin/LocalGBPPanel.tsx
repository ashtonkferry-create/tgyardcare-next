import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Navigation, Globe, Star, TrendingUp, ArrowUpRight } from "lucide-react";

interface GBPMetricProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function GBPMetric({ title, value, icon, color }: GBPMetricProps) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LocalGBPPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Local / Google Business Profile</h2>
        <p className="text-muted-foreground">
          Track your Google Business Profile performance and local visibility.
        </p>
      </div>

      {/* GBP Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <GBPMetric
          title="Calls"
          value="—"
          icon={<Phone className="h-5 w-5 text-green-500" />}
          color="bg-green-500/10"
        />
        <GBPMetric
          title="Direction Requests"
          value="—"
          icon={<Navigation className="h-5 w-5 text-blue-500" />}
          color="bg-blue-500/10"
        />
        <GBPMetric
          title="Website Clicks"
          value="—"
          icon={<Globe className="h-5 w-5 text-purple-500" />}
          color="bg-purple-500/10"
        />
        <GBPMetric
          title="Search Views"
          value="—"
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
          color="bg-orange-500/10"
        />
        <GBPMetric
          title="Reviews"
          value="—"
          icon={<Star className="h-5 w-5 text-yellow-500" />}
          color="bg-yellow-500/10"
        />
      </div>

      {/* Review Trend */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Review Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
            <Star className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Review trend chart placeholder</p>
            <p className="text-sm text-muted-foreground mt-2">
              Embed a Looker Studio chart or connect GBP API to show review trends over time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Area Map Placeholder */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Area Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[250px] flex flex-col items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Service area map placeholder</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Madison, Middleton, Waunakee, Sun Prairie, Fitchburg, Verona, Monona, McFarland, Cottage Grove, DeForest, Oregon, Stoughton
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GBP Link */}
      <Card className="border border-border bg-muted/30">
        <CardContent className="p-6 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-2">Manage Your Business Profile</p>
          <p className="text-sm text-muted-foreground mb-4">
            Update photos, respond to reviews, and post updates
          </p>
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Open Google Business <ArrowUpRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
