// AI javoblari uchun kichik, XAVFSIZ Markdown ko'rsatkich.
// Avval BUTUN matn HTML'dan qochiriladi (XSS yo'q), keyin faqat biz bilgan
// belgilar chiziladi: jadval, ro'yxat, sarlavha, qalin matn.

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text) {
  // **qalin** belgilarini chizamiz (matn allaqachon escape qilingan)
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function isTableRow(line) {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.length > 2;
}

function isSeparatorRow(line) {
  return /^\s*\|[\s\-:|]+\|\s*$/.test(line);
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
}

export function renderMarkdown(raw) {
  const lines = escapeHtml(raw).split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Jadval bloki
    if (isTableRow(line)) {
      const block = [];
      while (i < lines.length && isTableRow(lines[i])) {
        block.push(lines[i]);
        i++;
      }
      const rows = block.filter(l => !isSeparatorRow(l)).map(splitRow);
      if (rows.length) {
        let html = '<table class="md-table"><thead><tr>';
        html += rows[0].map(c => `<th>${inline(c)}</th>`).join('');
        html += '</tr></thead><tbody>';
        for (const row of rows.slice(1)) {
          html += '<tr>' + row.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
        }
        html += '</tbody></table>';
        out.push(html);
      }
      continue;
    }

    // Ro'yxat bloki
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push('<ul class="md-list">' + items.map(it => `<li>${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }

    // Sarlavha
    const heading = line.match(/^\s*#{1,4}\s+(.*)$/);
    if (heading) {
      out.push(`<div class="md-heading">${inline(heading[1])}</div>`);
      i++;
      continue;
    }

    // Oddiy qator
    out.push(line.trim() === '' ? '<div class="md-gap"></div>' : `<div>${inline(line)}</div>`);
    i++;
  }

  return out.join('');
}
