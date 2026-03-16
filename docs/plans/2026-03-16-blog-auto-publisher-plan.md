# Blog Auto-Publisher Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken Vercel cron with an n8n workflow (TG-99) that auto-publishes 3 AI blog posts per week, and add pagination to the blog listing page.

**Architecture:** n8n workflow with 9 nodes (Schedule → Fetch → Pick Topic → Claude API → Validate → Publish → IndexNow → Log → SMS). Blog pagination via Supabase `.range()` with 9 posts per page.

**Tech Stack:** n8n (HTTP Request nodes), Claude Sonnet 4.6 API, Supabase REST API, Twilio SMS, Next.js client component with `useSearchParams`.

---

## Task 1: Build TG-99 n8n Workflow JSON

**Files:**
- Create: `tgyardcare/automation/n8n-workflows/TG-99-blog-auto-publisher.json`

**Step 1: Create the workflow JSON file**

Build the complete n8n workflow JSON with 9 nodes + 3 error-handling IF nodes. The workflow uses the same HTTP Request pattern as TG-50 (verified working).

Node chain:
```
Schedule Trigger
  → Fetch Existing Posts (HTTP GET → Supabase)
  → Pick Topic (Code node)
  → IF: Topics Available?
    → YES → Generate Article (HTTP POST → Claude API)
      → Validate + Structure (Code node)
      → IF: Validation Passed?
        → YES → Publish to Supabase (HTTP POST)
          → Ping IndexNow (HTTP POST, continueOnFail: true)
          → Log Success (HTTP POST → automation_runs)
          → SMS Notification (Twilio node)
        → NO → Log Validation Error (HTTP POST → automation_runs)
    → NO → Log Topics Exhausted (HTTP POST → automation_runs)
```

**Schedule Trigger config:**
```json
{
  "parameters": {
    "rule": {
      "interval": [{ "field": "cronExpression", "expression": "0 15 * * 1,3,5" }]
    }
  },
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [0, 0],
  "id": "schedule",
  "name": "Mon/Wed/Fri 10am CT"
}
```

**Fetch Existing Posts config:**
```json
{
  "parameters": {
    "method": "GET",
    "url": "={{$vars.TG_SUPABASE_URL}}/rest/v1/blog_posts?select=slug,category&status=eq.published",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "apikey", "value": "={{$vars.TG_SUPABASE_ANON_KEY}}" },
        { "name": "Authorization", "value": "=Bearer {{$vars.TG_SUPABASE_SERVICE_KEY}}" }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2
}
```

**Pick Topic — Code node logic (4-season, category-balanced, deduped):**
```javascript
// 4-season model (fixes 3-season bug in Vercel cron)
function getCurrentSeason() {
  const now = new Date();
  const mmdd = (now.getMonth() + 1) * 100 + now.getDate();
  if (mmdd >= 315 && mmdd <= 614) return 'spring';
  if (mmdd >= 615 && mmdd <= 914) return 'summer';
  if (mmdd >= 915 && mmdd <= 1114) return 'fall';
  return 'winter';
}

const existingPosts = $input.all().map(item => item.json);
const existingSlugs = new Set(existingPosts.map(p => p.slug));

// Count posts per category
const categoryCounts = {};
for (const p of existingPosts) {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
}

// Topic bank — 60+ topics across 5 categories
const SERVICE_AREAS = [
  'Madison', 'Middleton', 'Waunakee', 'Monona', 'Sun Prairie',
  'Fitchburg', 'Verona', 'McFarland', 'Cottage Grove', 'DeForest',
  'Oregon', 'Stoughton'
];

const topics = [];

// seasonal-tips (20 topics: 5 per season)
const seasonalTopics = [
  { title: 'Spring lawn revival guide for Madison homeowners', seasons: ['spring'], keywords: ['spring lawn care', 'Madison lawn care', 'lawn revival'] },
  { title: 'When to start mowing in Wisconsin', seasons: ['spring'], keywords: ['first mow Wisconsin', 'mowing season start', 'spring mowing'] },
  { title: 'Pre-emergent herbicide timing for Dane County', seasons: ['spring'], keywords: ['pre-emergent herbicide', 'crabgrass prevention', 'weed prevention timing'] },
  { title: 'Spring garden bed preparation tips for Madison WI', seasons: ['spring'], keywords: ['garden bed prep', 'spring garden', 'Madison gardening'] },
  { title: 'How to repair winter damage to your Madison lawn', seasons: ['spring'], keywords: ['winter damage lawn repair', 'spring lawn recovery', 'Madison lawn rehab'] },
  { title: 'Summer watering schedule for Wisconsin lawns', seasons: ['summer'], keywords: ['watering schedule', 'summer lawn care', 'Wisconsin irrigation'] },
  { title: 'How to keep your lawn green in July heat', seasons: ['summer'], keywords: ['summer lawn green', 'heat stress lawn', 'July lawn care'] },
  { title: 'Best mowing height for summer in Madison WI', seasons: ['summer'], keywords: ['mowing height', 'summer mowing', 'grass height Wisconsin'] },
  { title: 'Preventing brown patches in Wisconsin summers', seasons: ['summer'], keywords: ['brown patch disease', 'lawn disease', 'lawn fungus'] },
  { title: 'Grub control timing for Dane County lawns', seasons: ['summer'], keywords: ['grub control', 'lawn grubs Wisconsin', 'grub prevention timing'] },
  { title: 'Complete fall yard checklist for Madison homeowners', seasons: ['fall'], keywords: ['fall yard checklist', 'fall cleanup', 'autumn yard maintenance'] },
  { title: 'When to do your last mow in Wisconsin', seasons: ['fall'], keywords: ['last mow season', 'fall mowing', 'Wisconsin mowing end'] },
  { title: 'Fall gutter cleaning timing for Madison WI', seasons: ['fall'], keywords: ['gutter cleaning fall', 'winter gutter prep', 'fall gutter maintenance'] },
  { title: 'Fall fertilization timing for Dane County lawns', seasons: ['fall'], keywords: ['fall fertilization', 'winter fertilizer', 'autumn lawn feeding'] },
  { title: 'Preparing your garden beds for Wisconsin winter', seasons: ['fall'], keywords: ['winter garden prep', 'fall garden cleanup', 'garden bed winterization'] },
  { title: 'Winter lawn protection tips for Madison WI', seasons: ['winter'], keywords: ['winter lawn care', 'lawn winterization', 'winter protection'] },
  { title: 'Snow removal best practices for Madison driveways', seasons: ['winter'], keywords: ['snow removal tips', 'driveway snow removal', 'snow plowing'] },
  { title: 'Preventing ice damage to your landscape in Wisconsin', seasons: ['winter'], keywords: ['ice damage landscape', 'winter landscape protection', 'salt damage lawn'] },
  { title: 'Planning your spring lawn makeover during winter', seasons: ['winter'], keywords: ['spring planning', 'winter lawn prep', 'lawn renovation plan'] },
  { title: 'How salt and de-icers damage your Madison lawn', seasons: ['winter'], keywords: ['salt damage lawn', 'de-icer damage', 'winter lawn protection'] },
];
for (const t of seasonalTopics) {
  topics.push({ ...t, category: 'seasonal-tips' });
}

// service-guides (10 topics)
const serviceTopics = [
  { title: 'The complete guide to lawn aeration in Madison WI', keywords: ['lawn aeration', 'core aeration', 'when to aerate Wisconsin'] },
  { title: 'Mulching 101: types, benefits, and costs in Wisconsin', keywords: ['mulching guide', 'mulch types', 'mulching cost'] },
  { title: 'Gutter guard installation: is it worth it for Madison homes?', keywords: ['gutter guards', 'gutter guard cost', 'gutter protection'] },
  { title: 'Professional vs DIY weed control in Dane County', keywords: ['weed control', 'DIY weed control', 'professional herbicide'] },
  { title: 'Spring cleanup services: what is included and why it matters', keywords: ['spring cleanup', 'yard cleanup services', 'spring yard work'] },
  { title: 'Fall leaf removal: timing, methods, and Madison-specific tips', keywords: ['leaf removal', 'fall leaf cleanup', 'leaf removal timing'] },
  { title: 'Professional pruning: when and how to trim shrubs in Wisconsin', keywords: ['shrub pruning', 'tree trimming', 'Wisconsin pruning timing'] },
  { title: 'Garden bed maintenance: a seasonal guide for Madison WI', keywords: ['garden bed maintenance', 'seasonal garden care', 'flower bed upkeep'] },
  { title: 'Snow plowing vs shoveling: choosing the right service', keywords: ['snow plowing', 'snow shoveling', 'snow removal service'] },
  { title: 'Fertilization programs: what Madison lawns actually need', keywords: ['lawn fertilization', 'fertilizer program', 'Wisconsin fertilization schedule'] },
];
for (const t of serviceTopics) {
  topics.push({ ...t, category: 'service-guides', seasons: ['spring', 'summer', 'fall', 'winter'] });
}

// local-guides (24 topics: 2 per city)
for (const city of SERVICE_AREAS) {
  topics.push({
    title: `Lawn care tips specific to ${city} WI neighborhoods`,
    category: 'local-guides',
    keywords: [`${city} lawn care`, `${city} WI yard maintenance`, `lawn care ${city} Wisconsin`],
    seasons: ['spring', 'summer', 'fall', 'winter'],
  });
  topics.push({
    title: `Best yard maintenance schedule for ${city} Wisconsin`,
    category: 'local-guides',
    keywords: [`${city} yard maintenance`, `${city} lawn schedule`, `yard care ${city} WI`],
    seasons: ['spring', 'summer', 'fall', 'winter'],
  });
}

// how-to (8 topics)
const howToTopics = [
  { title: 'How to fix bare spots in your Madison lawn', keywords: ['fix bare spots lawn', 'lawn repair Madison', 'grass seed bare spots'], seasons: ['spring', 'summer', 'fall'] },
  { title: 'DIY soil testing guide for Wisconsin homeowners', keywords: ['soil testing', 'lawn soil test', 'Wisconsin soil pH'], seasons: ['spring', 'summer', 'fall', 'winter'] },
  { title: 'How to sharpen mower blades for a cleaner cut', keywords: ['sharpen mower blades', 'lawn mower maintenance', 'clean lawn cut'], seasons: ['spring', 'summer'] },
  { title: 'How to identify common Wisconsin lawn diseases', keywords: ['lawn diseases Wisconsin', 'lawn fungus identification', 'lawn disease treatment'], seasons: ['spring', 'summer', 'fall'] },
  { title: 'How to prepare your irrigation system for winter', keywords: ['winterize irrigation', 'sprinkler system winterization', 'blow out sprinklers'], seasons: ['fall', 'winter'] },
  { title: 'How to choose the right grass seed for Madison WI', keywords: ['grass seed Madison', 'best grass Wisconsin', 'cool season grass'], seasons: ['spring', 'summer', 'fall', 'winter'] },
  { title: 'How to edge your lawn like a professional', keywords: ['lawn edging tips', 'professional lawn edging', 'edging techniques'], seasons: ['spring', 'summer'] },
  { title: 'How to overseed your Wisconsin lawn for a thicker yard', keywords: ['overseeding lawn', 'thicker lawn Wisconsin', 'overseed timing Madison'], seasons: ['spring', 'fall'] },
];
for (const t of howToTopics) {
  topics.push({ ...t, category: 'how-to' });
}

// faq-answers (8 topics)
const faqTopics = [
  { title: 'How often should you mow your lawn in Madison?', keywords: ['mowing frequency', 'how often mow lawn', 'Madison mowing schedule'] },
  { title: 'What is the best time to fertilize in Wisconsin?', keywords: ['best time fertilize', 'Wisconsin fertilization timing', 'when to fertilize lawn'] },
  { title: 'How much does professional lawn care cost in Madison?', keywords: ['lawn care cost Madison', 'professional lawn care price', 'yard maintenance pricing'] },
  { title: 'When should you clean your gutters in Wisconsin?', keywords: ['gutter cleaning timing', 'when clean gutters', 'gutter cleaning schedule'] },
  { title: 'Is fall cleanup really necessary for Madison homes?', keywords: ['fall cleanup necessary', 'fall yard cleanup importance', 'leaves on lawn damage'] },
  { title: 'How to choose a reliable lawn care company in Dane County', keywords: ['choose lawn care company', 'best lawn care Madison', 'lawn care company reviews'] },
  { title: 'What does a spring cleanup include in Madison WI?', keywords: ['spring cleanup services', 'what is spring cleanup', 'spring yard work included'] },
  { title: 'How long does lawn aeration take to show results?', keywords: ['aeration results timeline', 'when see aeration results', 'lawn aeration expectations'] },
];
for (const t of faqTopics) {
  topics.push({ ...t, category: 'faq-answers', seasons: ['spring', 'summer', 'fall', 'winter'] });
}

// Slugify helper
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Filter out already-published
const available = topics.filter(t => !existingSlugs.has(slugify(t.title)));

if (available.length === 0) {
  return [{ json: { stop: true, reason: 'All topics already published' } }];
}

// Get current season
const season = getCurrentSeason();

// Prioritize seasonal topics
const seasonalPool = available.filter(t => t.seasons.includes(season));
const pool = seasonalPool.length > 0 ? seasonalPool : available;

// Pick from least-covered category
const buckets = {};
for (const t of pool) {
  if (!buckets[t.category]) buckets[t.category] = [];
  buckets[t.category].push(t);
}

let minCount = Infinity;
let bestCategory = '';
for (const cat of Object.keys(buckets)) {
  const count = categoryCounts[cat] || 0;
  if (count < minCount) {
    minCount = count;
    bestCategory = cat;
  }
}

const candidates = buckets[bestCategory] || pool;
const topic = candidates[Math.floor(Math.random() * candidates.length)];

return [{
  json: {
    stop: false,
    topic: topic.title,
    category: topic.category,
    keywords: topic.keywords,
    slug: slugify(topic.title),
    season: season,
    month: new Date().toLocaleString('en-US', { month: 'long' }),
  }
}];
```

**Generate Article — Claude API HTTP Request:**
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.anthropic.com/v1/messages",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "x-api-key", "value": "={{$vars.TG_ANTHROPIC_API_KEY}}" },
        { "name": "anthropic-version", "value": "2023-06-01" },
        { "name": "Content-Type", "value": "application/json" }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "<see system prompt + user prompt below>"
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2
}
```

System prompt (same proven prompt from blog-generator/route.ts — see design doc).

User prompt template:
```
Write a blog post about: {{$json.topic}}

Category: {{$json.category}}
Target keywords: {{$json.keywords.join(', ')}}
Current season: {{$json.season}}
Current month: {{$json.month}}

Return a JSON object with these exact fields:
{
  "title": "SEO-optimized title with Madison WI (under 65 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "1-2 sentence teaser (under 160 chars)",
  "content": "full HTML article body",
  "meta_title": "SEO title for browser tab (under 60 chars)",
  "meta_description": "SEO meta description (under 155 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
```

**Validate + Structure — Code node:**
```javascript
const raw = $input.first().json;
const topicData = $('Pick Topic').first().json;

// Extract text from Claude response
const textBlock = (raw.content || []).find(b => b.type === 'text');
const rawText = textBlock ? textBlock.text : '';

// Parse JSON (handle code fences)
function parseClaudeJson(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1].trim()); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  return null;
}

const parsed = parseClaudeJson(rawText);

if (!parsed || !parsed.title || !parsed.content) {
  return [{ json: { error: true, reason: 'Failed to parse Claude JSON response' } }];
}

// Strip HTML for word count
const plainText = parsed.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const wordCount = plainText.split(/\s+/).filter(Boolean).length;

if (wordCount < 800) {
  return [{ json: { error: true, reason: `Content too thin: ${wordCount} words (min 800)` } }];
}

const title = String(parsed.title).slice(0, 65);
const metaDesc = String(parsed.meta_description || parsed.excerpt || '').slice(0, 155);
const readingTime = Math.ceil(wordCount / 200);

// Use topic slug if Claude's slug collides
let slug = parsed.slug ? String(parsed.slug) : topicData.slug;

return [{
  json: {
    error: false,
    title: title,
    slug: slug,
    excerpt: String(parsed.excerpt || ''),
    content: String(parsed.content),
    category: topicData.category,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : topicData.keywords,
    meta_title: String(parsed.meta_title || title).slice(0, 60),
    meta_description: metaDesc,
    reading_time: readingTime,
    reading_time_minutes: readingTime,
    word_count: wordCount,
    status: 'published',
    published_at: new Date().toISOString(),
    author: 'TotalGuard Yard Care',
    ai_generated: true,
    ai_model: 'claude-sonnet-4-6',
    ai_generated_at: new Date().toISOString(),
  }
}];
```

**Publish to Supabase — HTTP POST:**
```json
{
  "method": "POST",
  "url": "={{$vars.TG_SUPABASE_URL}}/rest/v1/blog_posts",
  "headers": {
    "apikey": "={{$vars.TG_SUPABASE_ANON_KEY}}",
    "Authorization": "=Bearer {{$vars.TG_SUPABASE_SERVICE_KEY}}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  "body": {
    "title": "={{$json.title}}",
    "slug": "={{$json.slug}}",
    "excerpt": "={{$json.excerpt}}",
    "content": "={{$json.content}}",
    "category": "={{$json.category}}",
    "keywords": "={{$json.keywords}}",
    "meta_title": "={{$json.meta_title}}",
    "meta_description": "={{$json.meta_description}}",
    "reading_time": "={{$json.reading_time}}",
    "reading_time_minutes": "={{$json.reading_time_minutes}}",
    "word_count": "={{$json.word_count}}",
    "status": "published",
    "published_at": "={{$json.published_at}}",
    "author": "TotalGuard Yard Care",
    "ai_generated": true,
    "ai_model": "claude-sonnet-4-6",
    "ai_generated_at": "={{$json.ai_generated_at}}"
  }
}
```

**Ping IndexNow — HTTP POST (continueOnFail: true):**
```json
{
  "url": "https://api.indexnow.org/indexnow",
  "body": {
    "host": "tgyardcare.com",
    "key": "tg2026indexnow8x4k",
    "urlList": ["https://tgyardcare.com/blog/={{$json.slug}}"]
  }
}
```

**Log to automation_runs — HTTP POST:**
```json
{
  "url": "={{$vars.TG_SUPABASE_URL}}/rest/v1/automation_runs",
  "body": {
    "automation_slug": "blog-auto-publisher",
    "status": "success",
    "result_summary": "=Published: {{$json.title}} ({{$json.word_count}} words, {{$json.category}})",
    "pages_affected": 1
  }
}
```

**SMS Notification — Twilio node:**
```json
{
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 1,
  "credentials": { "twilioApi": { "id": "cwxndVw60DCxqeNg", "name": "Twilio" } },
  "parameters": {
    "from": "+16089953554",
    "to": "=OWNER_PHONE",
    "message": "=New blog published: \"{{$json.title}}\" — tgyardcare.com/blog/{{$json.slug}}"
  }
}
```

**Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('tgyardcare/automation/n8n-workflows/TG-99-blog-auto-publisher.json','utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

**Step 3: Commit**

```bash
git add tgyardcare/automation/n8n-workflows/TG-99-blog-auto-publisher.json
git commit -m "feat: add TG-99 blog auto-publisher n8n workflow"
```

---

## Task 2: Deploy TG-99 to n8n

**Step 1: Deploy workflow via n8n API**

Use the n8n MCP `create_workflow` or HTTP API to deploy the workflow JSON to `tgyardcare.app.n8n.cloud`.

**Step 2: Activate the workflow**

Set the workflow to active so the schedule trigger fires.

**Step 3: Verify deployment**

Check n8n dashboard — TG-99 should appear as active with schedule "Mon/Wed/Fri 10am CT".

**Step 4: Trigger a manual test run**

Execute the workflow manually in n8n to verify end-to-end:
- Claude generates a blog post
- Post appears in `blog_posts` table with status='published'
- automation_runs gets a success log entry
- SMS notification arrives

**Step 5: Commit any deployment adjustments**

```bash
git add -A tgyardcare/automation/n8n-workflows/TG-99*
git commit -m "feat: deploy TG-99 blog auto-publisher to n8n"
```

---

## Task 3: Add Blog Pagination

**Files:**
- Modify: `tgyardcare/src/app/blog/BlogContent.tsx`

**Step 1: Add pagination state and constants**

At the top of BlogContent component, add:

```tsx
const POSTS_PER_PAGE = 9;

// Inside the component:
const [currentPage, setCurrentPage] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
```

**Step 2: Update Supabase query with range and count**

Replace the existing fetch query (lines 64-68) with:

```tsx
const from = (currentPage - 1) * POSTS_PER_PAGE;
const to = from + POSTS_PER_PAGE - 1;

const { data, error, count } = await supabase
  .from('blog_posts')
  .select('id, title, slug, excerpt, published_at, content, category', { count: 'exact' })
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(from, to);
```

Add `setTotalCount(count || 0);` after setting blog posts.

Add `currentPage` to the useEffect dependency array:
```tsx
}, [currentPage]);
```

**Step 3: Add pagination UI after the blog grid**

After the closing `</div>` of the grid (after line 195), add:

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-center gap-2 mt-12">
    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
          page === currentPage
            ? 'bg-primary text-white border border-primary'
            : 'bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] hover:border-primary/30'
        }`}
      >
        {page}
      </button>
    ))}
    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
)}
```

**Step 4: Scroll to top on page change**

Add to the useEffect:
```tsx
window.scrollTo({ top: 0, behavior: 'smooth' });
```

**Step 5: Verify pagination works**

- With 8 current posts and POSTS_PER_PAGE=9, pagination should NOT show (only 1 page)
- After TG-99 generates the 9th post, pagination should appear with page 2
- Test: temporarily set POSTS_PER_PAGE=3, verify 3 pages show with correct navigation

**Step 6: Commit**

```bash
git add tgyardcare/src/app/blog/BlogContent.tsx
git commit -m "feat: add blog pagination (9 posts per page)"
```

---

## Task 4: Verify End-to-End

**Step 1: Confirm TG-99 is active in n8n**

Check workflow list — TG-99 should be active with next scheduled run visible.

**Step 2: Check blog_posts table after first auto-run**

Query: `SELECT title, slug, category, word_count, ai_generated, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 3;`

Expect: New AI-generated posts with `ai_generated=true`.

**Step 3: Check automation_runs for success logs**

Query: `SELECT * FROM automation_runs WHERE automation_slug = 'blog-auto-publisher' ORDER BY started_at DESC LIMIT 3;`

Expect: `status='success'` entries.

**Step 4: Visit tgyardcare.com/blog**

Verify new posts appear in the listing. Once 10+ posts exist, verify pagination works.

**Step 5: Commit verification notes**

```bash
git add tgyardcare/docs/plans/2026-03-16-blog-auto-publisher-plan.md
git commit -m "docs: mark blog auto-publisher plan verified"
```
