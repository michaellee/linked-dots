'use strict';

// Required columns in a LinkedIn Connections.csv export.
const REQUIRED_COLUMNS = ['First Name', 'Last Name', 'Company', 'Position', 'Connected On'];

/**
 * Parse a LinkedIn CSV file. Calls onSuccess(rows) or onError(message).
 * Each row: { firstName, lastName, company, position, connectedOn }.
 */
function parseCSV(file, onSuccess, onError) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      const cols = results.meta.fields || [];
      const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
      if (missing.length) {
        onError('Missing required columns: ' + missing.map(c => '"' + c + '"').join(', '));
        return;
      }
      const rows = results.data.map(r => ({
        firstName:   (r['First Name']   || '').trim(),
        lastName:    (r['Last Name']    || '').trim(),
        company:     (r['Company']      || '').trim() || 'Other',
        position:    (r['Position']     || '').trim(),
        connectedOn: (r['Connected On'] || '').trim(),
      }));
      onSuccess(rows);
    },
    error(err) { onError(err.message); },
  });
}
