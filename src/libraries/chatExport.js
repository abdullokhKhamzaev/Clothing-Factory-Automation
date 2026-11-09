import { renderMarkdown } from "src/libraries/miniMarkdown.js";

// AI chat suhbatini ulashish uchun eksport: matn (clipboard) va PDF (chop).

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Suhbatni oddiy matnga aylantiradi — Telegram/WhatsApp'ga tashlash uchun.
 * labels: { title, question, answer }
 */
export function chatToText(messages, labels) {
  const lines = [`${labels.title} — ${new Date().toLocaleDateString()}`, ''];

  for (const message of messages) {
    const prefix = message.role === 'user' ? `❓ ${labels.question}` : `🤖 ${labels.answer}`;
    lines.push(`${prefix}:`);
    lines.push(String(message.content ?? '').trim());
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Suhbatning chop etiladigan (PDF) HTML hujjatini quradi.
 * AI javoblari miniMarkdown orqali (jadval/qalin) chiziladi.
 */
export function buildChatHtml(messages, labels) {
  const blocks = messages.map(message => {
    if (message.role === 'user') {
      return `<div class="msg user"><div class="who">❓ ${escapeHtml(labels.question)}</div>`
        + `<div class="body">${escapeHtml(message.content)}</div></div>`;
    }

    return `<div class="msg ai"><div class="who">🤖 ${escapeHtml(labels.answer)}</div>`
      + `<div class="body">${renderMarkdown(message.content)}</div></div>`;
  }).join('\n');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(labels.title)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; margin: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .date { color: #777; margin-bottom: 20px; }
  .msg { margin-bottom: 14px; border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; page-break-inside: avoid; }
  .msg.user { background: #eef4fd; }
  .who { font-weight: bold; margin-bottom: 6px; color: #1565c0; }
  .msg.ai .who { color: #2e7d32; }
  .body { white-space: pre-wrap; }
  .msg.ai .body { white-space: normal; }
  .md-table { border-collapse: collapse; margin: 8px 0; width: 100%; font-size: 12px; }
  .md-table th, .md-table td { border: 1px solid #bbb; padding: 4px 7px; text-align: left; }
  .md-table th { background: #f0f4f8; }
  .md-list { margin: 6px 0; padding-left: 20px; }
  .md-heading { font-weight: bold; margin: 8px 0 4px; }
  .md-gap { height: 8px; }
</style>
</head>
<body>
<h1>${escapeHtml(labels.title)}</h1>
<div class="date">${new Date().toLocaleString()}</div>
${blocks}
</body>
</html>`;
}

/**
 * Yashirin iframe orqali chop etadi — popup emas, brauzer BLOKLAMAYDI.
 * Chop oynasida foydalanuvchi «PDF sifatida saqlash»ni tanlaydi.
 */
export function printHtml(html) {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const frameDoc = frame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    // Chop oynasi yopilgach iframe'ni tozalaymiz
    setTimeout(() => frame.remove(), 60000);
  }, 300);
}
