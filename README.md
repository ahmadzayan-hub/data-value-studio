# Data Value Studio

## Product Authority

<p align="center"><img src="docs/assets/hero.jpg" alt="Concept image (AI-generated). Not a product screenshot." width="100%"><br><sub><em>Concept image (AI-generated). Not a product screenshot.</em></sub></p>

| | |
|---|---|
| **Primary User** | Data owner / governance lead |
| **Job To Be Done** | Turn governed data into usable, measurable data products |
| **System of Record** | Governed data products, their approvals, pricing/access policies, usage & value |
| **System of Intelligence** | Quality scoring, use-case discovery, anonymisation/synthetic derivation suggestions |
| **Explicit Non-Goals** | Selling raw operational data · becoming a Data Lake · being a dashboard |

> Data → Governed Data Product → measurable value.

Aligned with Dubai's current direction: data as a strategic asset for
value generation and AI (Dubai Data Guide, July 2026; Digital Dubai's
explicit Data Value Creation goal).

## The Product Factory

Every asset travels one line — nothing ships outside it:

```
Raw Dataset
  → Classification
  → Privacy / Security
  → Quality Score
  → Use-case discovery
  → Buyer / Internal consumer
  → Transformation
  → Aggregation / anonymisation / synthetic
  → Data Product
  → Legal / Governance approval
  → Pricing / Access policy
  → Publish
  → Usage / Revenue / Value
```

## Roadmap

- **P0 · Inventory + governance** — data inventory, classification,
  privacy, lineage, access tiers.
- **P1 · Productisation** — anonymisation, synthetic derivatives,
  licensing, buyer/use-case discovery, business case per asset.
- **Start rule** — one user, one workflow, one KPI before any expansion:
  a single asset crossing the full line to a real consumer with measured
  value.

## KPI

`value / revenue per data asset`

## Quick Start

```bash
npm install
npm run dev   # http://localhost:5173
npm run build # dist/
```

Deploys on Vercel: connect the repo, set framework to Vite, output directory `dist`.

### GitHub Pages demo

Set **Settings → Pages → Source** to **GitHub Actions**, then run **CI** on
`main`. The publish job runs after verification and uses hash routes so a
static host can open and reload an asset link directly.

## Privacy browser tests

```bash
npx playwright install --only-shell chromium
npm run test:e2e
```

The tests use the three synthetic examples in Inventory and exercise the asset detail route in Arabic and English. Set `PRIVACY_SCREENSHOTS=1` when running the suite to capture full-page PNGs in `test-results/`.
If Chromium is already installed, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path.

## Screens

| Screen | Route | Description |
|---|---|---|
| Dashboard | `/` | Summary tiles, recent activity, navigate to inventory |
| Inventory | `/inventory` | Searchable, filterable list of 8 demo data assets |
| Asset Detail | `/asset/:id` | Quality ring, pipeline tracker, privacy guidance and a demo approval request |
| 404 | `*` | Not found page |

Bilingual Arabic (RTL, default) / English toggle. The demo saves one pending
request per asset in the current browser, including the request time, privacy
verdict, reasons and rule version. Demo requests use synthetic records and have
no shared reviewer or backend.
