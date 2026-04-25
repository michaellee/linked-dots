'use strict';

var searchIndex = [];

/**
 * Build the search index from parsed rows.
 * Called after every graph load (sample data or real CSV).
 */
function initSearch(rows) {
  searchIndex = [];

  var companyCounts = {};
  rows.forEach(function (r, i) {
    searchIndex.push({
      type: 'person',
      label: r.firstName + ' ' + r.lastName,
      sublabel: r.company || '',
      nodeId: 'c' + i,
    });
    var key = (r.company || 'Other').toLowerCase();
    if (!companyCounts[key]) companyCounts[key] = { name: r.company || 'Other', count: 0 };
    companyCounts[key].count++;
  });

  Object.values(companyCounts).forEach(function (c) {
    searchIndex.push({
      type: 'company',
      label: c.name,
      sublabel: c.count + (c.count === 1 ? ' connection' : ' connections'),
      value: c.name,
    });
  });
}

function querySearch(q) {
  var lower = q.toLowerCase();
  var results = searchIndex.filter(function (entry) {
    return entry.label.toLowerCase().includes(lower) ||
           entry.sublabel.toLowerCase().includes(lower);
  });

  results.sort(function (a, b) {
    var aStarts = a.label.toLowerCase().startsWith(lower) ? 0 : 1;
    var bStarts = b.label.toLowerCase().startsWith(lower) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    if (a.type !== b.type) return a.type === 'company' ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return results.slice(0, 8);
}

function applySearchResult(result) {
  closeSearchDropdown();
  document.getElementById('search-input').value = result.label;
  document.getElementById('search-clear').classList.remove('hidden');

  if (result.type === 'person') {
    // Clear any active company filter first, then zoom to the node
    state.activeFilter = null;
    document.getElementById('company-filter').value = '';
    updateDimming();
    selectNode(result.nodeId);
  } else {
    // Clear any node selection first, then apply the company filter
    state.selectedNodeId = null;
    document.getElementById('profile-card').classList.add('hidden');
    document.getElementById('company-filter').value = result.value;
    applyFilter(result.value);
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').classList.add('hidden');
  closeSearchDropdown();
}

function closeSearchDropdown() {
  var list = document.getElementById('search-results');
  list.innerHTML = '';
  list.classList.add('hidden');
}

function renderSearchDropdown(results) {
  var list = document.getElementById('search-results');
  list.innerHTML = '';

  if (!results.length) {
    list.classList.add('hidden');
    return;
  }

  results.forEach(function (result) {
    var li = document.createElement('li');
    li.className = 'search-result-item';

    var badge = document.createElement('span');
    badge.className = 'search-badge search-badge-' + result.type;
    badge.textContent = result.type === 'person' ? 'Person' : 'Company';

    var text = document.createElement('span');
    text.className = 'search-result-text';
    text.innerHTML =
      '<span class="search-result-label">' + result.label + '</span>' +
      '<span class="search-result-sub">' + result.sublabel + '</span>';

    li.appendChild(badge);
    li.appendChild(text);

    // mousedown prevents input blur before click fires
    li.addEventListener('mousedown', function (e) { e.preventDefault(); });
    li.addEventListener('click', function () { applySearchResult(result); });

    list.appendChild(li);
  });

  list.classList.remove('hidden');
}

/**
 * Wire up the search input. Called once from app.js boot.
 */
function initSearchUI() {
  var input = document.getElementById('search-input');
  var clearBtn = document.getElementById('search-clear');

  input.addEventListener('input', function () {
    var q = this.value.trim();
    clearBtn.classList.toggle('hidden', !q);
    renderSearchDropdown(q ? querySearch(q) : []);
  });

  input.addEventListener('focus', function () {
    var q = this.value.trim();
    if (q) renderSearchDropdown(querySearch(q));
  });

  input.addEventListener('blur', function () {
    // Delay so result click fires before the dropdown closes
    setTimeout(closeSearchDropdown, 150);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { clearSearch(); input.blur(); }
  });

  clearBtn.addEventListener('click', function () {
    clearSearch();
    clearSelection();
    clearFilter();
  });
}
