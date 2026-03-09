/**
 * TotalGuard Yard Care — n8n Workflow Importer
 *
 * Imports all TG-*.json workflows from ../n8n-workflows/ to n8n Cloud.
 * Tags each with "TotalGuard Yard Care" (ID: fPXl9eiMhJc3ISQQ).
 *
 * Usage:
 *   node import-tg-workflows.js [--dry-run] [--filter TG-01]
 *
 * Requirements:
 *   Set N8N_API_KEY environment variable or paste it below.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const N8N_HOST = 'workelyai.app.n8n.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNjcwODZiYS1iMjE2LTRhMGUtYjFmYS1hMGFiODk5YjQxZmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZjZjOWNiYjYtNDFiMS00NjM4LWJlZWYtMzBlNDhmZjE3NzYxIiwiaWF0IjoxNzczMDI2ODI1fQ.dYpHKoxQWI9sGQ71KDQpsJ3vY-m2fJHTyXxbb_97SkI';
const TG_TAG_ID = 'fPXl9eiMhJc3ISQQ'; // "TotalGuard Yard Care" tag
const WORKFLOWS_DIR = path.join(__dirname, '..', 'n8n-workflows');
const DRY_RUN = process.argv.includes('--dry-run');
const FILTER = (() => { const i = process.argv.indexOf('--filter'); return i >= 0 ? process.argv[i+1] : null; })();

// Allowed top-level keys (per n8n Cloud rules)
const ALLOWED_TOP_KEYS = ['name', 'nodes', 'connections', 'settings'];
// Allowed node-level keys
const ALLOWED_NODE_KEYS = ['parameters', 'id', 'name', 'type', 'typeVersion', 'position', 'continueOnFail', 'credentials', 'webhookId'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: N8N_HOST,
      path,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function stripWorkflow(wf) {
  const clean = {};
  for (const key of ALLOWED_TOP_KEYS) {
    if (wf[key] !== undefined) clean[key] = wf[key];
  }
  // Ensure MCP enabled
  clean.settings = { ...(clean.settings || {}), availableInMCP: true };
  // Strip node keys
  clean.nodes = (clean.nodes || []).map(node => {
    const n = {};
    for (const key of ALLOWED_NODE_KEYS) {
      if (node[key] !== undefined) n[key] = node[key];
    }
    return n;
  });
  return clean;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 TotalGuard n8n Workflow Importer`);
  console.log(`   Instance: https://${N8N_HOST}`);
  console.log(`   Tag: TotalGuard Yard Care (${TG_TAG_ID})`);
  console.log(`   Dry run: ${DRY_RUN}`);
  if (FILTER) console.log(`   Filter: ${FILTER}`);
  console.log('');

  // Get all workflow files
  let files = fs.readdirSync(WORKFLOWS_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('TG-'))
    .sort();

  if (FILTER) files = files.filter(f => f.includes(FILTER));

  console.log(`Found ${files.length} workflow(s) to import\n`);

  // Get existing workflows to check for duplicates
  const existingRes = await request('GET', '/api/v1/workflows?limit=200');
  const existing = {};
  for (const wf of (existingRes.body.data || [])) {
    existing[wf.name] = wf.id;
  }

  let success = 0, failed = 0, skipped = 0;

  for (const file of files) {
    const filePath = path.join(WORKFLOWS_DIR, file);
    let wf;
    try {
      wf = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.log(`✗ [PARSE ERROR] ${file}: ${e.message}`);
      failed++;
      continue;
    }

    const cleaned = stripWorkflow(wf);
    const name = cleaned.name;

    if (!name) {
      console.log(`✗ [NO NAME] ${file}`);
      failed++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`○ [DRY RUN] Would import: ${name} (${cleaned.nodes.length} nodes)`);
      skipped++;
      continue;
    }

    try {
      let workflowId;

      if (existing[name]) {
        // Update existing
        console.log(`↻ Updating: ${name}...`);
        const res = await request('PUT', `/api/v1/workflows/${existing[name]}`, cleaned);
        if (res.status !== 200) throw new Error(`PUT failed: ${res.status} ${JSON.stringify(res.body).substring(0, 100)}`);
        workflowId = existing[name];
      } else {
        // Create new
        console.log(`+ Creating: ${name}...`);
        const res = await request('POST', '/api/v1/workflows', cleaned);
        if (res.status !== 200) throw new Error(`POST failed: ${res.status} ${JSON.stringify(res.body).substring(0, 100)}`);
        workflowId = res.body.id;
      }

      // Apply TotalGuard tag
      await request('POST', `/api/v1/workflows/${workflowId}/tags`, [{ id: TG_TAG_ID }]);

      // Activate (deactivate first to re-register webhooks)
      await request('PATCH', `/api/v1/workflows/${workflowId}`, { active: false });
      await sleep(2000);
      await request('PATCH', `/api/v1/workflows/${workflowId}`, { active: true });
      await sleep(3000);

      console.log(`  ✓ Done (id: ${workflowId})`);
      success++;

    } catch (e) {
      console.log(`  ✗ FAILED: ${e.message}`);
      failed++;
    }

    await sleep(500);
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✓ Success: ${success}`);
  console.log(`✗ Failed:  ${failed}`);
  if (skipped) console.log(`○ Skipped: ${skipped} (dry run)`);
  console.log('');
}

main().catch(console.error);
