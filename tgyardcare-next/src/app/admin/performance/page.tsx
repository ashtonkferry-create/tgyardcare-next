'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Gauge, TrendingUp, Zap, Eye, Search, Loader2 } from "lucide-react";

interface PerformanceAudit {
  id: string;
  page_url: string;
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  lcp_score: number;
  fid_score: number;
  cls_score: number;
  total_blocking_time: number;
  speed_index: number;
  time_to_interactive: number;
  created_at: string;
}

export default function Performance() {
  const router = useRouter();
  const { toast } = useToast();
  const [audits, setAudits] = useState<PerformanceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [testUrl, setTestUrl] = useState("https://totalguardyardcare.com");

  useEffect(() => {
    checkAuth();
    fetchAudits();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const fetchAudits = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error fetching audits:', error);
      toast({
        title: "Error",
        description: "Failed to load performance audits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('performance-audit', {
        body: { pageUrl: testUrl }
      });

      if (error) throw error;

      toast({
        title: "Audit Complete",
        description: "Performance audit completed successfully",
      });

      await fetchAudits();
    } catch (error) {
      console.error('Error running audit:', error);
      toast({
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "Failed to run performance audit",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const latestAudit = audits[0];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Performance Dashboard</h1>
            <p className="text-muted-foreground">Monitor Core Web Vitals and Lighthouse scores</p>
          </div>
          <Button onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
        </div>

        {/* Run New Audit */}
        <Card>
          <CardHeader>
            <CardTitle>Run Performance Audit</CardTitle>
            <CardDescription>Test any page with Google Lighthouse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <Button onClick={runAudit} disabled={running}>
                {running ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Audit"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : audits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No audits yet. Run your first audit above.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Latest Scores Overview */}
            {latestAudit && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card className={getScoreBg(latestAudit.performance_score)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(latestAudit.performance_score)}`}>
                      {latestAudit.performance_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className={getScoreBg(latestAudit.accessibility_score)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(latestAudit.accessibility_score)}`}>
                      {latestAudit.accessibility_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className={getScoreBg(latestAudit.best_practices_score)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(latestAudit.best_practices_score)}`}>
                      {latestAudit.best_practices_score}
                    </div>
                  </CardContent>
                </Card>

                <Card className={getScoreBg(latestAudit.seo_score)}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">SEO</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(latestAudit.seo_score)}`}>
                      {latestAudit.seo_score}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Core Web Vitals */}
            {latestAudit && (
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Latest measurements from {new Date(latestAudit.created_at).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">Largest Contentful Paint</span>
                      </div>
                      <div className="text-2xl font-bold">{latestAudit.lcp_score.toFixed(2)}s</div>
                      <p className="text-xs text-muted-foreground">Target: &lt; 2.5s</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">First Input Delay</span>
                      </div>
                      <div className="text-2xl font-bold">{latestAudit.fid_score.toFixed(0)}ms</div>
                      <p className="text-xs text-muted-foreground">Target: &lt; 100ms</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">Cumulative Layout Shift</span>
                      </div>
                      <div className="text-2xl font-bold">{latestAudit.cls_score.toFixed(3)}</div>
                      <p className="text-xs text-muted-foreground">Target: &lt; 0.1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit History */}
            <Card>
              <CardHeader>
                <CardTitle>Audit History</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Audits</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    {audits.map((audit) => (
                      <div key={audit.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{audit.page_url}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(audit.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(audit.performance_score)}`}>
                              P: {audit.performance_score}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(audit.seo_score)}`}>
                              SEO: {audit.seo_score}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="performance">
                    {/* Performance-specific view */}
                  </TabsContent>
                  <TabsContent value="vitals">
                    {/* Web Vitals-specific view */}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
