'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Play, Pause, ClipboardList, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

interface Automation {
  slug: string; name: string; description: string; tier: string;
  is_active: boolean; schedule: string; last_run_at: string | null;
}
interface Run {
  automation_slug: string; status: string;
  result_summary: string | null; completed_at: string | null;
}

const TIER_COLORS: Record<string, string> = {
  foundation: "#22c55e", content: "#60a5fa",
  local: "#f59e0b", ai: "#a78bfa", monitoring: "#f87171",
};

const CRON_MAP: Record<string, string> = {
  "auto-season-switcher": "/api/cron/season-switcher",
  "full-seo-audit": "/api/admin/seo-audit",
  "sitemap-integrity-check": "/api/cron/sitemap-check",
  "robots-guard": "/api/cron/robots-guard",
  "meta-description-generator": "/api/cron/meta-gen",
  "faq-schema-builder": "/api/cron/faq-builder",
  "content-freshness-monitor": "/api/cron/content-freshness",
  "gbp-post-generator": "/api/cron/gbp-post",
  "lead-response-timer": "/api/cron/lead-response-timer",
  "weekly-performance-digest": "/api/cron/weekly-digest",
};

export default function AutomationsPanel() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [lastRuns, setLastRuns] = useState<Record<string, Run>>({});
  const [filter, setFilter] = useState("All");
  const [running, setRunning] = useState<string | null>(null);
  const [logsSlug, setLogsSlug] = useState<string | null>(null);
  const [logs, setLogs] = useState<Run[]>([]);

  const load = async () => {
    const { data: autos, error: autosErr } = await supabase.from("automation_config").select("*").order("tier");
    if (autosErr) console.error("Automations fetch failed:", autosErr.message);
    setAutomations((autos as unknown as Automation[]) ?? []);

    const { data: runs, error: runsErr } = await supabase.from("automation_runs")
      .select("*").order("completed_at", { ascending: false }).limit(100);
    if (runsErr) console.error("Runs fetch failed:", runsErr.message);
    const map: Record<string, Run> = {};
    for (const r of (runs as unknown as Run[]) ?? []) {
      if (!map[r.automation_slug]) map[r.automation_slug] = r;
    }
    setLastRuns(map);
  };

  useEffect(() => { load(); }, []);

  const TIERS = ["All", "Foundation", "Content", "Local", "AI", "Monitoring"];
  const filtered = automations.filter(a =>
    filter === "All" || a.tier.toLowerCase() === filter.toLowerCase()
  );

  const runNow = async (slug: string) => {
    setRunning(slug);
    try {
      const path = CRON_MAP[slug];
      if (path) await fetch(path, { headers: { "x-admin-token": "dev", authorization: "Bearer dev" } });
      await load();
    } finally { setRunning(null); }
  };

  const toggleActive = async (slug: string, current: boolean) => {
    const { error } = await supabase.from("automation_config").update({ is_active: !current }).eq("slug", slug);
    if (error) { console.error("Toggle failed:", error.message); return; }
    setAutomations(prev => prev.map(a => a.slug === slug ? { ...a, is_active: !current } : a));
  };

  const viewLogs = async (slug: string) => {
    setLogsSlug(logsSlug === slug ? null : slug);
    if (logsSlug === slug) return;
    const { data } = await supabase.from("automation_runs")
      .select("*").eq("automation_slug", slug)
      .order("completed_at", { ascending: false }).limit(20);
    setLogs((data as unknown as Run[]) ?? []);
  };

  const timeAgo = (iso: string | null) => {
    if (!iso) return "Never";
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
    if (h < 1) return "< 1h ago";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const statusIcon = (s: string) =>
    s === "success" ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> :
    s === "error"   ? <XCircle    className="h-3.5 w-3.5 text-red-400"   /> :
    s === "warning" ? <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> :
                      <Clock className="h-3.5 w-3.5 text-white/30" />;

  const card = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px" };
  const activeCount = automations.filter(a => a.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Automation Engine</h1>
        <p className="text-sm text-white/40 mt-1">System Health: {activeCount}/{automations.length} Running</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TIERS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={filter === t ? { background:"#22c55e", color:"#000" } : { background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const lastRun = lastRuns[a.slug];
          const tierColor = TIER_COLORS[a.tier] ?? "#22c55e";
          return (
            <div key={a.slug} style={card} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{a.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
                      style={{ background:`${tierColor}20`, color:tierColor }}>{a.tier}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={a.is_active
                        ? { background:"rgba(34,197,94,0.15)", color:"#22c55e" }
                        : { background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.3)" }}>
                      {a.is_active ? "Running" : "Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mb-2">{a.description}</p>
                  {lastRun ? (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      {statusIcon(lastRun.status)}
                      <span>Last: {timeAgo(lastRun.completed_at)}</span>
                      {lastRun.result_summary && (
                        <span className="text-white/25 truncate max-w-xs">— {lastRun.result_summary}</span>
                      )}
                    </div>
                  ) : <p className="text-xs text-white/25">Never run</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(a.slug, a.is_active)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white/70"
                    style={{ background:"rgba(255,255,255,0.06)" }}>
                    {a.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {a.is_active ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => runNow(a.slug)} disabled={running === a.slug}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-black font-medium disabled:opacity-40"
                    style={{ background:"#22c55e" }}>
                    <RefreshCw className={cn("h-3 w-3", running === a.slug && "animate-spin")} />
                    {running === a.slug ? "Running..." : "Run Now"}
                  </button>
                  <button onClick={() => viewLogs(a.slug)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/40 hover:text-white/70"
                    style={{ background:"rgba(255,255,255,0.06)" }}>
                    <ClipboardList className="h-3 w-3" /> Logs
                  </button>
                </div>
              </div>

              {logsSlug === a.slug && (
                <div className="mt-4 pt-3" style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-white/60">Run History</span>
                    <button onClick={() => setLogsSlug(null)} className="text-xs text-white/30 hover:text-white/60">Close</button>
                  </div>
                  {logs.length === 0 ? <p className="text-xs text-white/25">No runs recorded</p> : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {logs.map((log, i) => (
                        <div key={`${log.automation_slug}-${i}`} className="flex items-start gap-2 text-xs">
                          {statusIcon(log.status)}
                          <span className="text-white/30 shrink-0">{timeAgo(log.completed_at)}</span>
                          <span className="text-white/50 truncate">{log.result_summary}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && automations.length > 0 && (
          <p className="text-center py-8 text-white/30 text-sm">No automations in this tier.</p>
        )}
        {automations.length === 0 && (
          <p className="text-center py-8 text-white/30 text-sm">Apply Supabase migration to populate automations.</p>
        )}
      </div>
    </div>
  );
}
