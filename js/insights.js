'use strict';

/**
 * Derive stats from parsed rows.
 */
function computeInsights(rows) {
  var companies = {};

  rows.forEach(function (r) {
    var key = r.company.toLowerCase();
    if (!companies[key]) companies[key] = { name: r.company, count: 0 };
    companies[key].count++;
  });

  var sorted = Object.values(companies).sort(function (a, b) { return b.count - a.count; });
  var top = sorted[0];

  return {
    total: rows.length,
    uniqueCompanies: sorted.length,
    topCompany: top ? top.name : '',
    topCompanyCount: top ? top.count : 0,
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
    'Most connected company: <strong>' + insights.topCompany + ' (' + insights.topCompanyCount + ')</strong>';
}
