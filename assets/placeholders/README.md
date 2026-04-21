# Placeholder images

All screenshot slots on the mockup site are rendered as styled `<div class="ph">` boxes with dashed borders and a caption. No binary PNGs are required — the mockup works as-is.

## Swapping in real screenshots

When real renders of the plugin are ready, replace the placeholder divs with `<img>` tags:

```html
<!-- before -->
<div class="ph ph-16-9">Screenshot: Shadow Fan across Dec 21</div>

<!-- after -->
<img src="assets/placeholders/shadow-fan-dec21.png" class="ph-16-9" alt="Shadow Fan across Dec 21" />
```

Or keep the `<div class="ph">` wrapper and nest the image inside — that preserves the framing and caption overlay.

## Suggested image list

| Slot | Filename | Approx size |
|---|---|---|
| Landing hero | `hero-shadow-fan.png` | 1600×900 |
| Landing feature row 1 | `home-shadow-fan.png` | 1200×900 |
| Landing feature row 2 | `home-receptors.png` | 1200×900 |
| Landing feature row 3 | `home-envelope.png` | 1200×900 |
| Features — Classifier | `feat-classifier.png` | 1200×900 |
| Features — Shadow Fan | `feat-shadow-fan.png` | 1200×900 |
| Features — PV | `feat-pv.png` | 1200×900 |
| Features — Batch/Mask | `feat-batch.png` | 1200×900 |
| Features — Envelope | `feat-envelope.png` | 1200×900 |
| Features — Results | `feat-results.png` | 1200×900 |
| Quickstart Architect 01–06 | `qs-arch-01.png` … `qs-arch-06.png` | 1600×900 |
| Quickstart Studio 01–06 | `qs-studio-01.png` … `qs-studio-06.png` | 1600×900 |

## Tips for screenshots

- Shoot against the plugin's dark UI so images blend with the site background.
- Include the plugin sidebar for context where possible — the Advanced mode reads as more capable.
- For result-panel shots, blur or anonymize any real project data.
