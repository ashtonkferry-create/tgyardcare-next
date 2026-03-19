# Social Content Calendar System

Phase 17 Plan 01 — Automated social media content generation and scheduling for TotalGuard Yard Care.

---

## 1. Supabase SQL — `social_posts` Table

```sql
-- Social posts table for automated content calendar
-- Run manually in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_text text NOT NULL,
  image_url text,
  platforms text[] NOT NULL DEFAULT '{}',
  post_type text NOT NULL,
  pillar text NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  scheduled_for timestamptz,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  batch_week date NOT NULL,
  engagement_data jsonb DEFAULT '{}',
  source text NOT NULL DEFAULT 'ai_generated' CHECK (source IN ('ai_generated', 'review_highlight', 'manual')),
  review_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_social_posts_batch_week ON public.social_posts (batch_week);
CREATE INDEX idx_social_posts_status ON public.social_posts (status);
CREATE INDEX idx_social_posts_scheduled_for ON public.social_posts (scheduled_for);
CREATE INDEX idx_social_posts_pillar ON public.social_posts (pillar);
CREATE INDEX idx_social_posts_source ON public.social_posts (source);
CREATE INDEX idx_social_posts_review_id ON public.social_posts (review_id) WHERE review_id IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_posts_updated_at();

-- RLS (service role bypasses, anon blocked)
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
```

---

## 2. 7-Day Pillar Calendar

| Day | Day# | Pillar | Description |
|-----|------|--------|-------------|
| Monday | 1 | Tips | Lawn care tips, quick how-tos, seasonal advice |
| Tuesday | 2 | Before/After | Transformation photos, project showcases |
| Wednesday | 3 | Review Spotlight | Customer review highlight (sourced from TG-134) |
| Thursday | 4 | Seasonal | Timely seasonal content, weather-related advice |
| Friday | 5 | Community | Madison WI community involvement, local events |
| Saturday | 6 | Education | Deep-dive educational content, lawn science |
| Sunday | 0 | Promo | Service promotions, special offers, CTAs |

### Pillar Rotation Notes

- **Wednesday (Review Spotlight)** is populated by TG-134 which pulls from verified Google reviews and inserts with `source = 'review_highlight'`.
- **Before/After (Tuesday)** may require manual image uploads; TG-133 generates placeholder text and flags for image attachment.
- **Promo (Sunday)** content should align with active seasonal campaigns and any flash sales from TG-82.

---

## 3. AI Prompt Templates

### System Prompt (All Pillars)

```
You are the social media copywriter for TotalGuard Yard Care, a premium lawn care
and landscaping company in Madison, Wisconsin.

Brand voice:
- Friendly, knowledgeable, and approachable
- Confident but never arrogant
- Local pride in Madison, WI and surrounding Dane County communities
- Professional yet conversational — like a trusted neighbor who happens to be an expert
- Use "we" and "our team" — never corporate jargon

Rules:
- Include 5-8 relevant hashtags at the end of every post
- Always include at least one Madison/Wisconsin-specific hashtag
- Keep Instagram posts under 2,200 characters
- Keep Google Business Profile posts under 1,500 characters
- No emojis in the first sentence
- End with a soft CTA when appropriate (not every post)
- Reference local landmarks, neighborhoods, or seasonal events when relevant
- Never mention competitors by name
```

### Per-Pillar Prompts

#### Monday — Tips

```
Write a helpful lawn care tip post for {platform}.
Topic focus: {season} lawn care in Madison, WI.
Include a practical, actionable tip homeowners can use this week.
Tone: Helpful expert neighbor.
Hashtags: 5-8 including #MadisonWI #LawnCareTips #TotalGuardYardCare
```

#### Tuesday — Before/After

```
Write a before/after transformation post for {platform}.
Season: {season}. Service type: {service_type}.
Describe the transformation vividly — what the yard looked like before and after.
Include a note like "Swipe to see the transformation!" or "Tap to see the difference!"
Hashtags: 5-8 including #MadisonWI #BeforeAndAfter #LawnTransformation #TotalGuardYardCare
```

#### Wednesday — Review Spotlight

```
Write a post highlighting this customer review for {platform}.
Review text: "{review_text}"
Reviewer: {reviewer_name}
Star rating: {star_rating}/5

Frame it as gratitude and pride. Quote the review directly.
Add a brief comment about what the review means to our team.
Hashtags: 5-8 including #MadisonWI #CustomerReview #5StarService #TotalGuardYardCare
```

#### Thursday — Seasonal

```
Write a seasonal awareness post for {platform}.
Current month: {month}. Season: {season}.
Focus on what Madison, WI homeowners should be thinking about for their yards right now.
Reference local weather patterns or seasonal events when relevant.
Hashtags: 5-8 including #MadisonWI #{season}LawnCare #TotalGuardYardCare
```

#### Friday — Community

```
Write a community-focused post for {platform}.
Theme: Madison, WI community pride and local involvement.
Optionally reference: local events, neighborhoods, parks, or community initiatives.
Keep it warm and genuine — we love this city and its people.
Hashtags: 5-8 including #MadisonWI #DaneCounty #SupportLocal #TotalGuardYardCare
```

#### Saturday — Education

```
Write an educational post for {platform}.
Topic: {lawn_topic} relevant to {season} in southern Wisconsin.
Go deeper than a quick tip — explain the "why" behind the advice.
Make it accessible to homeowners with no lawn care background.
Hashtags: 5-8 including #MadisonWI #LawnScience #LawnEducation #TotalGuardYardCare
```

#### Sunday — Promo

```
Write a promotional post for {platform}.
Current promotion: {promo_details}.
Season: {season}.
Keep it natural — not salesy or pushy. Focus on the value to the homeowner.
Include a clear CTA (call, book online, or message).
Hashtags: 5-8 including #MadisonWI #LawnCareService #FreeEstimate #TotalGuardYardCare
```

---

## 4. Integration Notes

### Table Creation
- The `social_posts` table must be created **manually** via Supabase SQL Editor.
- Run the SQL from Section 1 above before activating any workflows.

### Workflow Dependencies

| Workflow | Role | Interaction |
|----------|------|-------------|
| **TG-133** (Weekly Content Batch) | **Writer** — generates 7 posts every Monday at 6am CT and inserts them into `social_posts` with `status = 'scheduled'` |
| **TG-134** (Review-to-Social) | **Wednesday Filler** — when a new 5-star Google review is detected, generates a Review Spotlight post and inserts it for the next Wednesday slot, replacing the AI-generated placeholder |
| **TG-135** (Social Publisher) | **Reader** — reads posts from `social_posts` where `status = 'scheduled'` and `scheduled_for <= now()`, publishes to the target platforms, and updates status to `published` or `failed` |

### Platform Support
- Instagram (via Meta Graph API)
- Google Business Profile (via GBP API)
- Nextdoor (manual or via approved integration)

**No Facebook** — not included in platform arrays per current strategy.

### Content Review Workflow
1. TG-133 generates 7 posts on Monday morning with `status = 'scheduled'`
2. Telegram notification sent to owner for review
3. Owner can edit posts directly in Supabase table editor or via future dashboard
4. TG-134 may overwrite Wednesday's post if a qualifying review comes in
5. TG-135 publishes each post at its `scheduled_for` time
