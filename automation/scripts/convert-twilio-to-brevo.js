/**
 * TotalGuard — Convert Twilio SMS nodes to Brevo HTTP nodes
 *
 * - TG-76-two-way-sms: SKIP (keeps Twilio for inbound two-way SMS)
 * - All other workflows: replace twilio "send" nodes with Brevo HTTP Request nodes
 *
 * Usage: node convert-twilio-to-brevo.js [--dry-run]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_HOST = 'workelyai.app.n8n.cloud';
const N8N_API_KEY = process.env.N8N_API_KEY;
if (!N8N_API_KEY) { console.error('ERROR: N8N_API_KEY environment variable is required'); process.exit(1); }
const WORKFLOWS_DIR = path.join(__dirname, '..', 'n8n-workflows');
const DRY_RUN = process.argv.includes('--dry-run');

// TG-76 keeps Twilio (two-way inbound SMS)
const SKIP_FILES = ['TG-76-two-way-sms.json'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: N8N_HOST,
      path: urlPath,
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

/**
 * Convert a Twilio SMS send node into a Brevo HTTP Request node.
 * Preserves the node's id, name, and position.
 */
function convertTwilioToBrevo(node) {
  const { to, message } = node.parameters;

  // Brevo transactional SMS API
  // POST https://api.brevo.com/v3/transactionalSMS/sms
  // Body: { sender, recipient, content }
  // sender: max 11 chars alphanumeric
  return {
    id: node.id,
    name: node.name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: node.position,
    continueOnFail: node.continueOnFail || false,
    parameters: {
      method: 'POST',
      url: 'https://api.brevo.com/v3/transactionalSMS/sms',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'api-key', value: '={{$vars.TG_BREVO_API_KEY}}' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      bodyParameters: {
        parameters: [
          { name: 'sender', value: 'TotalGuard' },
          { name: 'recipient', value: to },
          { name: 'content', value: message }
        ]
      },
      options: {}
    }
    // No credentials needed — API key is in the header
  };
}

const ALLOWED_TOP_KEYS = ['name', 'nodes', 'connections', 'settings'];
const ALLOWED_NODE_KEYS = ['parameters', 'id', 'name', 'type', 'typeVersion', 'position', 'continueOnFail', 'credentials', 'webhookId'];

function stripWorkflow(wf) {
  const clean = {};
  for (const key of ALLOWED_TOP_KEYS) {
    if (wf[key] !== undefined) clean[key] = wf[key];
  }
  clean.settings = { ...(clean.settings || {}), availableInMCP: true };
  clean.nodes = (clean.nodes || []).map(node => {
    const n = {};
    for (const key of ALLOWED_NODE_KEYS) {
      if (node[key] !== undefined) n[key] = node[key];
    }
    return n;
  });
  return clean;
}

async function main() {
  console.log('\n🔄 TotalGuard — Twilio → Brevo SMS Converter');
  console.log(`   Dry run: ${DRY_RUN}`);
  console.log(`   Skipping: ${SKIP_FILES.join(', ')}\n`);

  // Get existing workflows from n8n to find IDs
  let allWorkflows = [];
  let cursor = null;
  do {
    const p = '/api/v1/workflows?limit=200' + (cursor ? '&cursor=' + cursor : '');
    const r = await request('GET', p);
    allWorkflows = allWorkflows.concat(r.body.data || []);
    cursor = r.body.nextCursor;
  } while (cursor);

  const existingById = {};
  for (const wf of allWorkflows) {
    existingById[wf.name] = wf.id;
  }

  // Process workflow files
  const files = fs.readdirSync(WORKFLOWS_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('TG-'))
    .sort();

  let converted = 0, skipped = 0, noTwilio = 0, failed = 0;

  for (const file of files) {
    if (SKIP_FILES.includes(file)) {
      console.log(`⏭  SKIP (two-way SMS, keeps Twilio): ${file}`);
      skipped++;
      continue;
    }

    const wf = JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf-8'));
    const twilioNodes = wf.nodes.filter(n => n.type === 'n8n-nodes-base.twilio' && n.parameters?.operation === 'send');

    if (twilioNodes.length === 0) {
      noTwilio++;
      continue;
    }

    // Convert Twilio nodes
    let changeCount = 0;
    wf.nodes = wf.nodes.map(node => {
      if (node.type === 'n8n-nodes-base.twilio' && node.parameters?.operation === 'send') {
        changeCount++;
        return convertTwilioToBrevo(node);
      }
      return node;
    });

    console.log(`✎  ${file}: converting ${changeCount} Twilio node(s) → Brevo`);

    // Save locally
    fs.writeFileSync(path.join(WORKFLOWS_DIR, file), JSON.stringify(wf, null, 2));

    if (DRY_RUN) {
      converted++;
      continue;
    }

    // Push to n8n
    const name = wf.name;
    const wfId = existingById[name];
    if (!wfId) {
      console.log(`  ✗ No n8n workflow found for name: ${name}`);
      failed++;
      continue;
    }

    const cleaned = stripWorkflow(wf);
    const r = await request('PUT', `/api/v1/workflows/${wfId}`, cleaned);
    if (r.status === 200) {
      console.log(`  ✓ Updated in n8n (id: ${wfId})`);
      converted++;
    } else {
      console.log(`  ✗ PUT failed: ${r.status} ${JSON.stringify(r.body).substring(0, 100)}`);
      failed++;
    }

    await sleep(400);
  }

  console.log('\n─────────────────────────────');
  console.log(`✓ Converted: ${converted}`);
  console.log(`⏭  Skipped (keeps Twilio): ${skipped}`);
  console.log(`○ No Twilio nodes: ${noTwilio}`);
  if (failed) console.log(`✗ Failed: ${failed}`);
  console.log('');
}

main().catch(console.error);
