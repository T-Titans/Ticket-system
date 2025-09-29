// directory: backend/utils
// filename: exportUtils.js
// filepath: c:\Users\MANDLENKOSI VUNDLA\Documents\ticket-system\backend\utils\exportUtils.js
export const exportToCsv = async (data, headers) => {
  const headerRow = headers.map(h => h.title).join(',');
  const rows = data.map(item =>
    headers.map(h => `"${String(item[h.id] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [headerRow, ...rows].join('\n');
};