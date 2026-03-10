#!/usr/bin/env node
/**
 * Request Google to re-crawl/index specific URLs via URL Inspection API
 * Note: This inspects URLs (triggers Google's attention) — not a guaranteed instant index.
 * For faster indexing, this also pings IndexNow.
 *
 * Usage: node scripts/gsc-request-indexing.mjs
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = resolve(__dirname, '..', 'gsc-service-account.json');
const SITE_URL = 'sc-domain:tgyardcare.com';
const INDEXNOW_KEY = '5f3d8e2a1b4c7f9e0d6a3c8b5e7f2d4a'; // Used in your cron

const keyFile = JSON.parse(readFileSync(KEY_PATH, 'utf-8'));
const auth = new google.auth.GoogleAuth({
  credentials: keyFile,
  scopes: ['https://www.googleapis.com/auth/webmasters'],
});

const searchconsole = google.searchconsole({ version: 'v1', auth });

// Pages that need indexing — prioritized by SEO value
const URLS_TO_INDEX = [
  // NOT indexed - critical pages
  'https://tgyardcare.com/residential',
  'https://tgyardcare.com/services/hardscaping',
  'https://tgyardcare.com/locations/madison',
  'https://tgyardcare.com/locations/middleton',
  'https://tgyardcare.com/locations/waunakee',
  // Location pages (likely also not indexed)
  'https://tgyardcare.com/locations/verona',
  'https://tgyardcare.com/locations/sun-prairie',
  'https://tgyardcare.com/locations/fitchburg',
  'https://tgyardcare.com/locations/deforest',
  'https://tgyardcare.com/locations/monona',
  'https://tgyardcare.com/locations/mcfarland',
  'https://tgyardcare.com/locations/oregon',
  'https://tgyardcare.com/locations/stoughton',
  'https://tgyardcare.com/locations/cottage-grove',
  // Service pages
  'https://tgyardcare.com/services/mowing',
  'https://tgyardcare.com/services/mulching',
  'https://tgyardcare.com/services/gutter-cleaning',
  'https://tgyardcare.com/services/aeration',
  'https://tgyardcare.com/services/fertilization',
  'https://tgyardcare.com/services/herbicide',
  'https://tgyardcare.com/services/overseeding',
  'https://tgyardcare.com/services/garden-beds',
  'https://tgyardcare.com/services/spring-cleanup',
  'https://tgyardcare.com/services/fall-cleanup',
  'https://tgyardcare.com/services/leaf-removal',
  'https://tgyardcare.com/services/snow-removal',
  // Commercial
  'https://tgyardcare.com/commercial',
  'https://tgyardcare.com/commercial/lawn-care',
  'https://tgyardcare.com/commercial/snow-removal',
  // Other important pages
  'https://tgyardcare.com/about',
  'https://tgyardcare.com/blog',
  'https://tgyardcare.com/reviews',
  'https://tgyardcare.com/gallery',
  'https://tgyardcare.com/service-areas',
];

async function inspectAndReport(url) {
  try {
    const res = await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: url,
        siteUrl: SITE_URL,
      },
    });

    const result = res.data.inspectionResult?.indexStatusResult;
    const verdict = result?.verdict || 'UNKNOWN';
    const coverage = result?.coverageState || 'N/A';
    const icon = verdict === 'PASS' ? '✅' : verdict === 'NEUTRAL' ? '⚠️' : '❌';
    const path = url.replace('https://tgyardcare.com', '') || '/';

    console.log(`  ${icon} ${path.padEnd(40)} ${verdict.padEnd(10)} ${coverage}`);
    return { url, verdict, coverage };
  } catch (e) {
    const path = url.replace('https://tgyardcare.com', '') || '/';
    console.log(`  ❌ ${path.padEnd(40)} ERROR: ${e.message?.substring(0, 60)}`);
    return { url, verdict: 'ERROR', coverage: e.message };
  }
}

async function pingIndexNow(urls) {
  console.log(`\n📡 Pinging IndexNow for ${urls.length} URLs...`);

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'tgyardcare.com',
        key: INDEXNOW_KEY,
        keyLocation: `https://tgyardcare.com/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`  ✅ IndexNow accepted ${urls.length} URLs (status ${response.status})`);
    } else {
      console.log(`  ⚠️ IndexNow response: ${response.status} ${response.statusText}`);
    }
  } catch (e) {
    console.log(`  ❌ IndexNow error: ${e.message}`);
  }
}

async function main() {
  console.log('🔍 GSC URL Inspection + IndexNow Ping');
  console.log(`   Checking ${URLS_TO_INDEX.length} URLs...\n`);
  console.log('  ' + 'URL'.padEnd(42) + 'Status'.padEnd(12) + 'Coverage');
  console.log('  ' + '─'.repeat(85));

  const results = [];
  for (const url of URLS_TO_INDEX) {
    const result = await inspectAndReport(url);
    results.push(result);
    // Rate limit — GSC API has quotas
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  const indexed = results.filter(r => r.verdict === 'PASS');
  const notIndexed = results.filter(r => r.verdict === 'NEUTRAL');
  const errors = results.filter(r => r.verdict === 'ERROR' || r.verdict === 'FAIL');

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Indexed: ${indexed.length}`);
  console.log(`   ⚠️ Not indexed: ${notIndexed.length}`);
  console.log(`   ❌ Errors: ${errors.length}`);

  // Ping IndexNow for all URLs (re-crawl signal)
  await pingIndexNow(URLS_TO_INDEX);

  if (notIndexed.length > 0) {
    console.log(`\n🔔 Pages that need manual "Request Indexing" in GSC UI:`);
    for (const r of notIndexed) {
      console.log(`   → ${r.url}`);
    }
    console.log('\n   Go to: https://search.google.com/search-console/inspect');
    console.log('   Paste each URL and click "Request Indexing"');
  }

  console.log('\n✅ Done. IndexNow pinged for all URLs.\n');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
