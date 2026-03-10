#!/usr/bin/env node
/**
 * Google Search Console Full Audit Script
 * Uses service account: tgyardcare-gsc@totalguard-gsc.iam.gserviceaccount.com
 *
 * Usage: node scripts/gsc-audit.mjs
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = resolve(__dirname, '..', 'gsc-service-account.json');
const SITE_URL = 'sc-domain:tgyardcare.com'; // Domain property format

// Try URL-prefix format if domain property fails
const SITE_URL_PREFIX = 'https://tgyardcare.com/';

// ── Auth ──────────────────────────────────────────────────────────────────────
const keyFile = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters',
  ],
});

const searchconsole = google.searchconsole({ version: 'v1', auth });
const webmasters = google.webmasters({ version: 'v3', auth });

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function printSection(title) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(70));
}

function printTable(rows, headers) {
  if (!rows || rows.length === 0) {
    console.log('  (no data)');
    return;
  }
  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length))
  );
  const sep = widths.map(w => '─'.repeat(w + 2)).join('┼');
  console.log('  ' + headers.map((h, i) => h.padEnd(widths[i])).join(' │ '));
  console.log('  ' + sep);
  for (const row of rows) {
    console.log('  ' + row.map((c, i) => String(c ?? '').padEnd(widths[i])).join(' │ '));
  }
}

// ── Detect Site URL ──────────────────────────────────────────────────────────
async function detectSiteUrl() {
  try {
    const res = await webmasters.sites.list();
    const sites = res.data.siteEntry || [];
    console.log('\n📋 Sites accessible to this service account:');
    for (const s of sites) {
      console.log(`   ${s.siteUrl} (${s.permissionLevel})`);
    }

    // Try domain property first, then URL prefix
    const domain = sites.find(s => s.siteUrl === SITE_URL);
    if (domain) return SITE_URL;

    const prefix = sites.find(s => s.siteUrl === SITE_URL_PREFIX);
    if (prefix) return SITE_URL_PREFIX;

    // Return first match
    const tg = sites.find(s => s.siteUrl.includes('tgyardcare'));
    if (tg) return tg.siteUrl;

    if (sites.length > 0) return sites[0].siteUrl;

    throw new Error('No sites found');
  } catch (e) {
    console.error('❌ Could not list sites:', e.message);
    // Try both URLs directly
    return SITE_URL_PREFIX;
  }
}

// ── 1. Performance Data (Top Queries & Pages) ───────────────────────────────
async function getPerformance(siteUrl) {
  printSection('PERFORMANCE — Top Queries (Last 90 Days)');

  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: daysAgo(90),
        endDate: daysAgo(1),
        dimensions: ['query'],
        rowLimit: 25,
        dataState: 'all',
      },
    });

    const rows = (res.data.rows || []).map(r => [
      r.keys[0],
      r.clicks,
      r.impressions,
      (r.ctr * 100).toFixed(1) + '%',
      r.position.toFixed(1),
    ]);
    printTable(rows, ['Query', 'Clicks', 'Impressions', 'CTR', 'Avg Position']);
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }

  printSection('PERFORMANCE — Top Pages (Last 90 Days)');

  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: daysAgo(90),
        endDate: daysAgo(1),
        dimensions: ['page'],
        rowLimit: 25,
        dataState: 'all',
      },
    });

    const rows = (res.data.rows || []).map(r => [
      r.keys[0].replace('https://tgyardcare.com', ''),
      r.clicks,
      r.impressions,
      (r.ctr * 100).toFixed(1) + '%',
      r.position.toFixed(1),
    ]);
    printTable(rows, ['Page', 'Clicks', 'Impressions', 'CTR', 'Avg Position']);
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }
}

// ── 2. Device Breakdown ─────────────────────────────────────────────────────
async function getDeviceBreakdown(siteUrl) {
  printSection('DEVICE BREAKDOWN (Last 90 Days)');

  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: daysAgo(90),
        endDate: daysAgo(1),
        dimensions: ['device'],
        dataState: 'all',
      },
    });

    const rows = (res.data.rows || []).map(r => [
      r.keys[0],
      r.clicks,
      r.impressions,
      (r.ctr * 100).toFixed(1) + '%',
      r.position.toFixed(1),
    ]);
    printTable(rows, ['Device', 'Clicks', 'Impressions', 'CTR', 'Avg Position']);
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }
}

// ── 3. Country Breakdown ────────────────────────────────────────────────────
async function getCountryBreakdown(siteUrl) {
  printSection('COUNTRY BREAKDOWN (Last 90 Days)');

  try {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: daysAgo(90),
        endDate: daysAgo(1),
        dimensions: ['country'],
        rowLimit: 10,
        dataState: 'all',
      },
    });

    const rows = (res.data.rows || []).map(r => [
      r.keys[0],
      r.clicks,
      r.impressions,
      (r.ctr * 100).toFixed(1) + '%',
      r.position.toFixed(1),
    ]);
    printTable(rows, ['Country', 'Clicks', 'Impressions', 'CTR', 'Avg Position']);
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }
}

// ── 4. Sitemaps ─────────────────────────────────────────────────────────────
async function getSitemaps(siteUrl) {
  printSection('SITEMAPS');

  try {
    const res = await webmasters.sitemaps.list({ siteUrl });
    const sitemaps = res.data.sitemap || [];

    if (sitemaps.length === 0) {
      console.log('  ⚠️  No sitemaps submitted! You should submit one.');
      return;
    }

    for (const sm of sitemaps) {
      console.log(`\n  📄 ${sm.path}`);
      console.log(`     Status: ${sm.lastSubmitted ? 'Submitted ' + sm.lastSubmitted : 'Unknown'}`);
      console.log(`     Last downloaded: ${sm.lastDownloaded || 'Never'}`);
      console.log(`     Pending: ${sm.isPending ? 'Yes' : 'No'}`);
      console.log(`     Warnings: ${sm.warnings || 0}`);
      console.log(`     Errors: ${sm.errors || 0}`);
      if (sm.contents) {
        for (const c of sm.contents) {
          console.log(`     ${c.type}: ${c.submitted} submitted, ${c.indexed} indexed`);
        }
      }
    }
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }
}

// ── 5. URL Inspection (sample key pages) ────────────────────────────────────
async function inspectUrls(siteUrl) {
  printSection('URL INSPECTION — Key Pages');

  const urlsToCheck = [
    'https://tgyardcare.com/',
    'https://tgyardcare.com/about',
    'https://tgyardcare.com/services',
    'https://tgyardcare.com/residential',
    'https://tgyardcare.com/commercial',
    'https://tgyardcare.com/contact',
    'https://tgyardcare.com/gallery',
    'https://tgyardcare.com/reviews',
    'https://tgyardcare.com/blog',
    'https://tgyardcare.com/services/mowing',
    'https://tgyardcare.com/services/gutter-cleaning',
    'https://tgyardcare.com/services/hardscaping',
    'https://tgyardcare.com/locations/madison',
    'https://tgyardcare.com/locations/middleton',
    'https://tgyardcare.com/locations/waunakee',
  ];

  for (const url of urlsToCheck) {
    try {
      const res = await searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl,
        },
      });

      const result = res.data.inspectionResult;
      const indexStatus = result?.indexStatusResult;
      const mobileUsability = result?.mobileUsabilityResult;

      const path = url.replace('https://tgyardcare.com', '') || '/';
      const verdict = indexStatus?.verdict || 'UNKNOWN';
      const coverage = indexStatus?.coverageState || 'N/A';
      const crawled = indexStatus?.lastCrawlTime || 'Never';
      const mobile = mobileUsability?.verdict || 'N/A';

      const icon = verdict === 'PASS' ? '✅' : verdict === 'NEUTRAL' ? '⚠️' : '❌';
      console.log(`\n  ${icon} ${path}`);
      console.log(`     Index: ${verdict} | Coverage: ${coverage}`);
      console.log(`     Last Crawl: ${crawled}`);
      console.log(`     Mobile: ${mobile}`);

      if (indexStatus?.pageFetchState) {
        console.log(`     Fetch: ${indexStatus.pageFetchState}`);
      }
      if (indexStatus?.robotsTxtState) {
        console.log(`     robots.txt: ${indexStatus.robotsTxtState}`);
      }
    } catch (e) {
      const path = url.replace('https://tgyardcare.com', '') || '/';
      console.log(`\n  ❌ ${path} — ${e.message?.substring(0, 80)}`);
    }
  }
}

// ── 6. Trending Queries (last 7 days vs prior 7) ────────────────────────────
async function getTrending(siteUrl) {
  printSection('TRENDING — This Week vs Last Week');

  try {
    const [thisWeek, lastWeek] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: daysAgo(7),
          endDate: daysAgo(1),
          dimensions: ['query'],
          rowLimit: 50,
          dataState: 'all',
        },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: daysAgo(14),
          endDate: daysAgo(8),
          dimensions: ['query'],
          rowLimit: 50,
          dataState: 'all',
        },
      }),
    ]);

    const lastWeekMap = new Map();
    for (const r of (lastWeek.data.rows || [])) {
      lastWeekMap.set(r.keys[0], r);
    }

    const trends = [];
    for (const r of (thisWeek.data.rows || [])) {
      const query = r.keys[0];
      const prev = lastWeekMap.get(query);
      const clickDelta = prev ? r.clicks - prev.clicks : r.clicks;
      const impDelta = prev ? r.impressions - prev.impressions : r.impressions;
      trends.push([query, r.clicks, clickDelta > 0 ? `+${clickDelta}` : String(clickDelta), r.impressions, impDelta > 0 ? `+${impDelta}` : String(impDelta)]);
    }

    // Sort by click delta descending
    trends.sort((a, b) => parseInt(b[2]) - parseInt(a[2]));
    printTable(trends.slice(0, 15), ['Query', 'Clicks', 'Δ Clicks', 'Impr', 'Δ Impr']);
  } catch (e) {
    console.error('  ❌ Error:', e.message);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 TotalGuard Yard Care — Google Search Console Full Audit');
  console.log(`   Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`   Service Account: ${keyFile.client_email}`);

  const siteUrl = await detectSiteUrl();
  console.log(`\n🌐 Using site: ${siteUrl}`);

  await getPerformance(siteUrl);
  await getDeviceBreakdown(siteUrl);
  await getCountryBreakdown(siteUrl);
  await getSitemaps(siteUrl);
  await getTrending(siteUrl);
  await inspectUrls(siteUrl);

  printSection('AUDIT COMPLETE');
  console.log('  Run anytime: node scripts/gsc-audit.mjs\n');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
