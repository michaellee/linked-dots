'use strict';

// ── State ────────────────────────────────────────────────
var state = {
  isSampleData: true,
  selectedNodeId: null,
  activeFilter: null,
  graphData: null,
  zoomIdentity: null,
};

// ── View transitions ─────────────────────────────────────
function showState(name) {
  document.getElementById('loading-overlay').classList.add('hidden');
  document.getElementById('error-overlay').classList.add('hidden');
  document.getElementById('demo-banner').classList.add('hidden');
  document.getElementById('insights-bar').classList.add('hidden');
  document.getElementById('profile-card').classList.add('hidden');

  switch (name) {
    case 'demo':
      document.getElementById('demo-banner').classList.remove('hidden');
      document.getElementById('insights-bar').classList.remove('hidden');
      break;
    case 'loading':
      document.getElementById('loading-overlay').classList.remove('hidden');
      break;
    case 'error':
      document.getElementById('error-overlay').classList.remove('hidden');
      break;
    case 'graph':
      document.getElementById('insights-bar').classList.remove('hidden');
      break;
  }
}

// ── File handling ────────────────────────────────────────
function triggerUpload() {
  var fi = document.getElementById('file-input');
  fi.value = '';
  fi.click();
}

function handleFile(file) {
  showState('loading');
  parseCSV(file,
    function (rows) {
      state.isSampleData = false;
      state.selectedNodeId = null;
      state.activeFilter = null;
      state.graphData = buildGraphData(rows);
      renderGraph(state.graphData);
      renderInsights(computeInsights(rows));
      populateFilterDropdown(rows);
      showState('graph');
    },
    function (errMsg) {
      document.getElementById('error-message').textContent = errMsg;
      showState('error');
    }
  );
}

// ── Event wiring ─────────────────────────────────────────
document.getElementById('upload-btn').addEventListener('click', triggerUpload);
document.getElementById('demo-upload-btn').addEventListener('click', triggerUpload);
document.getElementById('retry-btn').addEventListener('click', triggerUpload);

document.getElementById('file-input').addEventListener('change', function (e) {
  var file = e.target.files[0];
  if (file) handleFile(file);
});

// Drag and drop
var gc = document.getElementById('graph-container');
gc.addEventListener('dragover', function (e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('hidden');
});
gc.addEventListener('dragleave', function (e) {
  if (!gc.contains(e.relatedTarget)) {
    document.getElementById('drop-zone').classList.add('hidden');
  }
});
gc.addEventListener('drop', function (e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('hidden');
  var file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Filter controls
document.getElementById('company-filter').addEventListener('change', function () {
  applyFilter(this.value);
});
document.getElementById('clear-filter-btn').addEventListener('click', function () {
  clearFilter();
});

// Profile card close
document.getElementById('card-close').addEventListener('click', clearSelection);

// How-to modal
var howtoModal = document.getElementById('howto-modal');
document.getElementById('how-to-btn').addEventListener('click', function () {
  howtoModal.classList.remove('hidden');
});
document.getElementById('howto-close').addEventListener('click', function () {
  howtoModal.classList.add('hidden');
});
howtoModal.addEventListener('click', function (e) {
  if (e.target === howtoModal) howtoModal.classList.add('hidden');
});
document.getElementById('howto-upload-btn').addEventListener('click', function () {
  howtoModal.classList.add('hidden');
  triggerUpload();
});

// ── Boot ─────────────────────────────────────────────────
(function boot() {
  state.graphData = buildGraphData(SAMPLE_DATA);
  renderGraph(state.graphData);
  renderInsights(computeInsights(SAMPLE_DATA));
  populateFilterDropdown(SAMPLE_DATA);
  showState('demo');
})();
