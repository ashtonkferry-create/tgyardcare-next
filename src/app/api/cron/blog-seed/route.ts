import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

/* ------------------------------------------------------------------ */
/*  Blog post type                                                     */
/* ------------------------------------------------------------------ */
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string[];
  status: "published";
  published_at: string;
  reading_time: number;
  meta_title: string;
  meta_description: string;
}

/* ------------------------------------------------------------------ */
/*  Helper: word-count → reading time                                  */
/* ------------------------------------------------------------------ */
function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return Math.max(1, Math.round(text.split(" ").length / 200));
}

/* ------------------------------------------------------------------ */
/*  The 8 seed posts                                                   */
/* ------------------------------------------------------------------ */
function getSeedPosts(): BlogPost[] {
  /* ---- Post 1 --------------------------------------------------- */
  const post1Content = `
<p>One of the most common questions we hear from Madison homeowners is: "How often should I actually be mowing my lawn?" The answer depends on several factors unique to south-central Wisconsin — the season, recent rainfall, the type of grass you have, and even your neighborhood's soil composition. Getting your mowing frequency right is one of the simplest ways to maintain a thick, healthy lawn without spending a fortune on repairs later.</p>

<h2>1. Understanding Wisconsin's Growing Seasons</h2>
<p>In the Madison area, our lawns go through three distinct phases during the year. From mid-April through May, cool-season grasses like Kentucky bluegrass and fine fescue wake up fast. This is the period when your lawn grows the quickest — sometimes adding two inches or more per week after a warm rain. During summer (June through August), growth slows considerably, especially during the hot, dry stretches Dane County is known for. Then in September and October, growth picks back up as temperatures cool and fall rains arrive.</p>

<h3>Spring (April – May): Every 5–7 Days</h3>
<p>During the spring flush, plan on <strong>mowing once a week</strong> at minimum. If we get a string of rainy days followed by warmth — common in Madison — you may need to mow every five days. The key is never to remove more than one-third of the grass blade in a single cut. Scalping your lawn in spring sets it up for weed invasion all summer.</p>

<h3>Summer (June – August): Every 7–10 Days</h3>
<p>As temperatures climb into the 80s and 90s, your lawn naturally slows down. You can safely stretch to <strong>mowing every 7 to 10 days</strong>. Raise your mowing height to 3.5–4 inches during summer to shade the soil, retain moisture, and discourage crabgrass. If your lawn goes dormant during a drought, stop mowing entirely until it greens up again.</p>

<h3>Fall (September – October): Every 7 Days</h3>
<p>Fall is prime growing time in Wisconsin. Resume weekly mowing and gradually lower your cutting height to about 2.5–3 inches for the final cut of the season. This helps prevent snow mold from developing over winter — a common issue here in Dane County.</p>

<h2>2. The Weekly vs. Biweekly Debate</h2>
<p>We understand that life gets busy. Many homeowners wonder if biweekly mowing is "good enough." Here's the honest answer: <strong>biweekly mowing works in summer</strong> when growth slows, but it's a recipe for problems in spring and fall. When you let grass get too tall and then cut it drastically, you stress the plant, expose soil to sunlight (hello, weeds), and leave unsightly clumps of clippings that can smother the turf beneath.</p>

<blockquote><strong>Pro Tip:</strong> If you're only mowing every two weeks, you're almost certainly violating the one-third rule. Over time, this weakens root systems and creates the thin, patchy lawn that leads to expensive overseeding or sod replacement.</blockquote>

<h2>3. Optimal Mowing Heights for Madison Lawns</h2>
<ul>
<li><strong>Kentucky Bluegrass:</strong> 2.5–3.5 inches (most common in Madison neighborhoods)</li>
<li><strong>Fine Fescue:</strong> 2.5–4 inches (popular in shaded Middleton and Verona yards)</li>
<li><strong>Perennial Ryegrass:</strong> 2–3 inches (often blended into Madison lawn seed mixes)</li>
<li><strong>Tall Fescue:</strong> 3–4 inches (increasingly popular for drought tolerance)</li>
</ul>

<h2>4. Weather Matters More Than the Calendar</h2>
<p>Madison weather is unpredictable. A wet May can mean you need to mow three times in ten days. A dry July might mean your mower sits idle for two weeks. Rather than setting a rigid schedule, watch your grass. When it reaches about 30% taller than your target height, it's time to mow. For a 3-inch target, that means mowing when the grass hits about 4 inches.</p>

<h2>5. Why Consistent Mowing Matters</h2>
<p>Regular mowing does far more than keep your lawn looking neat. It encourages lateral growth (tillering), which thickens your turf and crowds out weeds. It also keeps your lawn at a consistent height that maximizes photosynthesis while minimizing water loss. Homeowners who maintain a regular <a href="/services/mowing">mowing schedule</a> almost always spend less on weed control and reseeding over the long run.</p>

<h2>6. Should You Bag or Mulch Clippings?</h2>
<p>In most cases, <strong>mulch your clippings</strong>. Grass clippings return nitrogen to the soil and can reduce your fertilizer needs by up to 25%. The only time you should bag is when the grass is excessively long or wet and the clumps would smother the lawn. A sharp mulching blade on a quality mower handles this beautifully.</p>

<h2>Need Professional Help?</h2>
<p>If keeping up with your mowing schedule feels overwhelming, TotalGuard Yard Care offers <a href="/services/mowing">weekly and biweekly mowing services</a> throughout the greater Madison area. We adjust our cutting height and frequency based on real-time conditions — not a one-size-fits-all calendar. <a href="/contact">Contact us today</a> for a free quote and let us take lawn mowing off your to-do list.</p>
`.trim();

  /* ---- Post 2 --------------------------------------------------- */
  const post2Content = `
<p>If your Madison lawn feels hard underfoot, puddles after rain, or looks thin despite regular watering and fertilizing, the problem might be hiding underground. Soil compaction is one of the most overlooked lawn health issues in Dane County, and <strong>core aeration</strong> is the single most effective treatment for it. Here's everything you need to know about aeration for Wisconsin lawns.</p>

<h2>1. What Is Core Aeration?</h2>
<p>Core aeration is the process of mechanically removing small plugs (or "cores") of soil from your lawn. These plugs are typically 2–3 inches long and about three-quarters of an inch in diameter. The machine pulls them out every few inches across the entire lawn, leaving small holes that allow air, water, and nutrients to penetrate deep into the root zone.</p>
<p>The plugs left on the surface break down within a week or two, returning organic matter and microorganisms back to the soil. It looks a little messy for a few days, but the results are dramatic.</p>

<h2>2. Why Madison Lawns Need Aeration</h2>
<p>The Madison area sits on a mix of clay-heavy glacial till and loamy soils. While some neighborhoods — particularly in Fitchburg and McFarland — have decent topsoil, much of Dane County has <strong>dense clay subsoil</strong> that compacts easily. Add foot traffic, mowing equipment, and Wisconsin's freeze-thaw cycles, and you get soil that's almost concrete-like by midsummer.</p>
<p>Compacted soil creates a chain reaction of problems:</p>
<ul>
<li>Water runs off instead of soaking in, wasting your irrigation investment</li>
<li>Grass roots can't grow deeper than an inch or two, making them drought-vulnerable</li>
<li>Thatch builds up because microbial activity slows in oxygen-starved soil</li>
<li>Fertilizer sits on the surface instead of reaching the root zone</li>
<li>Weeds like crabgrass and dandelions thrive in compacted, stressed turf</li>
</ul>

<h2>3. When to Aerate in Madison</h2>
<p>Timing matters enormously. For Madison's cool-season grasses, <strong>early fall (late August through September) is the ideal window</strong>. The soil is still warm enough for rapid root growth, fall rains provide natural moisture, and the grass has several weeks to recover before winter dormancy.</p>
<p>Spring aeration (April–May) is a distant second choice. It works, but it can open up the soil for weed seeds that germinate aggressively in spring. If you aerate in spring, pair it with a pre-emergent herbicide application — but be aware that pre-emergent can interfere with overseeding.</p>

<blockquote><strong>Madison-Specific Timing:</strong> Our typical first frost date is around October 10. Plan your fall aeration for <em>at least</em> four weeks before that — ideally by mid-September — so your lawn has time to fill in those holes with new root growth.</blockquote>

<h2>4. DIY vs. Professional Aeration</h2>
<h3>DIY Considerations</h3>
<p>You can rent a core aerator from hardware stores in the Madison area for $75–$150 per day. However, these machines are heavy (200+ pounds), difficult to transport, and physically exhausting to operate. A typical Madison lot (8,000–12,000 square feet of lawn) takes 2–3 hours of hard labor. You'll also need a truck or trailer to haul the equipment.</p>

<h3>Why Professionals Are Worth It</h3>
<p>Professional aerators use commercial-grade equipment that pulls deeper cores at tighter spacing. The result is significantly better soil improvement per pass. At TotalGuard, our <a href="/services/aeration">aeration service</a> includes two passes in different directions for maximum coverage — something that would take a DIYer an entire day.</p>
<p>Professional aeration for a standard Madison lawn typically costs $125–$250 — often comparable to or less than the rental cost plus your time and effort.</p>

<h2>5. What to Expect After Aeration</h2>
<p>Your lawn will look a bit rough for 7–14 days after aeration. The soil plugs scattered across the surface are unsightly but beneficial — resist the urge to rake them up. Within two weeks, they'll break down and disappear.</p>
<p>The real results show up over the following weeks:</p>
<ul>
<li><strong>Week 1–2:</strong> Plugs decompose, holes begin closing</li>
<li><strong>Week 3–4:</strong> Noticeable improvement in grass color and density</li>
<li><strong>Month 2–3:</strong> Root depth increases significantly</li>
<li><strong>Next Spring:</strong> Your lawn greens up faster and thicker than neighboring yards</li>
</ul>

<h2>6. Pairing Aeration with Overseeding</h2>
<p>Fall aeration is the perfect time to overseed thin areas. The holes provide ideal seed-to-soil contact, and the reduced competition from weeds gives new grass seedlings a head start. We recommend a blend of Kentucky bluegrass and perennial ryegrass for most Madison lawns — it balances durability, shade tolerance, and that classic deep-green color Dane County homeowners love.</p>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care provides expert <a href="/services/aeration">core aeration services</a> throughout Madison, Middleton, Verona, Sun Prairie, and the surrounding Dane County communities. We use commercial-grade equipment and include overseeding recommendations tailored to your specific yard conditions. <a href="/contact">Contact us today</a> to schedule your fall aeration before our calendar fills up.</p>
`.trim();

  /* ---- Post 3 --------------------------------------------------- */
  const post3Content = `
<p>Every summer, Madison homeowners face the same dilemma: how much should I water my lawn, and when? Get it wrong in one direction and you waste hundreds of gallons (and dollars). Get it wrong in the other direction and you watch your lawn turn brown and crispy by August. This guide gives you a clear, science-based watering strategy designed specifically for south-central Wisconsin's climate.</p>

<h2>1. How Much Water Does a Madison Lawn Need?</h2>
<p>Most cool-season grasses in the Dane County area need <strong>1 to 1.5 inches of water per week</strong> during the growing season. That includes rainfall. In a typical Madison summer, we get about 3.5–4 inches of rain per month, but it comes in bursts — a week of storms followed by ten dry days. Your job is to fill in the gaps.</p>
<p>To measure what your sprinklers deliver, place a few empty tuna cans around your lawn and run the system for 30 minutes. Measure the water depth in each can. Most residential sprinklers deliver about half an inch per 30-minute cycle, so you'd need two cycles per week (without rain) to hit your target.</p>

<h2>2. Best Time of Day to Water</h2>
<p>Water your lawn <strong>between 5 AM and 9 AM</strong>. This gives the grass blades time to dry before nightfall, which dramatically reduces the risk of fungal diseases. Morning watering also minimizes evaporation — you'll use 20–30% less water than if you watered at noon.</p>
<p>Evening watering (after 6 PM) is the worst option. Wet grass sitting overnight in Madison's humid summer air is a breeding ground for dollar spot, brown patch, and other fungal infections that can devastate a lawn in days.</p>

<blockquote><strong>Madison Water Utility Note:</strong> The City of Madison does not currently enforce mandatory watering restrictions for residential lawns, but they strongly encourage conservation. Watering in the early morning aligns with both lawn health and responsible water use. Check the Madison Water Utility website for current conservation guidelines each summer.</blockquote>

<h2>3. Deep and Infrequent vs. Light and Often</h2>
<p>This is the single most important watering principle: <strong>water deeply and infrequently</strong>. Two or three thorough soakings per week beat daily light sprinklings every time. Here's why:</p>
<ul>
<li><strong>Deep watering</strong> (applying 0.5 inches per session) pushes moisture 4–6 inches into the soil, encouraging roots to grow deep and making your lawn drought-resilient</li>
<li><strong>Light, frequent watering</strong> only wets the top inch of soil, training roots to stay shallow. These lawns are the first to brown out when a hot spell hits</li>
<li>Deep-rooted grass accesses moisture reserves that shallow-rooted grass cannot, meaning it stays green during the two-week dry stretches Madison often gets in July and August</li>
</ul>

<h2>4. Signs Your Lawn Needs Water</h2>
<p>Don't water on autopilot — watch your lawn for these cues:</p>
<ul>
<li><strong>Footprint test:</strong> Walk across your lawn. If the grass springs back up within a few seconds, it's fine. If your footprints stay visible for more than a minute, the grass is losing turgor pressure and needs water</li>
<li><strong>Color shift:</strong> A well-hydrated lawn is vibrant green. A thirsty lawn takes on a blue-gray or dull green cast, especially visible in late afternoon</li>
<li><strong>Curling blades:</strong> Grass leaves fold in half lengthwise to reduce surface area and water loss. This is an early drought stress signal</li>
</ul>

<h2>5. Signs You're Overwatering</h2>
<p>Overwatering is more common than underwatering in Madison, and it's just as damaging:</p>
<ul>
<li><strong>Spongy feel:</strong> The lawn feels soft and mushy underfoot</li>
<li><strong>Mushrooms:</strong> Clusters of mushrooms popping up indicate excess moisture</li>
<li><strong>Yellowing:</strong> Overwatered grass turns yellow (not brown) because waterlogged roots can't absorb nutrients</li>
<li><strong>Runoff:</strong> Water pooling on the surface means you're applying it faster than the soil can absorb it — especially common on Dane County's clay soils</li>
<li><strong>Thatch buildup:</strong> Excess water promotes thatch accumulation, which creates a vicious cycle of poor drainage</li>
</ul>

<h2>6. Managing Drought Stress</h2>
<p>When Madison hits a true hot streak — 90-degree days with no rain for two weeks — you have two options:</p>
<p><strong>Option A: Keep it green.</strong> Increase watering to 1.5 inches per week, applied in three deep sessions. This works but costs more in water bills.</p>
<p><strong>Option B: Let it go dormant.</strong> Cool-season grasses are remarkably resilient. They naturally go dormant (turn brown) during extreme heat and drought, then recover when conditions improve. A dormant lawn is not a dead lawn — it's a sleeping lawn. Most healthy Madison lawns can survive 4–6 weeks of dormancy without permanent damage.</p>
<p>The worst thing you can do is <em>partially</em> water a dormant lawn. Either commit to keeping it green or let it sleep. Sporadic watering tricks the grass into breaking dormancy, using up energy reserves, and then going dormant again when water stops.</p>

<h2>7. Sprinkler System Tips</h2>
<p>If you have an in-ground irrigation system, have it audited every spring to check for coverage gaps, broken heads, and proper pressure. Many Madison lawns have areas that receive twice as much water as they need while other spots get almost nothing. A professional audit — or even your own tuna-can test — can reveal these issues quickly.</p>

<h2>Need Professional Help?</h2>
<p>Healthy watering goes hand-in-hand with proper <a href="/services/mowing">mowing</a>, <a href="/services/fertilization">fertilization</a>, and <a href="/services/aeration">aeration</a>. TotalGuard Yard Care offers comprehensive lawn care programs for Madison, Middleton, Sun Prairie, Fitchburg, and all of Dane County. We'll help you build a complete care plan that keeps your lawn thick and green all summer long. <a href="/contact">Get in touch today</a> for a free lawn evaluation.</p>
`.trim();

  /* ---- Post 4 --------------------------------------------------- */
  const post4Content = `
<p>Your gutters are one of those home components you probably don't think about until something goes wrong — water pouring over the sides during a storm, ice dams forming in January, or worse, water seeping into your basement. For Madison homeowners, <strong>gutter maintenance is not optional</strong>. Our heavy tree canopy, four distinct seasons, and freeze-thaw cycles make clogged gutters a serious and expensive problem if left unaddressed.</p>

<h2>1. Why Gutters Matter More Than You Think</h2>
<p>Gutters have one job: direct rainwater and snowmelt away from your home's foundation. When they're clogged with leaves, twigs, and granules from your shingles, water has nowhere to go. It overflows, pools around your foundation, and can cause:</p>
<ul>
<li><strong>Basement flooding:</strong> Dane County's clay soils don't drain well. Water pooling near your foundation finds every crack</li>
<li><strong>Foundation damage:</strong> Repeated water saturation and freeze-thaw cycles can crack concrete block and poured foundations</li>
<li><strong>Fascia and soffit rot:</strong> Standing water in gutters wicks into wood trim, causing rot that costs thousands to repair</li>
<li><strong>Ice dams:</strong> In Madison winters, clogged gutters trap water that freezes into ice dams, pushing under shingles and into your attic</li>
<li><strong>Landscape erosion:</strong> Overflowing gutters erode garden beds, wash out mulch, and kill plants along your foundation</li>
</ul>

<h2>2. When to Clean Your Gutters in Madison</h2>
<p>The greater Madison area has significant tree cover — especially the older neighborhoods in Middleton, Shorewood Hills, and near the UW campus. We recommend <strong>two cleanings per year</strong> at minimum:</p>

<h3>Fall Cleaning (Late October – November)</h3>
<p>This is the most critical cleaning. Madison's oaks, maples, and elms dump enormous volumes of leaves from mid-October through early November. Wait until most leaves have fallen (typically the first week of November) before scheduling your fall cleaning. Cleaning too early means you'll need to do it again.</p>

<h3>Spring Cleaning (April – May)</h3>
<p>Winter deposits a surprising amount of debris in your gutters: wind-blown twigs, shingle granules loosened by ice, maple seeds (samaras), and decomposed leaf mush from anything you missed in fall. A spring cleaning ensures your gutters are clear before the heavy thunderstorm season that typically starts in May.</p>

<blockquote><strong>High-Tree Properties:</strong> If you have multiple large trees overhanging your roof — common in Verona, Oregon, and Waunakee — consider a third cleaning in late summer (August) to clear out seed pods, small branches from summer storms, and bird nesting material.</blockquote>

<h2>3. The Dangers of DIY Gutter Cleaning</h2>
<p>Every year, thousands of Americans are injured falling from ladders while cleaning gutters. For a two-story Madison home, you're working 20+ feet off the ground on an often-uneven surface. Add in wet leaves, a potentially slippery roof edge, and Wisconsin's unpredictable wind, and the risk is significant.</p>
<p>Professional gutter cleaners use proper fall protection, commercial-grade equipment, and have the experience to work quickly and safely. They can also spot issues like loose gutter spikes, sagging sections, and early signs of fascia damage that a homeowner might miss.</p>

<h2>4. Ice Dam Prevention</h2>
<p>Ice dams are a major concern for Madison homeowners. When snow on your roof melts (from heat escaping through inadequate attic insulation), the water runs down to the cold gutter and refreezes. Over time, this creates a dam of ice that forces water under your shingles and into your home.</p>
<p>Clean gutters won't prevent ice dams caused by insulation issues, but they ensure that normal snowmelt can drain properly. Clogged gutters guarantee ice dams because even minor melt has nowhere to go. For comprehensive winter protection, combine <a href="/services/gutter-cleaning">gutter cleaning</a> with proper attic insulation and ventilation.</p>

<h2>5. The Case for Gutter Guards</h2>
<p><a href="/services/gutter-guards">Gutter guards</a> are protective covers that keep leaves and debris out while allowing water to flow through. For Madison homes surrounded by mature trees, they can be a game-changer. Quality gutter guards reduce cleaning frequency from twice a year to once every 2–3 years, saving money in the long run and eliminating the risk of forgotten maintenance.</p>
<p>Not all gutter guards are created equal. Cheap mesh screens from the hardware store clog quickly and can actually make the problem worse. Professional-grade micro-mesh or reverse-curve guards are the only types we recommend for the heavy leaf loads in Dane County.</p>

<h2>6. What Professional Gutter Cleaning Includes</h2>
<p>When TotalGuard cleans your gutters, here's what we do:</p>
<ul>
<li>Remove all debris from gutters by hand and with professional tools</li>
<li>Flush downspouts to ensure they're clear of blockages</li>
<li>Check all gutter connections, hangers, and slope for proper drainage</li>
<li>Inspect fascia and soffit for signs of water damage or rot</li>
<li>Clean up all debris from the ground — we never leave a mess</li>
<li>Provide a written report of any issues found</li>
</ul>

<h2>7. Cost Expectations</h2>
<p>Professional gutter cleaning for a standard Madison home (1,500–2,500 square feet, single story) typically runs $125–$200. Two-story homes range from $175–$300 depending on roof complexity and accessibility. Compare that to the cost of foundation repair ($5,000–$15,000) or ice dam damage ($3,000–$10,000), and it's one of the best investments you can make in your home.</p>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care provides professional <a href="/services/gutter-cleaning">gutter cleaning</a> and <a href="/services/gutter-guards">gutter guard installation</a> throughout Madison, Middleton, Verona, Fitchburg, Sun Prairie, and all of Dane County. We're fully insured, use proper safety equipment, and guarantee our work. <a href="/contact">Contact us today</a> to schedule your seasonal gutter cleaning before the rush.</p>
`.trim();

  /* ---- Post 5 --------------------------------------------------- */
  const post5Content = `
<p>Middleton, Wisconsin, consistently ranks among the best places to live in America — and for good reason. Tree-lined streets, excellent schools, and a strong sense of community make it a destination for families and professionals. But maintaining a beautiful lawn in Middleton comes with its own unique set of challenges. From specific soil conditions to neighborhood expectations, here's your complete guide to lawn care in Middleton, WI.</p>

<h2>1. Middleton's Soil: What You're Working With</h2>
<p>Middleton sits on a geological transition zone. Homes in the <strong>Pheasant Branch Conservancy area</strong> and newer subdivisions to the north tend to have sandier, well-draining soil — great for root development but prone to drying out quickly. The <strong>older neighborhoods</strong> closer to Century Avenue and downtown Middleton typically have heavier clay soils that retain moisture but compact easily.</p>
<p>This soil diversity means there's no one-size-fits-all approach. If you're in the northern subdivisions, you'll need to water more frequently and may benefit from topdressing with compost to improve water retention. If you're in the clay-heavy areas, <a href="/services/aeration">annual aeration</a> is practically mandatory to keep your lawn healthy.</p>

<h3>Get to Know Your Soil</h3>
<p>The Dane County UW-Extension office offers affordable soil testing. For about $15, you'll learn your soil's pH, nutrient levels, and organic matter content. This information is invaluable for building a targeted <a href="/services/fertilization">fertilization program</a> that actually works instead of guessing.</p>

<h2>2. HOA and Neighborhood Standards</h2>
<p>Many of Middleton's newer developments — including communities near Bishops Bay, Tiedeman Pond, and the Glacier Ridge area — have homeowner associations with specific landscape maintenance requirements. Common HOA lawn standards include:</p>
<ul>
<li><strong>Maximum grass height:</strong> Usually 4–6 inches before a violation notice (check your specific HOA documents)</li>
<li><strong>Weed thresholds:</strong> Some HOAs require lawns to be "substantially free of weeds"</li>
<li><strong>Edging requirements:</strong> Clean edges along sidewalks, driveways, and garden beds</li>
<li><strong>Fall cleanup deadlines:</strong> Leaves must be cleared by a specific date</li>
</ul>
<p>Missing these standards can result in fines ranging from $25 to $200 per violation. A consistent <a href="/services/mowing">mowing service</a> is the easiest way to stay compliant without stressing over every notice.</p>

<blockquote><strong>Local Tip:</strong> The City of Middleton collects leaves curbside from mid-October through late November. Rake leaves to the curb (not into the street) in long, narrow rows by 7 AM on your collection day. Check the city website for your neighborhood's schedule. For everything else, TotalGuard's <a href="/services/leaf-removal">leaf removal service</a> has you covered.</blockquote>

<h2>3. Middleton's Water Considerations</h2>
<p>Middleton gets its water from deep wells, and the water is moderately hard (around 18–22 grains per gallon). Hard water is fine for lawns, but it can leave mineral deposits on sprinkler heads over time. Clean your irrigation heads annually if you have an in-ground system.</p>
<p>The City of Middleton follows Dane County's water conservation guidelines. While there are no mandatory lawn watering restrictions, odd/even watering schedules may be requested during severe drought. The best strategy is to build a drought-resistant lawn through deep watering, proper mowing height, and regular aeration — so restrictions rarely matter.</p>

<h2>4. Recommended Annual Maintenance Schedule for Middleton</h2>

<h3>Spring (April – May)</h3>
<ul>
<li>Rake out dead grass and debris (dethatching if needed)</li>
<li><a href="/services/spring-cleanup">Spring cleanup</a> of garden beds and lawn edges</li>
<li>First mowing when grass reaches 3–4 inches (usually mid-April in Middleton)</li>
<li>Pre-emergent crabgrass control (when forsythia blooms — a reliable Dane County indicator)</li>
<li>First round of fertilization</li>
</ul>

<h3>Summer (June – August)</h3>
<ul>
<li>Weekly mowing at 3.5–4 inch height</li>
<li>Deep watering (1–1.5 inches per week including rain)</li>
<li>Spot-treat broadleaf weeds as they appear</li>
<li><a href="/services/mulching">Refresh mulch</a> in garden beds (2–3 inch depth)</li>
<li><a href="/services/weeding">Regular weeding</a> to keep beds clean</li>
</ul>

<h3>Fall (September – November)</h3>
<ul>
<li><a href="/services/aeration">Core aeration</a> + overseeding (September)</li>
<li><a href="/services/fertilization">Fall fertilization</a> — the most important application of the year</li>
<li><a href="/services/leaf-removal">Leaf removal</a> (October – November)</li>
<li><a href="/services/gutter-cleaning">Gutter cleaning</a> after leaf drop</li>
<li><a href="/services/fall-cleanup">Final fall cleanup</a> and bed winterization</li>
</ul>

<h3>Winter (December – March)</h3>
<ul>
<li><a href="/services/snow-removal">Snow removal</a> for driveways and walkways</li>
<li>Avoid walking on frozen grass (it breaks the blades)</li>
<li>Plan next year's lawn care strategy during the downtime</li>
</ul>

<h2>5. Common Middleton Lawn Problems</h2>
<p><strong>Creeping Charlie:</strong> This invasive ground cover thrives in Middleton's shaded areas. It's extremely difficult to eliminate without targeted <a href="/services/herbicide">herbicide applications</a>.</p>
<p><strong>Grubs:</strong> Japanese beetle grubs feed on grass roots and are common throughout Dane County. If you see patches of dead grass that peel up like carpet, check for white C-shaped grubs in the soil.</p>
<p><strong>Shade stress:</strong> Middleton's mature tree canopy means many lawns struggle with too much shade. Consider transitioning heavily shaded areas to fine fescue blends or shade-tolerant ground covers.</p>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care proudly serves Middleton and the surrounding communities with comprehensive lawn care, <a href="/services/gutter-cleaning">gutter cleaning</a>, <a href="/services/snow-removal">snow removal</a>, and seasonal maintenance. We know Middleton's soil, HOA expectations, and neighborhood quirks because we work here every day. <a href="/contact">Contact us</a> for a free estimate tailored to your Middleton property.</p>
`.trim();

  /* ---- Post 6 --------------------------------------------------- */
  const post6Content = `
<p>Bare spots in your lawn are more than just an eyesore — they're an open invitation for weeds, erosion, and further turf degradation. The good news? Most bare spots in Madison lawns can be repaired successfully with the right approach and timing. Whether your bare spots are the size of a dinner plate or a car hood, this guide walks you through the process from diagnosis to a lush, green repair.</p>

<h2>1. Identify the Cause First</h2>
<p>Before you grab a bag of seed, figure out <em>why</em> the grass died. Reseeding over the same problem just wastes time and money. Common causes of bare spots in Dane County lawns include:</p>
<ul>
<li><strong>Grub damage:</strong> White grubs (Japanese beetle and European chafer larvae) feed on grass roots underground. The turf dies in irregular patches and peels up like carpet. Check by pulling at the dead grass — if it lifts easily with no roots, grubs are the culprit</li>
<li><strong>Dog urine:</strong> High nitrogen concentration burns grass in circular patches, often with a green ring around the edge</li>
<li><strong>Fungal disease:</strong> Brown patch, dollar spot, and snow mold are all common in Madison. These typically appear as circular or irregular brown patches</li>
<li><strong>Compaction:</strong> High-traffic areas (paths to the shed, play areas, next to driveways) compact over time and grass thins out</li>
<li><strong>Shade creep:</strong> As trees mature, shade increases. Areas that once got enough sunlight may no longer support Kentucky bluegrass</li>
<li><strong>Chemical spill:</strong> Fertilizer spills, gasoline drips from the mower, or herbicide overspray kill grass in obvious, often rectangular patterns</li>
</ul>

<h2>2. Best Time to Repair Bare Spots in Madison</h2>
<p>Timing is critical in Wisconsin. You have two windows:</p>
<p><strong>Primary window: Late August through mid-September.</strong> This is the absolute best time to reseed in the Madison area. Soil is warm (which speeds germination), fall rains provide natural moisture, weed competition is minimal, and the grass has weeks to establish before winter. Fall-seeded patches come in thick and strong the following spring.</p>
<p><strong>Secondary window: Mid-April through mid-May.</strong> Spring seeding works but is riskier. You're competing with crabgrass germination, and the new grass must survive its first summer heat. If you seed in spring, skip pre-emergent herbicide on the repaired areas — it will prevent your grass seed from germinating too.</p>

<blockquote><strong>Wisconsin Reality Check:</strong> Don't bother seeding in June, July, or mid-winter. Summer heat kills new seedlings, and frozen ground prevents germination. Patience pays off — wait for the right window.</blockquote>

<h2>3. Choosing the Right Seed for Wisconsin</h2>
<p>Seed selection matters more than most homeowners realize. For Madison lawns, stick with these cool-season varieties:</p>
<ul>
<li><strong>Kentucky Bluegrass:</strong> The gold standard for Madison lawns. Self-spreading via rhizomes, beautiful color, excellent cold tolerance. Needs full to partial sun (6+ hours)</li>
<li><strong>Perennial Ryegrass:</strong> Fast-germinating (5–7 days vs. 14–21 for bluegrass). Great for quick repairs and blending into existing lawns. Doesn't spread on its own</li>
<li><strong>Fine Fescue blend:</strong> Best for shaded areas under trees. Tolerates low fertility and less water. Ideal for Middleton and Shorewood Hills yards with heavy canopy</li>
<li><strong>Tall Fescue:</strong> Increasingly popular for its drought tolerance and deep root system. Good for full-sun areas that bake in summer</li>
</ul>
<p>For most repairs, a <strong>50/50 blend of Kentucky bluegrass and perennial ryegrass</strong> works perfectly. The ryegrass germinates fast and provides quick cover while the slower bluegrass fills in and creates a permanent, self-spreading repair.</p>

<h2>4. Step-by-Step Repair Process</h2>

<h3>Step 1: Clear the Area</h3>
<p>Rake out all dead grass, debris, and loose material. You want to expose bare soil. If the ground is hard and compacted, use a garden fork or hand aerator to loosen the top 2–3 inches.</p>

<h3>Step 2: Amend the Soil</h3>
<p>Spread a thin layer (quarter to half inch) of compost or topsoil over the bare area. This provides a nutrient-rich seedbed and improves seed-to-soil contact. For Dane County's clay soils, compost is especially helpful because it improves both drainage and moisture retention.</p>

<h3>Step 3: Spread the Seed</h3>
<p>Apply grass seed at the rate recommended on the bag — typically 8–10 seeds per square inch for a thick repair. Use a hand spreader for small patches or a drop spreader for larger areas. Spread in two passes at right angles for even coverage.</p>

<h3>Step 4: Lightly Rake and Press</h3>
<p>Gently rake the seed into the top quarter-inch of soil. Then tamp it down with your foot or a flat board. Good seed-to-soil contact is the number one factor in successful germination.</p>

<h3>Step 5: Water Consistently</h3>
<p>This is where most DIY repairs fail. New seed needs to stay consistently moist (not soaked) for 14–21 days. That means <strong>light watering 2–3 times per day</strong> for the first two weeks. A typical session is just 5–10 minutes — enough to keep the surface damp. Once seedlings are an inch tall, transition to deeper, less frequent watering.</p>

<h3>Step 6: First Mow</h3>
<p>Wait until the new grass reaches 3.5–4 inches before the first mow. Use a sharp blade and only remove one-third of the height. Avoid mowing when the soil is wet — young grass pulls out easily.</p>

<h2>5. When to Call a Professional</h2>
<p>Small bare spots (under 4 square feet) are straightforward DIY projects. But if you're dealing with large areas, persistent grub problems, fungal disease, or bare spots that keep coming back, it's time for professional help. A lawn care professional can diagnose underlying issues, apply targeted treatments, and perform overseeding with commercial equipment that delivers far better results than hand-seeding.</p>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care offers professional overseeding, <a href="/services/aeration">core aeration</a>, <a href="/services/fertilization">fertilization</a>, and <a href="/services/herbicide">weed control</a> throughout Madison and Dane County. If your bare spots keep coming back or your lawn needs more than a patch job, <a href="/contact">contact us</a> for a free lawn evaluation. We'll diagnose the problem, recommend the right solution, and get your lawn back to thick, healthy turf.</p>
`.trim();

  /* ---- Post 7 --------------------------------------------------- */
  const post7Content = `
<p>If you only do one thing for your lawn all year, make it a fall fertilization. Ask any turf professional in Wisconsin and they'll tell you the same thing: <strong>fall fertilizer is the single most impactful treatment you can give a Madison lawn</strong>. It's more important than spring fertilizer, more important than weed killer, and arguably more important than any other single maintenance step. Here's why — and how to do it right in Dane County.</p>

<h2>1. Why Fall Fertilization Matters So Much</h2>
<p>To understand why fall feeding is so critical, you need to understand how cool-season grasses work. Kentucky bluegrass, perennial ryegrass, and fine fescue — the grasses in virtually every Madison lawn — have a growth pattern that's counterintuitive:</p>
<ul>
<li><strong>Spring:</strong> Top growth (leaves) grows fast; root growth is moderate</li>
<li><strong>Summer:</strong> Both top and root growth slow dramatically</li>
<li><strong>Fall:</strong> Top growth slows, but <em>root growth explodes</em></li>
<li><strong>Late fall:</strong> Top growth stops, but roots continue growing until the soil freezes</li>
</ul>
<p>When you fertilize in fall, you're feeding the underground engine. The grass uses that nutrition to build a dense, deep root system that stores energy (carbohydrates) for winter survival and rapid spring green-up. A lawn that receives proper fall fertilization comes out of winter <strong>2–3 weeks ahead</strong> of an unfertilized lawn, with thicker growth and better color.</p>

<h2>2. Timing for Dane County</h2>
<p>Fall fertilization in the Madison area should happen in <strong>two rounds</strong>:</p>

<h3>Round 1: Early Fall (September 1–15)</h3>
<p>This application supports the active root growth period. Use a balanced fertilizer with a ratio close to 3-1-2 (nitrogen-phosphorus-potassium). The phosphorus supports root development, which is exactly what the grass is focused on right now.</p>

<h3>Round 2: Late Fall / Winterizer (October 15 – November 5)</h3>
<p>This is the "winterizer" application — the most important single fertilizer application of the entire year. Apply it after the grass has stopped growing upward but before the ground freezes. In Madison, that's typically late October to early November. The grass absorbs the nitrogen and stores it as carbohydrates in the crown and root system, providing the energy reserves it needs to survive Wisconsin's long winter and green up fast in April.</p>

<blockquote><strong>Dane County Timing Cue:</strong> Apply your winterizer around the time you do your final mowing for the season. When nighttime temperatures are consistently in the 30s but the ground hasn't frozen yet, that's your window. In most years, the last week of October through the first week of November is perfect for the Madison area.</blockquote>

<h2>3. What to Apply: Nitrogen Recommendations</h2>
<p>For the winterizer application, you want a <strong>high-nitrogen fertilizer with slow-release nitrogen</strong>. Here are the numbers:</p>
<ul>
<li><strong>Application rate:</strong> 1 to 1.5 pounds of actual nitrogen per 1,000 square feet</li>
<li><strong>Ideal ratio:</strong> Something like 32-0-10 or 28-0-3 (the phosphorus isn't critical for the winterizer round)</li>
<li><strong>Slow-release component:</strong> Look for at least 30–50% slow-release nitrogen on the label. This prevents a late flush of top growth you don't want before winter</li>
</ul>
<p>For the early fall application, use a more balanced product at 0.75 to 1 pound of nitrogen per 1,000 square feet.</p>

<h2>4. Organic vs. Synthetic: An Honest Comparison</h2>
<p>This is a topic Madison homeowners feel strongly about, especially with Dane County's environmental consciousness. Here's the honest breakdown:</p>

<h3>Organic Fertilizers</h3>
<ul>
<li><strong>Pros:</strong> Improve soil biology over time, slow nutrient release, lower runoff risk, better for Lake Mendota/Monona watersheds</li>
<li><strong>Cons:</strong> Lower nutrient concentration (need to apply more product), more expensive per pound of nitrogen, release is temperature-dependent so late fall applications may not fully break down</li>
<li><strong>Best for:</strong> The early fall application when soil temps are still warm enough for microbial activity</li>
</ul>

<h3>Synthetic Fertilizers</h3>
<ul>
<li><strong>Pros:</strong> Precise nutrient ratios, more affordable, available immediately to the plant, reliable in cool soil temperatures</li>
<li><strong>Cons:</strong> No soil-building benefit, higher runoff risk if applied before rain, can burn if over-applied</li>
<li><strong>Best for:</strong> The winterizer application when cooler soil temperatures slow organic breakdown</li>
</ul>

<p>Our recommendation? A <strong>hybrid approach</strong>: organic-based fertilizer for the September round, synthetic slow-release for the late October winterizer. This gives you the best of both worlds — soil health building during the active season and reliable nutrient delivery for winter carbohydrate storage.</p>

<h2>5. Common Mistakes to Avoid</h2>
<ul>
<li><strong>Applying too late:</strong> If the ground is already frozen, the fertilizer just sits on the surface and runs off with the first thaw — straight into Madison's lakes and waterways</li>
<li><strong>Applying too much:</strong> More is not better. Excess nitrogen causes a flush of tender top growth that's vulnerable to winter kill</li>
<li><strong>Skipping the fall and overloading in spring:</strong> Spring fertilization encourages leaf growth at the expense of roots. You end up with a lush-looking lawn in May that collapses in July</li>
<li><strong>Fertilizing over leaves:</strong> Clear fallen leaves before applying. Fertilizer stuck to leaves never reaches the soil. Complete your <a href="/services/leaf-removal">leaf removal</a> first</li>
<li><strong>Ignoring soil test results:</strong> If your soil pH is below 6.0 (common in some Dane County areas), the grass can't efficiently use the fertilizer you're applying. A lime application may be needed first</li>
</ul>

<h2>6. Pairing Fall Fertilization with Other Treatments</h2>
<p>For maximum impact, combine your early fall fertilization with <a href="/services/aeration">core aeration</a>. The aeration holes allow the fertilizer to penetrate directly into the root zone, dramatically increasing its effectiveness. If you're overseeding thin areas, do it the same day as aeration — the seed falls into the holes for perfect soil contact.</p>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care provides expert <a href="/services/fertilization">fertilization programs</a> designed specifically for Dane County soils and growing conditions. Our fall program includes both the early fall and winterizer applications, timed precisely for Madison's climate. We also offer <a href="/services/aeration">aeration</a> and overseeding packages that deliver the best possible results when combined with fall feeding. <a href="/contact">Contact us today</a> to set up your fall fertilization schedule.</p>
`.trim();

  /* ---- Post 8 --------------------------------------------------- */
  const post8Content = `
<p>Hiring a lawn care company sounds simple until you start looking. A quick search for "lawn care Madison WI" returns dozens of options — from solo operators with a truck and a mower to large national franchises. How do you tell the difference between a company that will transform your lawn and one that will ghost you after the second visit? Here's what to look for, what to ask, and what red flags to watch out for when choosing a lawn care provider in the Madison area.</p>

<h2>1. Start with Insurance and Licensing</h2>
<p>This is non-negotiable. Any lawn care company working on your Madison property should carry:</p>
<ul>
<li><strong>General liability insurance:</strong> Protects you if they damage your property (broken windows from flying rocks, damaged irrigation heads, etc.)</li>
<li><strong>Workers' compensation insurance:</strong> Protects you from liability if a crew member is injured on your property</li>
<li><strong>Commercial vehicle insurance:</strong> Their trucks and trailers should be commercially insured</li>
</ul>
<p>If a company can't provide proof of insurance, walk away — no matter how good their price is. In Wisconsin, if an uninsured worker is injured on your property, <em>you</em> could be liable. Ask to see their certificate of insurance (COI) and verify it's current.</p>

<blockquote><strong>Wisconsin-Specific:</strong> Companies applying <a href="/services/fertilization">fertilizer</a> or <a href="/services/herbicide">herbicides</a> in Wisconsin need a commercial pesticide applicator license from the Department of Agriculture, Trade and Consumer Protection (DATCP). Ask for their license number and verify it at the DATCP website. Unlicensed application is both illegal and dangerous.</blockquote>

<h2>2. Check Reviews — But Read Them Right</h2>
<p>Online reviews are helpful but require some interpretation:</p>
<ul>
<li><strong>Google Reviews:</strong> The most reliable platform. Look for companies with 50+ reviews and a rating of 4.5 or higher. Pay attention to how they respond to negative reviews — professionalism here reveals character</li>
<li><strong>Nextdoor:</strong> Neighborhood-specific recommendations from people who actually live nearby are gold. Dane County's Nextdoor groups are very active with lawn care discussions</li>
<li><strong>Facebook:</strong> Check their page for recent activity. A company that hasn't posted in six months may not be actively operating</li>
<li><strong>BBB:</strong> The Better Business Bureau rating matters less than the complaint history. Look for patterns of unresolved complaints</li>
</ul>
<p>Be wary of companies with fewer than 20 reviews that are all five stars. Also be suspicious of a sudden burst of reviews in a short period — this can indicate purchased reviews.</p>

<h2>3. The Consistency Question</h2>
<p>The biggest complaint Madison homeowners have about lawn care companies isn't quality — it's <strong>inconsistency</strong>. A company might do great work for three weeks, then skip a week, send a different crew who does sloppy work, or stop showing up entirely in August when it's hot.</p>
<p>Before signing up, ask these questions:</p>
<ul>
<li>"Will the same crew service my property each visit?"</li>
<li>"What happens if you can't make your scheduled day due to weather?"</li>
<li>"How do you handle service during dry spells when the lawn doesn't need mowing?"</li>
<li>"What's your communication policy — how will I know when you've been here?"</li>
</ul>
<p>Companies that use route management software and send service notifications (text or email) are generally more organized and reliable than those operating on handshake agreements.</p>

<h2>4. Why Local Matters in Madison</h2>
<p>National franchise lawn care companies serve a purpose, but there are real advantages to choosing a <strong>locally owned and operated</strong> company in the Madison area:</p>
<ul>
<li><strong>Local soil knowledge:</strong> A Madison-based company understands Dane County's clay soils, the specific weed pressures we face, and the timing nuances of our microclimate</li>
<li><strong>Weather responsiveness:</strong> Local companies adjust their schedules based on local conditions. National companies often follow corporate calendars that don't account for Madison's variable weather</li>
<li><strong>Accountability:</strong> The owner of a local company lives in your community. Their reputation is personal. They can't hide behind a corporate customer service line</li>
<li><strong>Customization:</strong> Local companies are more willing to tailor services to your specific needs rather than forcing you into a pre-packaged plan designed for the entire Midwest</li>
<li><strong>Community investment:</strong> Your money stays in the local economy, supporting other Madison-area families and businesses</li>
</ul>

<h2>5. Red Flags to Watch For</h2>
<p>Run — don't walk — from any lawn care company that:</p>
<ul>
<li><strong>Won't provide a written estimate:</strong> Verbal quotes lead to billing disputes. Always get it in writing</li>
<li><strong>Requires long-term contracts with steep cancellation fees:</strong> Reputable companies earn your business through quality, not legal lock-in</li>
<li><strong>Can't explain what products they use:</strong> You have a right to know what's being applied to your property, especially if you have children, pets, or environmental concerns</li>
<li><strong>Quotes dramatically below market rate:</strong> In the Madison market, weekly mowing for a standard lot should run $35–$65. If someone quotes $20, they're cutting corners on insurance, equipment maintenance, or crew wages</li>
<li><strong>Has no physical address or professional website:</strong> A legitimate company should have a verifiable business presence</li>
<li><strong>Pressures you into immediate decisions:</strong> "This price is only good today" is a sales tactic, not a business practice</li>
</ul>

<h2>6. What to Expect on Cost</h2>
<p>Here are typical price ranges for the greater Madison area (as of 2026) for a standard residential lot (6,000–12,000 sq ft of lawn):</p>
<ul>
<li><strong>Weekly mowing:</strong> $35–$65 per visit</li>
<li><strong>Fertilization program (4–6 rounds):</strong> $250–$500 annually</li>
<li><strong>Core aeration:</strong> $125–$250</li>
<li><strong>Fall cleanup:</strong> $175–$400</li>
<li><strong>Gutter cleaning:</strong> $125–$300</li>
<li><strong>Snow removal (per event):</strong> $35–$75 for driveway + walkways</li>
</ul>
<p>Companies that bundle services (mowing + fertilization + fall cleanup) typically offer 10–15% savings compared to purchasing each service individually.</p>

<h2>7. Questions to Ask Before Hiring</h2>
<p>Print this list and use it when evaluating companies:</p>
<ul>
<li>Are you insured and licensed for pesticide application in Wisconsin?</li>
<li>How long have you been serving the Madison area?</li>
<li>Can you provide references from current clients in my neighborhood?</li>
<li>What's included in your standard mowing visit? (Trimming, edging, blowing?)</li>
<li>How do you handle scheduling changes due to weather?</li>
<li>What's your cancellation policy?</li>
<li>Do you offer a satisfaction guarantee?</li>
</ul>

<h2>Need Professional Help?</h2>
<p>TotalGuard Yard Care is a locally owned lawn care company proudly serving Madison, Middleton, Verona, Sun Prairie, Fitchburg, and communities throughout Dane County. We're fully insured, licensed, and rated 5 stars by homeowners across the greater Madison area. We offer <a href="/services/mowing">mowing</a>, <a href="/services/fertilization">fertilization</a>, <a href="/services/aeration">aeration</a>, <a href="/services/gutter-cleaning">gutter services</a>, <a href="/services/snow-removal">snow removal</a>, and more — all with transparent pricing and no long-term contracts. <a href="/contact">Contact us today</a> for a free, no-pressure estimate.</p>
`.trim();

  return [
    {
      title: "How Often Should You Mow Your Lawn in Madison WI?",
      slug: "how-often-mow-lawn-madison-wi",
      excerpt: "Learn the ideal mowing frequency for every season in Madison, optimal cutting heights for Wisconsin grasses, and why timing matters more than you think.",
      content: post1Content,
      category: "faq-answers",
      keywords: ["lawn mowing frequency Madison", "how often mow lawn Wisconsin", "Madison lawn care schedule"],
      status: "published" as const,
      published_at: "2026-02-08T10:00:00.000Z",
      reading_time: readingTime(post1Content),
      meta_title: "How Often to Mow Your Lawn in Madison WI",
      meta_description: "Wisconsin-specific mowing frequency guide for Madison homeowners. Seasonal schedules, optimal heights, and expert tips for a healthier lawn.",
    },
    {
      title: "The Complete Guide to Lawn Aeration in Madison",
      slug: "lawn-aeration-guide-madison-wi",
      excerpt: "Why Madison's clay-heavy soil needs core aeration, the best time to aerate in Wisconsin, and what to expect from professional aeration services.",
      content: post2Content,
      category: "service-guides",
      keywords: ["lawn aeration Madison WI", "core aeration Wisconsin", "when to aerate lawn Madison"],
      status: "published" as const,
      published_at: "2026-02-12T10:00:00.000Z",
      reading_time: readingTime(post2Content),
      meta_title: "Lawn Aeration Guide for Madison WI Homeowners",
      meta_description: "Complete guide to core aeration for Madison lawns. Learn why Dane County's clay soil needs it, best timing, DIY vs pro, and what results to expect.",
    },
    {
      title: "Summer Watering Guide for Wisconsin Lawns",
      slug: "summer-watering-guide-wisconsin-lawns",
      excerpt: "How much to water, when to water, and how to avoid the most common watering mistakes that kill Madison lawns every summer.",
      content: post3Content,
      category: "seasonal-tips",
      keywords: ["lawn watering schedule Madison", "summer lawn care Wisconsin", "how much water lawn needs"],
      status: "published" as const,
      published_at: "2026-02-16T10:00:00.000Z",
      reading_time: readingTime(post3Content),
      meta_title: "Summer Lawn Watering Guide for Madison WI",
      meta_description: "Science-based watering guide for Madison lawns. Learn the right amount, best time of day, drought management, and signs of over- and under-watering.",
    },
    {
      title: "Gutter Cleaning Guide for Madison Homeowners",
      slug: "gutter-cleaning-guide-madison-homeowners",
      excerpt: "When to clean your gutters in Madison, why neglect leads to costly damage, and how gutter guards can save you time and money.",
      content: post4Content,
      category: "service-guides",
      keywords: ["gutter cleaning Madison WI", "when to clean gutters Wisconsin", "gutter maintenance tips"],
      status: "published" as const,
      published_at: "2026-02-20T10:00:00.000Z",
      reading_time: readingTime(post4Content),
      meta_title: "Gutter Cleaning Guide for Madison WI Homes",
      meta_description: "Essential gutter cleaning guide for Madison homeowners. Ideal timing, ice dam prevention, DIY risks, and what professional service includes.",
    },
    {
      title: "Best Lawn Care Practices for Middleton WI Homeowners",
      slug: "lawn-care-practices-middleton-wi",
      excerpt: "Middleton-specific lawn care advice covering local soil types, HOA requirements, water considerations, and a complete seasonal maintenance calendar.",
      content: post5Content,
      category: "local-guides",
      keywords: ["lawn care Middleton WI", "Middleton Wisconsin landscaping", "yard maintenance Middleton"],
      status: "published" as const,
      published_at: "2026-02-24T10:00:00.000Z",
      reading_time: readingTime(post5Content),
      meta_title: "Lawn Care Guide for Middleton WI Homeowners",
      meta_description: "Middleton-specific lawn care guide with local soil info, HOA tips, seasonal schedules, and solutions for common yard problems in the area.",
    },
    {
      title: "How to Fix Bare Spots in Your Madison Lawn",
      slug: "fix-bare-spots-madison-lawn",
      excerpt: "Step-by-step guide to diagnosing and repairing bare spots in your lawn, with Wisconsin-specific seed recommendations and timing advice.",
      content: post6Content,
      category: "how-to",
      keywords: ["fix bare spots lawn Madison", "lawn repair Wisconsin", "reseeding bare spots"],
      status: "published" as const,
      published_at: "2026-02-28T10:00:00.000Z",
      reading_time: readingTime(post6Content),
      meta_title: "How to Fix Bare Spots in Madison WI Lawns",
      meta_description: "Fix bare spots in your Madison lawn with this step-by-step guide. Diagnose the cause, choose the right seed, and repair like a pro.",
    },
    {
      title: "Fall Fertilization: The Most Important Treatment for Madison Lawns",
      slug: "fall-fertilization-madison-lawns",
      excerpt: "Why fall fertilizer matters more than any other treatment, the best timing for Dane County, and how to choose between organic and synthetic options.",
      content: post7Content,
      category: "seasonal-tips",
      keywords: ["fall fertilization Madison WI", "winterizer fertilizer Wisconsin", "when to fertilize fall"],
      status: "published" as const,
      published_at: "2026-03-03T10:00:00.000Z",
      reading_time: readingTime(post7Content),
      meta_title: "Fall Fertilization Guide for Madison WI Lawns",
      meta_description: "Fall fertilization is the #1 lawn treatment for Madison. Learn the ideal timing, nitrogen rates, organic vs synthetic, and mistakes to avoid.",
    },
    {
      title: "How to Choose a Lawn Care Company in Madison WI",
      slug: "choose-lawn-care-company-madison-wi",
      excerpt: "What to look for in a Madison lawn care company, questions to ask, red flags to avoid, and realistic cost expectations for Dane County.",
      content: post8Content,
      category: "faq-answers",
      keywords: ["best lawn care company Madison", "choosing lawn service Wisconsin", "lawn care reviews Madison"],
      status: "published" as const,
      published_at: "2026-03-06T10:00:00.000Z",
      reading_time: readingTime(post8Content),
      meta_title: "How to Choose a Lawn Care Company in Madison",
      meta_description: "Guide to choosing the right lawn care company in Madison WI. Insurance checks, review tips, red flags, pricing expectations, and questions to ask.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const posts = getSeedPosts();
  const slugs = posts.map((p) => p.slug);

  /* Check which slugs already exist */
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug")
    .in("slug", slugs);

  const existingSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  const toInsert = posts.filter((p) => !existingSlugs.has(p.slug));

  if (toInsert.length === 0) {
    return NextResponse.json({
      message: "All 8 blog posts already exist. Nothing to insert.",
      skipped: slugs,
    });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(toInsert)
    .select("slug, title");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Inserted ${data?.length ?? 0} blog posts. Skipped ${existingSlugs.size} existing.`,
    inserted: data?.map((r: { slug: string }) => r.slug) ?? [],
    skipped: Array.from(existingSlugs),
  });
}
