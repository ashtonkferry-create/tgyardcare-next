import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingUp, Eye, MousePointerClick, ArrowUpRight } from "lucide-react";

const placeholderQueries = [
  { query: "lawn care madison wi", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { query: "gutter cleaning near me", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { query: "fall cleanup service", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { query: "snow removal madison", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { query: "yard care services", clicks: "—", impressions: "—", ctr: "—", position: "—" },
];

const placeholderPages = [
  { page: "/services/mowing", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { page: "/services/gutter-cleaning", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { page: "/contact", clicks: "—", impressions: "—", ctr: "—", position: "—" },
  { page: "/", clicks: "—", impressions: "—", ctr: "—", position: "—" },
];

export default function SEOPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">SEO & Keywords</h2>
        <p className="text-muted-foreground">
          Search Console metrics for organic search performance. Connect via Looker Studio or view directly.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-xl font-bold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-xl font-bold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-xl font-bold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Position</p>
                <p className="text-xl font-bold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Queries */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Top Search Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderQueries.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.query}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.clicks}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.impressions}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.ctr}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-4">
            Data will populate when Search Console is connected via embed or API.
          </p>
        </CardContent>
      </Card>

      {/* Top Landing Pages */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top Landing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderPages.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.page}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.clicks}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.impressions}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.ctr}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Search Console Link */}
      <Card className="border border-border bg-muted/30">
        <CardContent className="p-6 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-2">Connect Search Console</p>
          <p className="text-sm text-muted-foreground mb-4">
            View full data in Google Search Console or embed via Looker Studio
          </p>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Open Search Console <ArrowUpRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
