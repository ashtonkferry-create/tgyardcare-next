'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { RefreshCw, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type Severity = "critical" | "warning" | "info";

interface PageRow {
  path: string;
  seo_score: number;
  audit_issues: Array<{ type: string; severity: Severity; detail: string }>;
  audited_at: string | null;
  suggested_meta_description: string | null;
}

const FILTERS = ["All", "Services", "Locations", "Commercial", "Blog", "Other"];

export default function SEOIntelligence() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [filter, setFilter] = useState("All");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAudit, setLastAudit] = useState<string | null>(null);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("page_seo")
      .select("path, seo_score, audit_issues, audited_at, suggested_meta_description")
      .order("seo_score", { ascending: true });
    if (error) { console.error("SEO data fetch failed:", error.message); return; }
    const rows = (data as unknown as PageRow[]) ?? [];
    setPages(rows);
    if (rows.length) setLastAudit(rows[0].audited_at);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPages = pages.filter(p => {
    if (filter === "All") return true;
    if (filter === "Services") return p.path.startsWith("/services/");
    if (filter === "Locations") return p.path.startsWith("/locations/");
    if (filter === "Commercial") return p.path.startsWith("/commercial/");
    if (filter === "Blog") return p.path.startsWith("/blog/");
    return !p.path.match(/^\/(services|locations|commercial|blog)\//);
  });

  const criticalCount = pages.filter(p => p.seo_score < 50).length;
  const warningCount = pages.filter(p => p.seo_score >= 50 && p.seo_score < 75).length;
  const goodCount = pages.filter(p => p.seo_score >= 75).length;
  const avgScore = pages.length
    ? Math.round(pages.reduce((a, b) => a + (b.seo_score ?? 0), 0) / pages.length)
    : 0;

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      await fetch("/api/admin/seo-audit", { headers: { "x-admin-token": "dev" } });
      await fetchData();
    } finally {
      setIsAuditing(false);
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const timeAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
    if (h < 1) return "< 1h ago";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const severityColor = (s: Severity) =>
    s === "critical" ? "#ef4444" : s === "warning" ? "#f59e0b" : "#60a5fa";

  const severityLabel = (s: Severity) =>
    s === "critical" ? "CRIT" : s === "warning" ? "WARN" : "INFO";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Intelligence</h1>
          <p className="text-sm text-white/40 mt-1">
            Overall: {avgScore}/100 · Last run: {timeAgo(lastAudit)}
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-all disabled:opacity-50"
          style={{ background: "#22c55e" }}
        >
          <RefreshCw className={cn("h-4 w-4", isAuditing && "animate-spin")} />
          {isAuditing ? "Auditing..." : "Re-run Audit"}
        </button>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Critical", count: criticalCount, color: "#ef4444", desc: "Score < 50" },
          { label: "Warning",  count: warningCount,  color: "#f59e0b", desc: "Score 50-74" },
          { label: "Good",     count: goodCount,     color: "#22c55e", desc: "Score >= 75" },
        ].map(t => (
          <div key={t.label} style={cardStyle} className="p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: t.color }}>{t.count}</div>
            <div className="text-sm text-white/70 mt-1">{t.label}</div>
            <div className="text-xs text-white/30">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={filter === f
              ? { background: "#22c55e", color: "#000" }
              : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Pages Table */}
      <div style={cardStyle} className="overflow-hidden">
        {filteredPages.length === 0 ? (
          <p className="text-center py-12 text-white/30 text-sm">
            {pages.length === 0 ? "Run the SEO audit to populate scores." : "No pages in this filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Page</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Issues</th>
                  <th className="text-left py-3 px-4 text-xs text-white/40 font-medium">Audited</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((row) => {
                  const issues = row.audit_issues ?? [];
                  const crit = issues.filter(x => x.severity === "critical").length;
                  const warn = issues.filter(x => x.severity === "warning").length;
                  const isExpanded = expandedPath === row.path;

                  return (
                    <>
                      <tr
                        key={row.path}
                        className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                        onClick={() => setExpandedPath(isExpanded ? null : row.path)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-xs font-mono truncate max-w-[220px]">
                              {row.path}
                            </span>
                            <a
                              href={`https://tgyardcare.com${row.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-white/20 hover:text-white/50"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/10">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${row.seo_score}%`,
                                  background: scoreColor(row.seo_score),
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium" style={{ color: scoreColor(row.seo_score) }}>
                              {row.seo_score}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 text-xs">
                            {crit > 0 && <span className="font-mono" style={{ color: "#ef4444" }}>{crit} crit</span>}
                            {warn > 0 && <span className="font-mono" style={{ color: "#f59e0b" }}>{warn} warn</span>}
                            {crit === 0 && warn === 0 && <span style={{ color: "#22c55e" }}>OK</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/30">
                          {timeAgo(row.audited_at)}
                        </td>
                        <td className="py-3 px-4 text-white/40">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${row.path}-expanded`}>
                          <td
                            colSpan={5}
                            className="px-4 pb-4"
                            style={{ background: "rgba(255,255,255,0.02)" }}
                          >
                            <div className="space-y-1.5 pt-2">
                              {issues.length === 0 && (
                                <p className="text-xs text-green-400">No issues found</p>
                              )}
                              {issues.map((issue, i) => (
                                <div key={`${issue.type}-${i}`} className="flex items-start gap-2 text-xs">
                                  <span
                                    className="mt-0.5 shrink-0 font-mono text-[10px] px-1 py-0.5 rounded"
                                    style={{
                                      color: severityColor(issue.severity),
                                      background: `${severityColor(issue.severity)}20`,
                                    }}
                                  >
                                    {severityLabel(issue.severity)}
                                  </span>
                                  <div>
                                    <span className="text-white/70 font-medium">{issue.type}: </span>
                                    <span className="text-white/45">{issue.detail}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
