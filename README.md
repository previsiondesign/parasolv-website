# parasolv.com — the Parasolv product-family site

Static site, no build step. One Cloudflare Worker (`parasolv`, see
`wrangler.jsonc`) serves this directory as assets. Repo:
`github.com/previsiondesign/parasolv-website` (this folder is the repo root).

```
/               index.html        family landing (Shadow + Match)
/assets/        styles.css, parasolv_icon.svg, favicon.png, logo.png   shared design system
/shadow/        Parasolv Shadow   (was the whole repo; pages reference ../assets/)
/match/         Parasolv Match    (was viewmatchpro.com; rebranded, own styles.css)
/404.html       served for unknown paths
/_retired/      viewmatchpro.com hosting leftovers (_redirects, latest_version.txt,
                the Pages webhook function) — superseded by the api Worker in the
                Berm Labs repo; kept for reference, never deployed (.assetsignore)
```

`/earth` is deliberately not here yet — parked until Parasolv Earth is defined.

## Local preview

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://localhost:8765/ , /shadow/ , /match/ . (The Claude Code
Browser pane config for this is in `.claude/launch.json`, gitignored.)

## Deploy (Cloudflare Workers, same pattern as bermlabs.com)

Live since 2026-09-09: Workers Build connected to this repo, Worker `parasolv`,
no build command, deploy command `npx wrangler deploy`. Every push to `main`
redeploys in about 30 s. Preview: https://parasolv.ap-development.workers.dev

The zone routes in `wrangler.jsonc` are attached; parasolv.com answers as
soon as the domain's nameservers point at Cloudflare (runbook step C).

Note: `html_handling` serves pages extensionless and 307-redirects `.html`
requests, so the canonical activation URL is `/match/activate` (set the api
Worker's `ACTIVATE_URL` to `https://parasolv.com/match/activate`).

Landmine carried over from bermlabs.com: use **zone routes**, not
`custom_domain`, if the imported DNS records for `@`/`www` are proxied.

## Domain runbook: parasolv.com from Wix to Porkbun

Recon on 2026-09-09 (`rdap.verisign.com`, `nslookup`, `curl`):

| Item | Value |
|---|---|
| Registrar of record | Network Solutions (Wix registers through them) |
| Status | `clientTransferProhibited` (locked — normal, unlock in Wix) |
| Nameservers | ns10 / ns11.wixdns.net |
| Registered / last changed | 2016-09-23 / 2025-09-30 — no ICANN 60-day lock in play |
| **Expires** | **2026-09-23** — 14 days from recon |
| MX records | none — no mail to preserve |
| Website | apex **and** www return a Wix 404 — nothing is live |

Timing: Wix says a transfer takes up to 7 days and that Wix cannot speed it
up; Porkbun says 5–7 days unless the losing registrar approves early. That
fits inside the 14-day window only if it starts now. Because nothing is
served on the domain and there is no mail, a transfer cannot break anything
that currently works.

**Safety net:** leave Wix auto-renew ON until the transfer completes. Worst
case Wix bills one renewal on 09-23 mid-transfer; the alternative (auto-renew
off, transfer stalls, domain expires into grace) is worse. Do not renew
manually at Wix — a Porkbun transfer already adds one year.

### A. At Wix (owner)
1. Wix account → **Domains** → `⋯` (Domain Actions) next to parasolv.com.
2. If **Private Registration** is on, turn it off first, and confirm the
   registrant contact email is one you read — the EPP code and the approval
   email both go there.
3. **Transfer away from Wix** → Transfer Domain → *I still want to transfer*.
   This unlocks the domain and emails the EPP / authorization code.

### B. At Porkbun (owner — payment step, do it yourself)
1. https://porkbun.com/transfer → domain `parasolv.com` (no www) → paste the
   auth code → Submit.
2. Keep WHOIS privacy and auto-renew checked → Add Transfers to Cart →
   Continue to Billing → pay (a .com transfer includes one year).
3. Watch the registrant inbox for a **transfer approval** email from Network
   Solutions / Wix and approve it — that is the only way to finish in less
   than ~5 days. Status is visible under Porkbun → Account → Transfers.
4. When it lands at Porkbun the nameservers are unchanged (still wixdns).
   Nothing to do — nothing is being served.

### C. Straight on to Cloudflare (LAUNCH_PLAN §3 Phase 2)
The plan's reason for keeping Wix DNS ("keep the Wix site live until
relaunch") no longer applies — the Wix site is a 404. So immediately after
the transfer:
1. Cloudflare → Add a domain → parasolv.com. Let it scan; keep any imported
   records DNS-only for now.
2. Porkbun → parasolv.com → Nameservers → the two Cloudflare nameservers.
3. When the zone shows Active, parasolv.com is live; then `api.parasolv.com`
   per LAUNCH_PLAN, then the Resend/M365 email steps
   (`support@parasolv.com` must be an M365 alias before it goes on the site
   for real — every page here already links to it).

## Content follow-ups (not blocking deploy)
- Both product sites are still pre-launch: Match's pricing section is hidden
  and its CTAs are "Notify me"; Shadow's `checkout.html` is a Lemon Squeezy
  mock but the store is Polar — replace or drop it.
- `match/terms.html`, `privacy.html`, `refund.html` are templates with
  `[DATE]` placeholders; attorney review per LAUNCH_PLAN. Shadow links to the
  Match copies for now.
- `match/index.html` CONFIG still has a placeholder download URL.
- Screenshot placeholders throughout Shadow; before/after images in Match.
- This repo is **public** on GitHub. It contains the site copy .docx and the
  `_copy_doc` tooling; fine for a marketing site, but keep secrets and
  unreleased pricing out of it.
