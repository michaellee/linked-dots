# LinkedIn Network Graph — Specification

## Overview

A fully client-side web app that accepts a LinkedIn connections CSV export and renders an interactive force-directed network graph. Delivered as a **single self-contained `index.html` file** — no build step, no server, no install. Users open the file directly in their browser.

No data is sent to any server at any point.

---

## Input Data

**Source:** LinkedIn's official data export → `Connections.csv`

**Fields used:**
| Field | Description |
|---|---|
| `First Name` | Contact's first name |
| `Last Name` | Contact's last name |
| `Email Address` | Contact's email (may be empty) |
| `Company` | Current company |
| `Position` | Current job title |
| `Connected On` | Date the connection was made |

---

## Graph Model

### Nodes
- One **center node** representing the user ("You")
- One node per connection in the CSV

### Edges
- **User → Connection** — an edge from the center node to every connection (always present)
- **Connection ↔ Connection** — an inferred edge between two connections who share the same `Company` value (case-insensitive match)

### Node Coloring
- Each unique company is assigned a distinct color
- Top N companies (by connection count) get unique colors
- All remaining companies are grouped under a neutral "Other" color
- The center "You" node is visually distinct (larger, different color)

---

## Tech Stack

| Concern | Tool |
|---|---|
| Language | Vanilla JavaScript (no framework, no bundler) |
| Graph rendering | D3.js (local file, no CDN) |
| CSV parsing | PapaParse (local file, no CDN) |
| Styling | Plain CSS (external `css/styles.css`) |
| Delivery | Static files — open `index.html` directly in browser or via local server |

### Library Strategy
D3 and PapaParse are downloaded once and stored in `js/vendor/` so the app works fully **offline**. They are referenced via `<script src="js/vendor/...">` — no CDN calls at runtime.

---

## File Structure

```
/
├── index.html              # HTML shell: structure and script/style references
├── css/
│   └── styles.css          # All styles
└── js/
    ├── config.js           # Constants: palette, radii, simulation params
    ├── sample-data.js      # SAMPLE_DATA constant (~40–60 fake connections)
    ├── parser.js           # CSV parsing, column validation, drag-and-drop
    ├── data-model.js       # buildGraphData() → { nodes, links }
    ├── graph.js            # D3 simulation, SVG rendering, zoom/pan
    ├── interaction.js      # Click, highlight/dim, zoom-to-node, profile card
    ├── filter.js           # Company filter dropdown logic
    ├── insights.js         # computeInsights(), stats bar rendering
    ├── app.js              # State object, DOM refs, view transitions, boot
    └── vendor/
        ├── d3.min.js
        └── papaparse.min.js
```

---

## Features

### 1. CSV Upload
- Drag-and-drop or click-to-upload file input
- Accepts only `.csv` files
- Validates that expected LinkedIn columns are present
- Shows an error state if the file is invalid or columns are missing

### 2. Demo Graph on Empty State
- On first load, the app displays a **fully interactive sample graph** using realistic fake data (anonymized names, plausible companies)
- A clearly visible banner labels it as *"Sample data — upload your own to get started"*
- The sample graph supports all interactions: drag, zoom, click, hover, filter
- This lets users explore the experience before uploading anything
- Uploading a real CSV replaces the demo graph seamlessly

### 3. Graph Rendering
- Force-directed layout using D3
- Nodes are draggable and repositionable
- Canvas is zoomable (scroll) and pannable (drag on background)
- Graph auto-fits to the viewport on initial load

### 4. Animated Graph Entrance
- When a graph first renders (demo or real), nodes **originate from the center** and fan outward driven by the force simulation
- Node and link opacity fades in from 0 during the first ~600ms
- The effect makes the network feel like it is being discovered rather than loaded

### 5. Hover States
- Hovering over a node produces a **subtle glow or ring effect** around it
- The node's label becomes fully visible on hover (normally slightly faded at low zoom)
- The cursor changes to a pointer to signal interactivity
- Hover state is distinct from the selected/highlighted state

### 6. Node Interaction — Click
- Clicking a node triggers two simultaneous effects:
  1. **Profile card** — a panel appears showing:
	 - Full name
	 - Job title (Position)
	 - Company
	 - Connected On date
  2. **Highlight mode** — the clicked node and all its direct edges are emphasized; all other nodes and edges are dimmed
- The canvas **smoothly animates (pan + zoom) to center on the clicked node**
- Clicking the background resets the highlight, closes the profile card, and restores the previous zoom level

### 7. Insights Panel
- After a graph is loaded (demo or real), a compact stats bar is shown above or below the nav:
  - Total connections and unique companies: *"312 connections across 89 companies"*
  - Most connected company: *"Most connected: Google (14 people)"*
  - Oldest connection: *"Oldest connection: Jane Smith, since 2011"*
- Stats are derived entirely client-side from the parsed data
- Shown for demo data with sample values; updates immediately when real data is uploaded

### 8. Company Filter
- A searchable dropdown lists all unique companies in the dataset
- Selecting a company highlights all nodes from that company and dims others
- A "Clear" button resets the filter
- Filter and node-click highlight states can coexist (filter narrows, click highlights within)

---

## UI Layout

```
┌──────────────────────────────────────────────────────┐
│  🔗 LinkedIn Graph   [Company filter ▼]   [Clear]    │
├──────────────────────────────────────────────────────┤
│  312 connections · 89 companies · Most connected:    │
│  Google (14) · Oldest: Jane Smith, 2011              │
├──────────────────────────────────────────────────────┤
│  ⚠️ Sample data — upload your own to get started     │
├──────────────────────────────────────────────────────┤
│                                                      │
│                  D3 Graph Canvas                     │
│                                         ┌──────────┐ │
│                                         │ Name     │ │
│                                         │ Title    │ │
│                                         │ Company  │ │
│                                         │ Connected│ │
│                                         └──────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## App States

| State | Description |
|---|---|
| **Demo** | Sample graph loaded on first visit, fully interactive, upload prompt visible |
| **Loading** | Real CSV is being parsed and graph is being built |
| **Error** | Invalid file or missing columns — actionable error message with retry |
| **Graph (default)** | User's real graph, full interactive network visible |
| **Graph (node selected)** | Canvas zoomed to node, profile card shown, highlight mode active |
| **Graph (filtered)** | Company filter applied, non-matching nodes dimmed |

---

## Constraints & Privacy

- Zero network requests at runtime — all JS is inlined, no CDN calls
- No localStorage, sessionStorage, or cookies used
- All data lives in JS variables scoped to the script only
- Data is cleared when the page is refreshed or a new file is uploaded
- A privacy notice is shown in the UI: "All data stays in your browser"