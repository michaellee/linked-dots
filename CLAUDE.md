# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**linked-dots** is a fully client-side LinkedIn network graph visualizer. The entire app is delivered as a single `index.html` file — no build step, no server, no dependencies to install. Users open the file directly in their browser.

## Development

No build tooling exists. The workflow is:
- Edit `index.html` directly
- Open it in a browser (`file://` protocol) to test
- Verify in Chrome, Firefox, and Safari

To confirm correctness: open browser DevTools → Network tab → reload → confirm zero external requests after initial load.

## Architecture

Everything lives in one `index.html`. Internal JS is organized into clearly labeled sections within a single `<script>` block:

| Section | Responsibility |
|---|---|
| `Config` | Constants: color palette, top-N company limit, simulation params |
| `Sample Data` | ~40–60 fake connections for the demo graph |
| `Parser` | PapaParse-based CSV parsing, column validation, drag-and-drop wiring |
| `Data Model` | `buildGraphData(rows)` → `{ nodes, links }` with color assignment |
| `Graph` | D3 force simulation, SVG rendering, zoom/pan |
| `Interaction` | Click handler, zoom-to-node, highlight/dim logic, profile card |
| `Filter` | Company filter dropdown logic |
| `Insights` | `computeInsights(nodes)` → stats bar values |
| `App` | State management (`isSampleData` flag), view transitions between Demo/Loading/Error/Graph states |

Libraries (D3.js and PapaParse) are **inlined as `<script>` blocks** — copied minified source, not CDN links. This is intentional for offline use.

## Key Constraints

- **Zero network requests at runtime** — all JS must be inlined, never load from CDN
- **No persistence** — no `localStorage`, `sessionStorage`, or cookies
- **Privacy** — data never leaves the browser; a footer must state this
- The "You" center node connects to every connection node; company co-membership creates inferred connection↔connection edges (capped for large datasets)
- Company coloring: top N by count get unique palette colors; remainder grouped as "Other"

## App States

`Demo` → `Loading` → `Graph` (default / node-selected / filtered) or `Error`

The demo graph is always shown on first load using `SAMPLE_DATA`; uploading a CSV transitions to the real graph. The `isSampleData` flag in app state distinguishes these modes.

## Spec & Plan

- Full feature specification: `SPEC.md`
- Phased build plan (13 phases): `PLAN.md` — check off tasks as phases are completed
