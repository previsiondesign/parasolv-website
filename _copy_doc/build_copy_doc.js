const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, PageOrientation, BorderStyle
} = require('docx');

// Helper builders
const P = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, ...opts.run })],
  spacing: { after: 120 },
  ...opts.para
});
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true })] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, bold: true })] });
const Label = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, color: "0078D4", size: 18 })],
  spacing: { before: 160, after: 60 }
});
const Small = (text) => new Paragraph({
  children: [new TextRun({ text, italics: true, color: "666666", size: 18 })],
  spacing: { after: 120 }
});
const Bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [new TextRun(text)]
});
const Rule = () => new Paragraph({
  children: [new TextRun("")],
  border: { bottom: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } },
  spacing: { before: 240, after: 240 }
});

const sections = [{
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    }
  },
  children: [
    // Cover
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Parasolv Website — Site Copy", bold: true, size: 44 })],
      spacing: { before: 2400, after: 240 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "All text from the current mockup, organized by page.", italics: true, color: "666666", size: 22 })],
      spacing: { after: 120 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Edit directly in this document, then paste the updated version back.", italics: true, color: "666666", size: 22 })],
      spacing: { after: 2400 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Generated 2026-04-21", color: "999999", size: 18 })]
    }),
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

    // ============ GLOBAL ELEMENTS ============
    H1("Global elements"),
    Small("Text that appears on every page."),

    Label("Brand wordmark"),
    P("parasolv"),

    Label("Header navigation"),
    Bullet("Home"),
    Bullet("Features"),
    Bullet("Pricing"),
    Bullet("Quickstart"),
    Bullet("Docs"),
    Bullet("CTA button: Start free trial"),

    Label("Footer — tagline under logo"),
    P("Shadow analysis, solar studies, and design envelopes for SketchUp — made by designers, for designers."),

    Label("Footer — column: Product"),
    Bullet("Features"),
    Bullet("Pricing"),
    Bullet("Quickstart"),
    Bullet("Documentation"),

    Label("Footer — column: Company"),
    Bullet("About"),
    Bullet("Contact"),
    Bullet("Blog"),

    Label("Footer — column: Legal"),
    Bullet("Terms"),
    Bullet("Privacy"),
    Bullet("EULA"),

    Label("Footer — bottom row"),
    P("© 2026 Parasolv. All rights reserved."),
    P("Payments by Lemon Squeezy."),

    Rule(),

    // ============ LANDING PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Landing (index.html)"),

    H2("Hero"),
    Label("Eyebrow tag"),
    P("Windows + MacOS"),
    Label("Headline"),
    P("Powerful shadow analysis toolbox for SketchUp."),
    Label("Lede"),
    P("Parasolv is a full suite of tools to generate fast, accurate, an visually compelling shadow studies, all without ever leaving SketchUp. Built for professionals, but with a simple interface anyone can use."),
    Label("CTA buttons"),
    Bullet("Primary: Start free trial"),
    Bullet("Secondary: See features"),
    Label("Credibility sub-line (under CTA)"),
    P("Built on a decade of in-house use — outputs relied on by municipal planning agencies and private practice."),
    Label("Hero image caption"),
    Small("Screenshot: Parasolv Advanced Mode with shadow-fan overlay on a mid-rise massing"),

    H2("Social-proof strip — \u201CIn practice\u201D"),
    Label("Eyebrow"),
    P("In practice"),
    Label("Firm names (replace with real names)"),
    Bullet("[Firm name 1]"),
    Bullet("[Firm name 2]"),
    Label("Agency line (replace bracketed names with real agencies)"),
    P("Outputs from Parasolv have supported planning reviews at [City agency 1], [City agency 2], and [City agency 3] — based on the same analysis engine used in-house for over a decade."),

    H2("Feature grid — \u201CWhat you get\u201D"),
    Label("Section eyebrow / heading"),
    P("What you get"),
    P("Every tool a shadow study needs, right inside SketchUp."),

    Label("Card 1 — Shadow Fan"),
    P("Sweep the sun\u2019s path and visualize shadow envelopes across any day, season, or full year — directly on the model."),
    Label("Card 2 — Receptor Analysis"),
    P("Classify entities as sources or receptors and measure exposure with quantifiable outputs, not eyeballed screenshots."),
    Label("Card 3 — PV Assessment"),
    P("Evaluate photovoltaic potential on any surface using the same solar model as your shadow studies."),
    Label("Card 4 — Batch Processing"),
    P("Run iterative studies overnight. Compare dozens of massing options without babysitting the tool."),
    Label("Card 5 — Design Envelopes"),
    P("Generate maximum-buildable volumes that respect shadow constraints on neighboring sites."),
    Label("Card 6 — Scenario Compare"),
    P("Layer baseline against variants. Export to CSV for reports, planning submissions, and client reviews."),

    H2("Storytelling row 1 — Shadow Fan"),
    Label("Eyebrow"),
    P("Shadow Fan"),
    Label("Heading"),
    P("See the whole day in one glance."),
    Label("Body"),
    P("The Shadow Fan visualization overlays shadow positions across a chosen time range onto your model. Check solar access on a public space, sun-hour compliance on a neighboring window, or seasonal exposure on a PV array — without rendering a single frame."),
    Label("CTA"),
    P("Explore Shadow Fan"),
    Label("Image caption"),
    Small("Screenshot: Shadow Fan across Dec 21 showing hourly envelope bands"),

    H2("Storytelling row 2 — Receptors & Results"),
    Label("Eyebrow"),
    P("Receptors & Results"),
    Label("Heading"),
    P("Data you can put in a report."),
    Label("Body"),
    P("Tag neighboring buildings, open space, or individual facades as receptors. Parasolv computes sun-hours, shadow-hours, and overshadowing metrics — then exports clean CSVs for planning submissions."),
    Label("CTA"),
    P("See result outputs"),
    Label("Image caption"),
    Small("Screenshot: Receptor panel with per-receptor sun-hour breakdown + gradient overlay"),

    H2("Storytelling row 3 — Batch & Envelope"),
    Label("Eyebrow"),
    P("Batch & Envelope"),
    Label("Heading"),
    P("For when one study isn\u2019t enough."),
    Label("Body"),
    P("The Studio tier adds batch processing and design-envelope generation — so you can explore dozens of massing options, or back-solve the largest building the site can support without overshadowing its neighbors."),
    Label("CTA"),
    P("Studio workflows"),
    Label("Image caption"),
    Small("Screenshot: Design envelope solid generated from shadow constraints"),

    H2("Closing CTA"),
    Label("Heading"),
    P("Ready to try it?"),
    Label("Body"),
    P("Download the plugin, run a shadow study on your own model, and decide from there. No card required for the free Lite tier."),
    Label("Buttons"),
    Bullet("Primary: See pricing"),
    Bullet("Secondary: Quickstart guide"),

    Rule(),

    // ============ FEATURES PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Features (features.html)"),

    H2("Page header"),
    Label("Eyebrow"),
    P("Features"),
    Label("Headline"),
    P("Everything Parasolv does."),
    Label("Lede"),
    P("Each module below corresponds to a panel in the plugin. Tier badges show where each capability lives."),

    H2("Module 1 — Classifier & Analysis Settings"),
    Label("Eyebrow"),
    P("Setup"),
    Label("Heading"),
    P("Classifier & Analysis Settings"),
    Label("Body"),
    P("Tag model entities as sources (shadow casters) or receptors (the surfaces you care about). Configure location, date ranges, and grid resolution once — Parasolv remembers it for the rest of your study."),
    Label("Tier badges"),
    P("Lite · Pro · Studio"),

    H2("Module 2 — Shadow Fan & Graphics"),
    Label("Eyebrow"),
    P("Shadow Analysis"),
    Label("Heading"),
    P("Shadow Fan & Graphics"),
    Label("Body"),
    P("The core of the plugin. Sweep the sun across any day or season and see the shadow envelope live on your model. Tune gradient, opacity, and banding from the Graphics panel without leaving the workflow."),
    Label("Tier badges"),
    P("Pro · Studio"),

    H2("Module 3 — PV Assessment"),
    Label("Eyebrow"),
    P("Solar Impact"),
    Label("Heading"),
    P("PV Assessment"),
    Label("Body"),
    P("Evaluate photovoltaic potential on any face using the same solar model as your shadow studies. Great for early-stage feasibility on roofs, facades, and canopies."),
    Label("Tier badges"),
    P("Pro · Studio"),

    H2("Module 4 — Batch & Mask Mode"),
    Label("Eyebrow"),
    P("Processing"),
    Label("Heading"),
    P("Batch & Mask Mode"),
    Label("Body"),
    P("Batch runs a queue of configurations end-to-end. Mask Mode hides non-essential geometry during analysis to speed up heavy models. Studio users can schedule batches to run overnight."),
    Label("Tier badges"),
    P("Pro (Mask only) · Studio (full Batch)"),

    H2("Module 5 — Design Envelope Generation"),
    Label("Eyebrow"),
    P("Design Tools"),
    Label("Heading"),
    P("Design Envelope Generation"),
    Label("Body"),
    P("Back-solve the largest volume a site can support without overshadowing defined receptors. Export the envelope as a SketchUp group for massing studies and feasibility reports."),
    Label("Tier badges"),
    P("Studio"),

    H2("Module 6 — Scenario Management & CSV Export"),
    Label("Eyebrow"),
    P("Results"),
    Label("Heading"),
    P("Scenario Management & CSV Export"),
    Label("Body"),
    P("Layer variants on top of a baseline. Compare receptor-level metrics at a glance, then export structured CSVs ready for planning submissions, compliance reports, or client markdown."),
    Label("Tier badges"),
    P("Pro (up to 5) · Studio (unlimited)"),

    H2("Closing CTA"),
    Label("Heading"),
    P("Pick the tier that fits your practice."),
    Label("Body"),
    P("Lite is free. Pro and Studio include a 14-day trial."),
    Label("Button"),
    P("See pricing"),

    Rule(),

    // ============ PRICING PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Pricing (pricing.html)"),

    H2("Page header"),
    Label("Eyebrow"),
    P("Pricing"),
    Label("Headline"),
    P("One tool, three ways to use it."),
    Label("Lede"),
    P("Prices shown in USD. Cancel anytime. Payments processed by Lemon Squeezy — VAT and sales tax handled for you."),
    Label("Disclaimer"),
    P("Indicative pricing — final figures confirmed at checkout."),

    H2("Tier 1 — Lite"),
    Label("Audience"),
    P("Architects & students"),
    Label("Name / price"),
    P("Lite — $0 / forever"),
    Label("Tagline"),
    P("Get a feel for the plugin on real projects. No card required."),
    Label("Features included"),
    Bullet("Classifier & Setup"),
    Bullet("Single-day shadow study"),
    Bullet("Lite UI mode"),
    Bullet("1 scenario, in-viewport only"),
    Label("Features excluded"),
    Bullet("No CSV export"),
    Bullet("No PV, batch, or envelope"),
    Label("CTA"),
    P("Download free"),

    H2("Tier 2 — Pro (featured)"),
    Label("Featured pill"),
    P("Most popular"),
    Label("Audience"),
    P("Practicing architects & urban designers"),
    Label("Name / price"),
    P("Pro — $29 / month"),
    Label("Tagline"),
    P("Or $290/year — save two months. 14-day free trial."),
    Label("Features included"),
    Bullet("Everything in Lite"),
    Bullet("Full Shadow Fan & Graphics"),
    Bullet("PV Assessment"),
    Bullet("Mask Mode"),
    Bullet("Up to 5 scenarios"),
    Bullet("CSV export"),
    Bullet("Advanced UI mode"),
    Bullet("Email support"),
    Label("CTA"),
    P("Start 14-day trial"),

    H2("Tier 3 — Studio"),
    Label("Audience"),
    P("Consultants & studios"),
    Label("Name / price"),
    P("Studio — $79 / month"),
    Label("Tagline"),
    P("Or $790/year. 14-day free trial."),
    Label("Features included"),
    Bullet("Everything in Pro"),
    Bullet("Batch Processing"),
    Bullet("Design Envelope generation"),
    Bullet("Unlimited scenarios"),
    Bullet("Scenario comparison tools"),
    Bullet("Methodology & compliance docs"),
    Bullet("Priority support"),
    Bullet("Studio quickstart track"),
    Label("CTA"),
    P("Start 14-day trial"),

    H2("Comparison table headers"),
    P("Feature · Lite · Pro · Studio"),
    Label("Rows (feature name)"),
    Bullet("Classifier & Setup"),
    Bullet("Single-day shadow study"),
    Bullet("Full Shadow Fan (any range)"),
    Bullet("Graphics / gradient overlays"),
    Bullet("PV Assessment"),
    Bullet("Mask Mode"),
    Bullet("CSV export"),
    Bullet("Scenarios — Lite: 1, Pro: 5, Studio: Unlimited"),
    Bullet("Batch Processing"),
    Bullet("Design Envelope generation"),
    Bullet("Scenario comparison — Pro: Manual, Studio: Built-in"),
    Bullet("Support — Lite: Community, Pro: Email, Studio: Priority"),

    H2("FAQ section"),
    Label("Eyebrow / Heading"),
    P("FAQ"),
    P("Common questions."),

    Label("Q1"),
    P("Which SketchUp version does Parasolv support?"),
    Label("A1"),
    P("SketchUp 2026 and later on both Windows and macOS (Apple Silicon). Older versions are not supported."),

    Label("Q2"),
    P("How does billing work?"),
    Label("A2"),
    P("Subscriptions are billed monthly or annually via Lemon Squeezy. Cancel anytime from the customer portal — you keep access until the end of the billing period."),

    Label("Q3"),
    P("Can I use one license on multiple machines?"),
    Label("A3"),
    P("Each subscription covers up to two machines (e.g. office desktop + laptop) for the same user. Team plans are available — contact us."),

    Label("Q4"),
    P("Is there a student or academic discount?"),
    Label("A4"),
    P("The Lite tier is free for everyone. Academic discounts on Pro and Studio are available on request with proof of enrollment."),

    Label("Q5"),
    P("Do you offer refunds?"),
    Label("A5"),
    P("14-day free trials on Pro and Studio let you evaluate before paying. If something goes wrong after that, get in touch — we\u2019ll sort it out."),

    Label("Q6"),
    P("Can I upgrade or downgrade?"),
    Label("A6"),
    P("Yes, at any time. Pro-rata adjustments are handled automatically by Lemon Squeezy."),

    Rule(),

    // ============ QUICKSTART PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Quickstart (quickstart.html)"),

    H2("Page header"),
    Label("Eyebrow"),
    P("Quickstart"),
    Label("Headline"),
    P("From install to first study in 15 minutes."),
    Label("Lede"),
    P("Pick the track that fits you. Architect is written for anyone comfortable in SketchUp. Studio dives deeper into methodology and advanced workflows."),
    Label("Track toggle labels"),
    Bullet("Architect track"),
    Bullet("Studio track"),

    H2("Architect track"),

    Label("Step 01"),
    H3("Install the plugin"),
    P("Download Parasolv from your account page, double-click the .rbz, and restart SketchUp. The Parasolv panel appears in the Extensions menu."),
    Small("Screenshot: SketchUp extensions menu with Parasolv highlighted"),

    Label("Step 02"),
    H3("Set your location & date"),
    P("Open the Setup panel, confirm the model location, and choose the day (or range) you want to analyze. Parasolv uses SketchUp\u2019s native geolocation so you don\u2019t need to re-enter it."),
    Small("Screenshot: Setup panel with location + date selector"),

    Label("Step 03"),
    H3("Classify your model"),
    P("Tag buildings and obstructions as sources, and the surfaces you care about (neighboring facades, public space, gardens) as receptors. Think of it as telling the plugin \u201Cwhat\u2019s casting shadow\u201D vs. \u201Cwhat you\u2019re measuring.\u201D"),
    Small("Screenshot: Classifier panel with entity list + coloured preview"),

    Label("Step 04"),
    H3("Run your first study"),
    P("Hit Run. Shadow Fan overlays appear on the model within seconds for a single day; a full-year study takes a minute or two depending on receptor count."),
    Small("Screenshot: Model with live Shadow Fan overlay"),

    Label("Step 05"),
    H3("Read the results"),
    P("The Results panel lists each receptor with sun-hours and shadow-hours. The gradient overlay on the model shows where exposure is highest and lowest at a glance."),
    Small("Screenshot: Results panel with receptor table + gradient legend"),

    Label("Step 06"),
    H3("Export for your report"),
    P("Pro and Studio tiers export CSVs ready for planning submissions or client decks. Lite users can screenshot the viewport overlay."),
    Small("Screenshot: CSV preview with per-receptor metrics"),

    H2("Studio track"),

    Label("Step 01"),
    H3("Grid resolution & sampling"),
    P("Studio users should tune grid resolution before running compliance studies. As a rule of thumb: 0.25 m for facade receptors where local planning guidance requires sub-metre accuracy, 1.0 m for open-space studies. See the methodology reference for per-jurisdiction notes."),
    Small("Screenshot: Analysis Settings with grid resolution + timestep controls"),

    Label("Step 02"),
    H3("Batch configuration"),
    P("Queue multiple massing variants in one run. Each entry can override the source set, date range, or envelope constraints. Batches serialize to JSON — check them into your project repo for reproducibility."),
    Small("Screenshot: Batch configuration JSON with queued scenarios"),

    Label("Step 03"),
    H3("Design Envelope workflow"),
    P("Define the shadow constraint (e.g. \u201C\u2265 2 hrs sun on Mar 21, 10:00\u201316:00, on this facade\u201D), then generate the maximum-buildable volume that satisfies it. The result is a SketchUp solid you can union with your site boundary for developable-area studies."),
    Small("Screenshot: Envelope generation with constraint dialog"),

    Label("Step 04"),
    H3("Scenario comparison"),
    P("Layer any number of scenarios over a baseline. The comparison view highlights deltas per receptor — useful for planning appeals where you need to demonstrate that a scheme does not degrade existing conditions."),
    Small("Screenshot: Scenario diff view with +/- deltas per receptor"),

    Label("Step 05"),
    H3("PV assessment methodology"),
    P("PV output estimates use clear-sky irradiance combined with the Parasolv solar model. Calibrate against TMY data for your region if you need compliance-grade numbers; otherwise the default profile is good for feasibility-stage estimates."),
    Small("Screenshot: PV surface heatmap with irradiance legend"),

    Label("Step 06"),
    H3("CSV schema & automation"),
    P("Exported CSVs follow a documented schema: receptor_id, date, sun_hours, shadow_hours, met_criteria. Hook them into Excel, Grasshopper, or Python for bespoke reporting pipelines."),
    Small("Screenshot: CSV schema reference with column definitions"),

    H2("Closing CTA"),
    Label("Heading"),
    P("Stuck somewhere?"),
    Label("Body"),
    P("Full documentation is available — or reach out if you\u2019re on Pro or Studio."),
    Label("Buttons"),
    Bullet("Secondary: Read the docs"),
    Bullet("Primary: Contact support"),

    Rule(),

    // ============ DOCS PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Docs (docs.html)"),

    H2("Page header"),
    Label("Eyebrow"),
    P("Documentation"),
    Label("Headline"),
    P("Everything you need to master Parasolv."),
    Label("Lede"),
    P("Reference material, methodology notes, and troubleshooting guides. Full docs are under development — the sections below sketch the structure."),

    H2("Doc cards (6)"),

    Label("Card 1"),
    P("Getting started — Install & first study"),
    P("Platform requirements, plugin installation, account setup, and a walkthrough of your first shadow analysis."),
    P("Button: Read"),

    Label("Card 2"),
    P("Reference — Panel by panel"),
    P("Every control in every panel — Setup, Classifier, Shadow Fan, Graphics, PV, Batch, Envelope, Results."),
    P("Button: Coming soon"),

    Label("Card 3"),
    P("Methodology — The solar model"),
    P("How Parasolv computes shadow geometry and irradiance. Includes calibration notes and jurisdiction-specific guidance."),
    P("Button: Coming soon"),

    Label("Card 4"),
    P("Workflows — Compliance studies"),
    P("BRE 209, APP0301, and local planning guidance — how to structure a Parasolv study that satisfies each standard."),
    P("Button: Coming soon"),

    Label("Card 5"),
    P("Reference — CSV schema"),
    P("Column-by-column definition of exported CSVs, with Python and Excel examples."),
    P("Button: Coming soon"),

    Label("Card 6"),
    P("Troubleshooting — Common issues"),
    P("Model performance, platform-specific quirks, plugin logs, and how to file an effective bug report."),
    P("Button: Coming soon"),

    H2("Closing CTA"),
    Label("Heading"),
    P("Can\u2019t find what you need?"),
    Label("Body"),
    P("Email support is included on Pro. Priority support on Studio."),
    Label("Button"),
    P("Contact support"),

    Rule(),

    // ============ CHECKOUT PAGE ============
    new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),
    H1("Page: Checkout mock (checkout.html)"),

    H2("Page background"),
    Label("Eyebrow"),
    P("Checkout"),
    Label("Headline"),
    P("You\u2019ve selected [TIER]."),
    Label("Body"),
    P("This is a mock of the Lemon Squeezy checkout overlay. In production, clicking a pricing CTA opens the overlay on top of the pricing page — this static page shows what that experience will look like."),

    H2("Lemon Squeezy overlay panel"),
    Label("Brand line"),
    P("🍋 Lemon Squeezy secure checkout"),
    Label("Panel title (dynamic)"),
    Bullet("Lite: Parasolv Lite — Free download"),
    Bullet("Pro: Parasolv Pro — Monthly"),
    Bullet("Studio: Parasolv Studio — Monthly"),
    Label("Subtitle"),
    P("14-day free trial. Cancel anytime."),
    Label("Line items"),
    Bullet("Parasolv [Tier] subscription — [Price]"),
    Bullet("VAT (handled by Lemon Squeezy) — Calculated at next step"),
    Bullet("Due today — $0.00"),
    Label("Form field labels"),
    Bullet("Email"),
    Bullet("Card number"),
    Bullet("Expiry"),
    Bullet("CVC"),
    Bullet("Country"),
    Label("Pay button (dynamic)"),
    Bullet("Lite: Download free"),
    Bullet("Pro / Studio: Start free trial"),
    Label("Fine print"),
    P("You won\u2019t be charged until your trial ends. Powered by Lemon Squeezy — merchant of record for Parasolv Ltd.")
  ]
}];

const doc = new Document({
  creator: "Parasolv",
  title: "Parasolv Website Copy",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Calibri", color: "0078D4" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri", color: "222222" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: "333333" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 270 } } }
      }]
    }]
  },
  sections
});

Packer.toBuffer(doc).then(buffer => {
  const out = path.join(__dirname, '..', 'parasolv-site-copy.docx');
  fs.writeFileSync(out, buffer);
  console.log("Wrote: " + out);
});
