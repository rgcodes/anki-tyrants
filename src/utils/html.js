export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderImage(filename) {
  return `<img src="${escapeHtml(filename)}">`;
}

export function joinEffect(lines) {
  return lines.map(escapeHtml).join('<br>');
}

// Strip TSV-breaking characters from a field value.
export function tsvField(text) {
  return String(text).replace(/[\t\r\n]+/g, ' ');
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
