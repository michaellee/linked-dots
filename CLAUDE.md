# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**linked-dots** is a fully client-side LinkedIn network graph visualizer. The app is a set of static files — no build step, no server, no npm. Users open `index.html` directly in their browser or via a local server.

## Development

No build tooling. The workflow is:
- Edit source files directly
- Open `index.html` in a browser (`file://` protocol works, or `python3 -m http.server`)
- Verify in Chrome, Firefox, and Safari

To confirm correctness: open browser DevTools → Network tab → reload → confirm zero external requests after initial load.

## File Structure

```
/
├── index.html              # HTML shell: structure and script/style references
├── css/
│   └── styles.css          # All styles
└── js/
    ├── config.js           # Constants: color palette, top-N company limit, simulation params
    ├── sample-data.js      # SAMPLE_DATA constant (~40–60 fake connections for demo graph)
    ├── parser.js           # PapaParse CSV parsing, column validation, drag-and-drop wiring
    ├── data-model.js       # buildGraphData(rows) → { nodes, links } with color assignment
    ├── graph.js            # D3 force simulation, SVG rendering, zoom/pan
    ├── interaction.js      # Click handler, zoom-to-node, highlight/dim logic, profile card
    ├── filter.js           # Company filter dropdown logic
    ├── insights.js         # computeInsights(rows) → stats bar values
    ├── app.js              # State object, DOM refs, view transitions, boot sequence
    └── vendor/
        ├── d3.min.js       # D3.js v7 (downloaded, not CDN)
        └── papaparse.min.js # PapaParse v5 (downloaded, not CDN)
```

`index.html` loads scripts in this order: `vendor/d3.min.js` → `vendor/papaparse.min.js` → `config.js` → `sample-data.js` → `parser.js` → `data-model.js` → `graph.js` → `interaction.js` → `filter.js` → `insights.js` → `app.js`.

## Key Constraints

- **Zero network requests at runtime** — all JS is served from `js/vendor/`, never from a CDN
- **No persistence** — no `localStorage`, `sessionStorage`, or cookies
- **Privacy** — data never leaves the browser; a footer must state this
- The "You" center node connects to every connection node; company co-membership creates inferred connection↔connection edges (capped for large datasets)
- Company coloring: top N by count get unique palette colors; remainder grouped as "Other"

## App States

`Demo` → `Loading` → `Graph` (default / node-selected / filtered) or `Error`

The demo graph is always shown on first load using `SAMPLE_DATA` from `sample-data.js`; uploading a CSV transitions to the real graph. The `isSampleData` flag in `app.js` state object distinguishes these modes.

## Spec & Plan

- Full feature specification: `SPEC.md`
- Phased build plan (13 phases): `PLAN.md` — check off tasks as phases are completed
