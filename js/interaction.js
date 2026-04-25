'use strict';

/**
 * Recompute dimming for all nodes and links based on the current
 * filter (state.activeFilter) and selection (state.selectedNodeId).
 * Called by selectNode, clearSelection, applyFilter, clearFilter.
 */
function updateDimming() {
  if (!graph.nodes || !graph.links) return;

  var filterKey = state.activeFilter ? state.activeFilter.toLowerCase() : null;
  var selId = state.selectedNodeId;

  // Build neighbour set for selected node
  var neighbors = null;
  if (selId && graph.data) {
    neighbors = new Set([selId]);
    graph.data.links.forEach(function (l) {
      var sid = l.source.id !== undefined ? l.source.id : l.source;
      var tid = l.target.id !== undefined ? l.target.id : l.target;
      if (sid === selId) neighbors.add(tid);
      if (tid === selId) neighbors.add(sid);
    });
  }

  graph.nodes.classed('dimmed', function (d) {
    if (filterKey && d.type !== 'center' && d.companyKey !== filterKey) return true;
    if (neighbors && !neighbors.has(d.id)) return true;
    return false;
  });

  graph.links.classed('dimmed', function (d) {
    var s = d.source;
    var t = d.target;
    // Filter: both endpoints must pass
    if (filterKey) {
      var sOk = s.type === 'center' || s.companyKey === filterKey;
      var tOk = t.type === 'center' || t.companyKey === filterKey;
      if (!sOk || !tOk) return true;
    }
    // Selection: link must touch the selected node
    if (selId) {
      if (s.id !== selId && t.id !== selId) return true;
    }
    return false;
  });
}

/**
 * Select a node: show profile card, dim non-neighbours, zoom to it.
 */
function selectNode(nodeId) {
  state.selectedNodeId = nodeId;
  if (!graph.data || !graph.nodes) return;

  var node = graph.data.nodes.find(function (n) { return n.id === nodeId; });
  if (!node) return;

  // Profile card
  var card = document.getElementById('profile-card');
  card.classList.remove('hidden');
  document.getElementById('card-name').textContent = node.name;
  document.getElementById('card-position').textContent = node.position || '';
  document.getElementById('card-company').innerHTML =
    '<span class="card-dot" style="background:' + node.color + '"></span>' + (node.company || '');
  document.getElementById('card-connected').textContent =
    node.connectedOn ? 'Connected ' + node.connectedOn : '';
  var cardUrl = document.getElementById('card-url');
  if (node.url) {
    cardUrl.href = node.url;
    cardUrl.classList.remove('hidden');
  } else {
    cardUrl.classList.add('hidden');
  }
  var avatar = document.getElementById('card-avatar');
  avatar.textContent = node.name.charAt(0);
  avatar.style.color = node.color;

  updateDimming();

  // Zoom to node
  var container = document.getElementById('graph-container');
  var w = container.clientWidth;
  var h = container.clientHeight;
  var transform = d3.zoomIdentity
    .translate(w / 2, h / 2)
    .scale(1.6)
    .translate(-node.x, -node.y);
  graph.svg.transition().duration(CONFIG.zoomDuration).call(graph.zoom.transform, transform);
}

/**
 * Clear selection: hide card, restore dimming to filter-only, reset zoom.
 */
function clearSelection() {
  state.selectedNodeId = null;
  document.getElementById('profile-card').classList.add('hidden');
  updateDimming();

  if (graph.svg && graph.autoFitTransform) {
    graph.svg.transition().duration(CONFIG.zoomDuration)
      .call(graph.zoom.transform, graph.autoFitTransform);
  }
}
