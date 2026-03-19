# Auto-Posting Infrastructure Setup

## Overview

TotalGuard auto-posting uses a social media aggregator service to publish content to multiple platforms from n8n workflows. Two recommended services:

| Service     | Cost    | URL                | API Support | n8n Integration        |
|-------------|---------|--------------------|-----------  |------------------------|
| Upload-Post | $16/mo  | uploadpost.com     | REST API    | HTTP Request node      |
| LATE        | $19/mo  | late.ly            | REST API    | HTTP Request node      |

Both services allow you to connect multiple social accounts and publish to all of them via a single API call. The n8n workflow template (`TG-AUTOPOST-social-publisher.json`) is pre-built and ready to use with either service.

## Supported Platforms

- Instagram (business account required)
- TikTok
- YouTube (community posts or Shorts)
- LinkedIn (company page)
- Pinterest
- **Facebook: EXCLUDED** -- account is hacked. Do NOT connect Facebook anywhere.

## Setup Steps (Manual -- Vance Only)

### Step 1: Choose a Service

Pick either Upload-Post ($16/mo) or LATE ($19/mo). Both work with the n8n template.

**Recommendation:** Upload-Post is $3/mo cheaper and has a straightforward REST API. LATE has more AI-powered content repurposing features if you want the service to auto-adapt posts per platform.

### Step 2: Create Account

1. Go to the chosen service's website
2. Sign up for a plan that supports 5+ social accounts
3. Complete email verification

### Step 3: Connect Social Accounts

In the service dashboard, connect these accounts:

- [ ] **Instagram** -- must be a Business or Creator account (not personal)
- [ ] **TikTok** -- connect via OAuth
- [ ] **YouTube** -- connect the TotalGuard YouTube channel
- [ ] **LinkedIn** -- connect the TotalGuard company page (not personal profile)
- [ ] **Pinterest** -- connect the TotalGuard business account
- [ ] **Facebook** -- DO NOT CONNECT (account is hacked)

### Step 4: Get API Credentials

1. In the service dashboard, navigate to **API** or **Integrations** or **Developer** section
2. Generate an API key
3. Note the API base URL (usually something like `https://api.uploadpost.com/v1/publish` or similar)
4. Save both values -- you'll need them for the n8n workflow

### Step 5: Install n8n Community Node (Optional)

Check if the chosen service has an n8n community node:

1. In n8n: **Settings** > **Community Nodes** > **Install**
2. Search for the service name (e.g., `n8n-nodes-upload-post`)
3. If a community node exists, install it for a more native experience
4. If no community node exists, the HTTP Request approach in the template works perfectly

### Step 6: Deploy Workflow to n8n

1. In n8n, go to **Workflows** > **Import from File**
2. Import `automation/n8n-workflows/TG-AUTOPOST-social-publisher.json`
3. Open the workflow and update these placeholders:
   - In the **Build API Payload** node: Replace `AUTOPOST_API_URL` with your actual API endpoint URL
   - In the **Build API Payload** node: Replace `AUTOPOST_API_KEY` with your actual API key
4. Save the workflow
5. **Activate** the workflow so it can be called by other workflows

### Step 7: Test the Workflow

Run a manual test execution with this input:

```json
{
  "post_text": "Test post from TotalGuard automation -- please ignore",
  "platforms": ["linkedin"],
  "post_type": "test"
}
```

**Use LinkedIn only for testing** -- it's the most forgiving platform for test posts (easy to delete).

Verify:
- The workflow executes without errors
- The Log Result node shows `success: true`
- The test post appears on your LinkedIn company page
- Delete the test post after confirming

## Input Schema

The workflow accepts this input when called by other workflows:

| Field        | Type     | Required | Default                               | Description                          |
|------------- |----------|----------|---------------------------------------|--------------------------------------|
| post_text    | string   | Yes      | --                                    | The caption/text for the post        |
| image_url    | string   | No       | null                                  | URL of an image to attach            |
| platforms    | string[] | No       | ["instagram", "linkedin", "pinterest"]| Which platforms to publish to        |
| post_type    | string   | No       | "blog_share"                          | Type: blog_share, review_highlight, seasonal_tip, before_after |
| schedule_at  | string   | No       | null                                  | ISO 8601 datetime for scheduled posting |

**Note:** Even if "facebook" is passed in the platforms array, the Validate Input node automatically removes it. Facebook is blocked at the code level.

## Integration Points

This workflow is designed to be called by other n8n workflows:

| Caller Workflow | Purpose | Phase |
|----------------|---------|-------|
| TG-99 (Blog Auto-Publisher) | Shares new blog posts to social media | Current |
| Review highlight workflows | Shares 5-star reviews as social proof | Phase 14 |
| Social content engine | Daily content calendar publishing | Phase 17 |
| Seasonal campaign workflows | Seasonal promotions and tips | Phase 17 |

### How to Call This Workflow

From any n8n workflow, use an **Execute Workflow** node:

1. Add an "Execute Workflow" node
2. Set the workflow to `TG-AUTOPOST-social-publisher`
3. Pass the input fields as workflow inputs:
   - `post_text` (required)
   - `image_url` (optional)
   - `platforms` (optional, defaults to instagram + linkedin + pinterest)
   - `post_type` (optional)
   - `schedule_at` (optional)

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| 401 Unauthorized | API key expired or invalid | Regenerate API key in service dashboard |
| 403 Forbidden | Social account disconnected | Reconnect the account in service dashboard |
| Post appears on some platforms but not all | Individual platform auth expired | Check each connected account in service dashboard |
| Workflow not triggering | Workflow not activated | Activate in n8n workflow settings |
| "No valid platforms" error | All specified platforms are invalid or only Facebook was specified | Check platforms array in calling workflow |

## Cost Summary

- Auto-posting service: $16-19/mo
- n8n: Already running (tgyardcare.app.n8n.cloud)
- Social accounts: Free (already exist)
- **Total additional cost: $16-19/mo**
