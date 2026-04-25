'use strict';

// Required columns in a LinkedIn Connections.csv export.
const REQUIRED_COLUMNS = ['First Name', 'Last Name', 'Company', 'Position', 'Connected On'];

/**
 * Parse a LinkedIn CSV file. Calls onSuccess(rows) or onError(message).
 * Each row: { firstName, lastName, company, position, connectedOn }.
 *
 * LinkedIn exports often include several preamble lines (notes, blank lines)
 * before the real header row. We skip everything until the first line that
 * has three or more comma-separated fields.
 */
function parseCSV(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onerror = () => onError('Could not read the file.');
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n');

    // Find the first line that looks like a CSV row (≥ 3 comma-separated fields)
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].split(',').length >= 3) {
        startIdx = i;
        break;
      }
    }

    if (startIdx === -1) {
      onError('No CSV data found in the file.');
      return;
    }

    const csvText = lines.slice(startIdx).join('\n');

    Papa.parse(csvText, {
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
  };
  reader.readAsText(file);
}
