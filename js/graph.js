'use strict';

// Shared graph state accessible to interaction.js and filter.js
var graph = {
  svg: null,
  simulation: null,
  zoom: null,
  nodes: null,       // D3 selection of g.node groups
  links: null,       // D3 selection of line.link elements
  autoFitTransform: null,
  data: null,
};

function renderGraph(graphData) {
  destroyGraph();
  graph.data = graphData;

  var container = document.getElementById('graph-container');
  var width = container.clientWidth;
  var height = container.clientHeight;

  // SVG
  var svg = d3.select(container)
    .append('svg')
    .attr('id', 'graph-svg')
    .attr('width', width)
    .attr('height', height);
  graph.svg = svg;

  // SVG defs: glow filter
  var defs = svg.append('defs');
  var filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
  var merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'blur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Background rect for click-to-deselect
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('click', function () { clearSelection(); });

  // Zoom behaviour
  var zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', function (event) { g.attr('transform', event.transform); });
  svg.call(zoomBehavior);
  graph.zoom = zoomBehavior;

  // Main transformed group
  var g = svg.append('g').attr('class', 'graph-g');

  // Links
  var linkSel = g.append('g').attr('class', 'links-g')
    .selectAll('line')
    .data(graphData.links)
    .join('line')
    .attr('class', function (d) { return 'link' + (d.type === 'company' ? ' company-link' : ''); })
    .attr('stroke-width', function (d) { return d.type === 'company' ? 0.8 : 1; });
  graph.links = linkSel;

  // Node groups
  var nodeSel = g.append('g').attr('class', 'nodes-g')
    .selectAll('g')
    .data(graphData.nodes)
    .join('g')
    .attr('class', 'node');

  // Circles
  nodeSel.append('circle')
    .attr('class', 'node-circle')
    .attr('r', function (d) { return d.radius; })
    .attr('fill', function (d) { return d.color; })
    .attr('stroke', function (d) { return d.type === 'center' ? '#fff' : 'none'; })
    .attr('stroke-width', function (d) { return d.type === 'center' ? 2.5 : 0; });

  // Labels
  nodeSel.append('text')
    .attr('class', 'node-label')
    .attr('dy', function (d) { return d.radius + 12; })
    .text(function (d) { return d.type === 'center' ? 'You' : d.firstName; })
    .style('opacity', 0.55);

  graph.nodes = nodeSel;

  // ── Hover ──────────────────────────────────────────
  nodeSel
    .on('mouseenter', function (event, d) {
      d3.select(this).select('.node-circle').attr('filter', 'url(#glow)');
      d3.select(this).select('.node-label').style('opacity', 1).style('font-weight', '600');
    })
    .on('mouseleave', function (event, d) {
      d3.select(this).select('.node-circle').attr('filter', null);
      d3.select(this).select('.node-label').style('opacity', 0.55).style('font-weight', null);
    });

  // ── Click ──────────────────────────────────────────
  nodeSel.on('click', function (event, d) {
    event.stopPropagation();
    selectNode(d.id);
  });

  // ── Drag ───────────────────────────────────────────
  nodeSel.call(d3.drag()
    .on('start', function (event, d) {
      if (!event.active) graph.simulation.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on('drag', function (event, d) {
      d.fx = event.x; d.fy = event.y;
    })
    .on('end', function (event, d) {
      if (!event.active) graph.simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }));

  // ── Entrance animation: pin to center, fade in ────
  graphData.nodes.forEach(function (n) {
    n.x = width / 2 + (Math.random() - 0.5) * 2;
    n.y = height / 2 + (Math.random() - 0.5) * 2;
  });
  linkSel.style('opacity', 0);
  nodeSel.style('opacity', 0);
  linkSel.transition().duration(CONFIG.animDuration).style('opacity', null);
  nodeSel.transition().duration(CONFIG.animDuration).style('opacity', null);

  // ── Force simulation ──────────────────────────────
  var simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links)
      .id(function (d) { return d.id; })
      .distance(function (l) {
        // Only vary distance on direct you→connection links
        if (l.type !== 'direct') return 40;
        var deg = (typeof l.target === 'object' ? l.target.degree : 0) || 0;
        return deg > CONFIG.highDegreeThreshold ? CONFIG.linkDistanceClose : CONFIG.linkDistanceFar;
      }))
    .force('charge', d3.forceManyBody().strength(CONFIG.chargeStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('radial', d3.forceRadial(function (d) {
        if (d.type === 'center') return 0;
        return d.degree > CONFIG.highDegreeThreshold ? 100 : 260;
      }, width / 2, height / 2).strength(0.2))
    .force('collision', d3.forceCollide().radius(function (d) { return d.radius + 4; }))
    .on('tick', function () {
      linkSel
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
      nodeSel.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });
  graph.simulation = simulation;

  // Auto-fit once simulation settles
  simulation.on('end', function () {
    autoFit(svg, g, graphData.nodes, zoomBehavior, width, height);
  });
  // Fallback timeout in case simulation is slow to converge
  setTimeout(function () {
    autoFit(svg, g, graphData.nodes, zoomBehavior, width, height);
  }, 3000);
}

function autoFit(svg, g, nodes, zoomBehavior, width, height) {
  if (graph.autoFitTransform) return; // only once per render

  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(function (n) {
    var r = n.radius || 8;
    if (n.x - r < minX) minX = n.x - r;
    if (n.y - r < minY) minY = n.y - r;
    if (n.x + r > maxX) maxX = n.x + r;
    if (n.y + r > maxY) maxY = n.y + r;
  });

  var gw = maxX - minX;
  var gh = maxY - minY;
  var pad = 60;
  var scale = Math.min((width - pad * 2) / gw, (height - pad * 2) / gh, 1.5);
  var cx = (minX + maxX) / 2;
  var cy = (minY + maxY) / 2;

  var transform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(scale)
    .translate(-cx, -cy);

  graph.autoFitTransform = transform;
  state.zoomIdentity = transform;
  svg.transition().duration(CONFIG.zoomDuration).call(zoomBehavior.transform, transform);
}

/**
 * Animate the viewport to fit a given subset of nodes.
 * Pass an array of node data objects (must have x, y, radius).
 */
function zoomToFitNodes(nodes) {
  if (!graph.svg || !graph.zoom || !nodes || !nodes.length) return;

  var container = document.getElementById('graph-container');
  var width = container.clientWidth;
  var height = container.clientHeight;
  var pad = 80;

  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(function (n) {
    var r = n.radius || 8;
    if (n.x - r < minX) minX = n.x - r;
    if (n.y - r < minY) minY = n.y - r;
    if (n.x + r > maxX) maxX = n.x + r;
    if (n.y + r > maxY) maxY = n.y + r;
  });

  var gw = maxX - minX;
  var gh = maxY - minY;
  var scale = Math.min((width - pad * 2) / gw, (height - pad * 2) / gh, 2.5);
  var cx = (minX + maxX) / 2;
  var cy = (minY + maxY) / 2;

  var transform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(scale)
    .translate(-cx, -cy);

  graph.svg.transition().duration(CONFIG.zoomDuration).call(graph.zoom.transform, transform);
}

function destroyGraph() {
  if (graph.simulation) { graph.simulation.stop(); graph.simulation = null; }
  if (graph.svg) { graph.svg.remove(); graph.svg = null; }
  graph.nodes = null;
  graph.links = null;
  graph.autoFitTransform = null;
  graph.data = null;
}
