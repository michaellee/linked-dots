# LinkedIn Network Graph — Build Plan

> Claude Code: Read this file and `SPEC.md` before starting work. Complete one phase at a time. After finishing each task, mark it ✅ and move to the next. Complete phases in order as later phases depend on earlier ones.

---

## Phase 1 — Project Setup

- [x] Create `index.html` with base HTML structure, meta tags, and viewport settings
- [x] Create `css/styles.css` with CSS reset and base layout (nav, insights bar, canvas area, card panel); reference it from `index.html` via `<link>`
- [x] Create stub JS files for each section (`js/config.js`, `js/sample-data.js`, `js/parser.js`, `js/data-model.js`, `js/graph.js`, `js/interaction.js`, `js/filter.js`, `js/insights.js`, `js/app.js`); reference them from `index.html` in order via `<script src="...">`
- [x] Download minified D3.js to `js/vendor/d3.min.js` and reference it from `index.html` before the app scripts
- [x] Download minified PapaParse to `js/vendor/papaparse.min.js` and reference it from `index.html` before the app scripts
- [ ] Verify the file opens correctly in a browser with no network requests after load

---

## Phase 2 — Sample Data

- [x] Create a `SAMPLE_DATA` constant: an array of ~40–60 realistic fake connections with varied names, companies, positions, and connected dates spanning several years
- [x] Ensure sample data covers at least 8–10 distinct companies so the graph has meaningful clusters and color variety
- [x] Include a few large clusters (5+ people at one company) and several singletons to showcase both edge types
- [x] Write a `isSampleData` flag in app state to distinguish demo mode from real data mode

---

## Phase 3 — CSV Upload & Parsing

- [x] Build the upload UI: a drag-and-drop zone overlaid on the graph canvas (visible in demo mode as a subtle prompt, not blocking the graph)
- [x] Add a hidden `<input type="file" accept=".csv">` triggered by clicking the upload zone or a nav button
- [x] Style the drag-over state in CSS (border highlight, background shift)
- [x] Wire up `dragover`, `dragleave`, `drop`, and `change` events in the Parser section
- [x] Use PapaParse to parse the file with `header: true` and `skipEmptyLines: true`
- [x] Validate required columns: `First Name`, `Last Name`, `Company`, `Position`, `Connected On`
- [x] On success, replace the demo graph with the real graph and clear the `isSampleData` flag
- [x] On failure, show the error state with missing column names and a "Try again" button

---

## Phase 4 — Graph Data Model

- [x] Write `buildGraphData(rows)` returning `{ nodes, links }`
- [x] Create the center "You" node: `{ id: 'you', name: 'You', type: 'center' }`
- [x] Create one node per row: `{ id, name, company, position, connectedOn }`
- [x] Add a `you → connection` link for every node
- [x] Group rows by company (case-insensitive); add one `connection ↔ connection` link per pair sharing a company (deduplicated)
- [x] Sort companies by connection count descending; assign colors from a curated palette to the top N
- [x] Assign a neutral fallback color to all others grouped as "Other"
- [x] Attach `color` and `companyGroup` to each node

---

## Phase 5 — D3 Force Graph Rendering

- [x] Create an SVG element sized to fill the graph container and append it to the DOM
- [x] Initialize a D3 force simulation with `forceLink` (id-based), `forceManyBody`, and `forceCenter`
- [x] Render `<line>` elements for links and `<circle>` elements for nodes inside SVG `<g>` groups
- [x] Style the "You" node with a larger radius and distinct fill/stroke
- [x] Apply `node.color` as fill for connection nodes
- [x] Add `<text>` labels showing first name beneath each node
- [x] Update `cx`/`cy` for circles and `x1/y1/x2/y2` for lines on each simulation tick
- [x] Implement D3 zoom and pan on the SVG canvas
- [x] After the simulation cools, auto-fit the graph to the viewport via a zoom transform

---

## Phase 6 — Animated Graph Entrance

- [x] Set all nodes and links to `opacity: 0` before the simulation starts
- [x] Pin all nodes to the center point (`x: width/2, y: height/2`) at simulation start
- [x] Over the first ~600ms, transition node and link opacity from 0 to 1 using CSS `transition` or D3 `transition()`
- [x] Allow the force simulation to naturally push nodes outward from the center during this fade-in window, creating the fan-out effect
- [x] Ensure the entrance animation plays both for the demo graph on load and for the real graph after upload
- [x] Keep the animation duration short enough to feel snappy, not slow

---

## Phase 7 — Hover States

- [x] Add `mouseenter` and `mouseleave` handlers to each node circle
- [x] On hover, apply a CSS class that adds a glow ring (e.g. `filter: drop-shadow(...)` or a larger semi-transparent circle behind the node)
- [x] On hover, make the node's label fully opaque (labels are slightly faded by default)
- [x] Set `cursor: pointer` on all nodes via CSS
- [x] Ensure hover state is visually distinct from the selected/highlighted state and does not conflict with it

---

## Phase 8 — Node Interaction (Click, Highlight & Zoom-to-Node)

- [x] Add a click handler to each node circle
- [x] On click, store the selected node ID in app state
- [x] Show the profile card panel and populate it: full name, position, company, connected date
- [x] Add a close button on the card that clears selection and resets the graph view
- [x] Apply a `dimmed` CSS class to all nodes and links not directly connected to the selected node
- [x] Remove `dimmed` from the selected node, its neighbors, and their shared edges
- [x] **Zoom-to-node:** compute a D3 zoom transform that centers the viewport on the clicked node at a comfortable zoom level, then apply it with `svg.transition().duration(500).call(zoom.transform, ...)`
- [x] Add a click handler on the SVG background (`<rect>` underlay) to clear selection, remove all `dimmed` classes, and animate the zoom back to the auto-fit view
- [x] Use CSS `transition: opacity` for smooth dim/highlight animation

---

## Phase 9 — Insights Panel

- [x] Add an insights bar element to the HTML between the nav and the graph canvas
- [x] Call `computeInsights` and update the bar whenever a new graph is loaded (demo or real)
- [x] Show appropriate sample values in the bar while demo data is active
- [x] Hide or reset the insights bar during the loading and error states

---

## Phase 10 — Company Filter

- [x] Add a `<select>` dropdown and "Clear" `<button>` to the nav bar
- [x] Populate the `<select>` with all unique companies sorted alphabetically, with connection count in the label
- [x] On company select, apply `dimmed` to all non-matching nodes and their links
- [x] Wire the "Clear" button to reset the filter and remove all `dimmed` classes
- [x] Ensure filter and node-click states layer correctly without conflict

---

## Phase 11 — Demo Banner & Upload Prompt

- [x] Add a dismissible banner below the insights bar that reads *"Sample data — upload your own to get started"* when `isSampleData` is true
- [x] Include an "Upload CSV" button in the banner as the primary CTA
- [x] Hide the banner once real data is loaded
- [x] Add an "Upload CSV" button in the nav (visible in graph view) to reset to demo mode

---

## Phase 12 — Error & Loading States

- [x] Implement the **Loading state**: overlay a spinner on the graph canvas while PapaParse runs
- [x] Implement the **Error state**: display missing column names, show step-by-step LinkedIn export instructions, and a "Try again" button
- [x] Ensure the demo graph remains visible behind the loading overlay for a smooth transition

---

## Phase 13 — Polish & Privacy Audit

- [x] Verify the file works by double-clicking it locally in Chrome, Firefox, and Safari
- [x] Confirm zero network requests at runtime using browser DevTools Network tab
- [x] Confirm no use of `localStorage`, `sessionStorage`, or `document.cookie`
- [x] Add a footer: *"All data stays in your browser. Nothing is uploaded or stored."*
- [x] Test with a real LinkedIn `Connections.csv` export
- [x] Handle edge cases: missing `Company` (assign to "Other"), very long names (truncate labels), large datasets (500+ nodes — cap inferred company edges)
- [x] Ensure layout is usable on common screen sizes
- [x] Final visual pass: consistent spacing, readable typography, polished color palette