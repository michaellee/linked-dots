'use strict';

/**
 * Build graph nodes and links from parsed connection rows.
 * Returns { nodes, links, companyColors }.
 */
function buildGraphData(rows) {
  var nodes = [];
  var links = [];

  // Center node
  nodes.push({
    id: 'you',
    name: 'You',
    type: 'center',
    color: CONFIG.youColor,
    radius: CONFIG.youRadius,
  });

  // Count companies (case-insensitive)
  var companyCounts = {};
  rows.forEach(function (r) {
    var key = r.company.toLowerCase();
    if (!companyCounts[key]) companyCounts[key] = { name: r.company, count: 0 };
    companyCounts[key].count++;
  });

  // Sort by count descending, assign palette colors to top N
  var sorted = Object.values(companyCounts).sort(function (a, b) { return b.count - a.count; });
  var companyColors = {};
  sorted.forEach(function (entry, i) {
    companyColors[entry.name.toLowerCase()] =
      i < CONFIG.topNCompanies ? CONFIG.palette[i % CONFIG.palette.length] : CONFIG.otherColor;
  });

  // Connection nodes
  rows.forEach(function (r, i) {
    var companyKey = r.company.toLowerCase();
    nodes.push({
      id: 'c' + i,
      name: r.firstName + ' ' + r.lastName,
      firstName: r.firstName,
      company: r.company,
      companyKey: companyKey,
      position: r.position,
      connectedOn: r.connectedOn,
      color: companyColors[companyKey],
      radius: CONFIG.nodeRadius,
      type: 'connection',
    });
    // You → connection link
    links.push({ source: 'you', target: 'c' + i, type: 'direct' });
  });

  // Connection ↔ connection links for shared company
  var byCompany = {};
  nodes.forEach(function (n) {
    if (n.type !== 'connection') return;
    if (!byCompany[n.companyKey]) byCompany[n.companyKey] = [];
    byCompany[n.companyKey].push(n.id);
  });
  Object.values(byCompany).forEach(function (ids) {
    var cap = Math.min(ids.length, 20); // cap to avoid N^2 explosion
    for (var i = 0; i < cap; i++) {
      for (var j = i + 1; j < cap; j++) {
        links.push({ source: ids[i], target: ids[j], type: 'company' });
      }
    }
  });

  return { nodes: nodes, links: links, companyColors: companyColors };
}
