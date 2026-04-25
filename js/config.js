'use strict';

const CONFIG = {
  topNCompanies: 10,
  youRadius: 22,
  nodeRadius: 8,
  youColor: '#3b82f6',
  otherColor: '#64748b',
  linkDistanceClose: 80,    // you→connection link distance for high-degree nodes
  linkDistanceFar: 200,     // you→connection link distance for low-degree nodes
  highDegreeThreshold: 3,   // connections with more than this many links are "close"
  chargeStrength: -220,
  animDuration: 600,
  zoomDuration: 500,
  palette: [
    '#60a5fa', // blue
    '#f97316', // orange
    '#34d399', // green
    '#f472b6', // pink
    '#a78bfa', // violet
    '#facc15', // yellow
    '#22d3ee', // cyan
    '#fb7185', // rose
    '#86efac', // light green
    '#fbbf24', // amber
  ],
};
