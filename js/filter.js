'use strict';

/**
 * Populate the company filter dropdown from parsed rows.
 */
function populateFilterDropdown(rows) {
  var counts = {};
  rows.forEach(function (r) {
    var key = r.company.toLowerCase();
    if (!counts[key]) counts[key] = { name: r.company, count: 0 };
    counts[key].count++;
  });

  var sorted = Object.values(counts).sort(function (a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  var sel = document.getElementById('company-filter');
  sel.innerHTML = '<option value="">Filter by company\u2026</option>';
  sorted.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name + ' (' + c.count + ')';
    sel.appendChild(opt);
  });
}

/**
 * Highlight nodes matching the given company; dim everything else.
 */
function applyFilter(company) {
  if (!company) { clearFilter(); return; }
  state.activeFilter = company;
  updateDimming();
}

/**
 * Remove company filter dimming.
 */
function clearFilter() {
  state.activeFilter = null;
  document.getElementById('company-filter').value = '';
  updateDimming();
}
