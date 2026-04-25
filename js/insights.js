'use strict';

/**
 * Derive stats from parsed rows.
 */
function computeInsights(rows) {
  var companies = {};
  var oldest = null;
  var oldestDate = null;

  rows.forEach(function (r) {
    var key = r.company.toLowerCase();
    if (!companies[key]) companies[key] = { name: r.company, count: 0 };
    companies[key].count++;

    var d = new Date(r.connectedOn);
    if (!isNaN(d.getTime()) && (!oldestDate || d < oldestDate)) {
      oldestDate = d;
      oldest = r;
    }
  });

  var sorted = Object.values(companies).sort(function (a, b) { return b.count - a.count; });
  var top = sorted[0];

  return {
    total: rows.length,
    uniqueCompanies: sorted.length,
    topCompany: top ? top.name : '',
    topCompanyCount: top ? top.count : 0,
    oldestName: oldest ? (oldest.firstName + ' ' + oldest.lastName) : '',
    oldestYear: oldestDate ? oldestDate.getFullYear() : '',
  };
}

/**
 * Render the insights bar text.
 */
function renderInsights(insights) {
  if (!insights) return;
  var el = document.getElementById('insights-text');
  el.innerHTML =
    '<strong>' + insights.total + '</strong> connections &middot; ' +
    '<strong>' + insights.uniqueCompanies + '</strong> companies &middot; ' +
    'Most connected: <strong>' + insights.topCompany + ' (' + insights.topCompanyCount + ')</strong> &middot; ' +
    'Oldest: <strong>' + insights.oldestName + '</strong>, ' + insights.oldestYear;
}
