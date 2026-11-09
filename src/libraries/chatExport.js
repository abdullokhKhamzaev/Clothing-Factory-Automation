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
 * Suhbatni savol-javob JUFTLARIGA yig'adi va shovqinni tozalaydi:
 * xatolik tufayli javobsiz qolib qayta yuborilgan savollar (ketma-ket
 * kelgan user xabarlari) dan faqat oxirgisi olinadi.
 * Natija: [{ question, answer|null }]
 */
function toQaPairs(messages) {
  const pairs = [];

  for (const message of messages) {
    const content = String(message.content ?? '').trim();
    if (!content) continue;

    if (message.role === 'user') {
      const last = pairs[pairs.length - 1];
      if (last && last.answer === null) {
        // Oldingi savol javobsiz qolgan (xatolik) — yangisi uning o'rnini oladi
        last.question = content;
      } else {
        pairs.push({ question: content, answer: null });
      }
    } else if (pairs.length) {
      pairs[pairs.length - 1].answer = content;
    }
  }

  return pairs;
}

/**
 * Suhbatni oddiy matnga aylantiradi — Telegram/WhatsApp'ga tashlash uchun.
 * labels: { title, question, answer, noAnswer }
 */
export function chatToText(messages, labels) {
  const lines = [`${labels.title} — ${new Date().toLocaleDateString()}`, ''];

  for (const pair of toQaPairs(messages)) {
    lines.push(`❓ ${pair.question}`);
    lines.push(pair.answer ?? `(${labels.noAnswer})`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Suhbatning chop etiladigan (PDF) HTML hujjatini quradi — hisobot
 * ko'rinishida: savol ko'k tasma, javob uning ostida (jadval/qalin
 * miniMarkdown orqali chiziladi). Emojisiz — chop etishda buziladi.
 */
export function buildChatHtml(messages, labels) {
  const blocks = toQaPairs(messages).map(pair => {
    const answer = pair.answer === null
      ? `<div class="a no-answer">${escapeHtml(labels.noAnswer)}</div>`
      : `<div class="a">${renderMarkdown(pair.answer)}</div>`;

    return `<div class="qa"><div class="q">${escapeHtml(pair.question)}</div>${answer}</div>`;
  }).join('\n');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(labels.title)}</title>
<style>
  @page { margin: 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; margin: 0; }
  h1 { font-size: 19px; margin: 0; }
  .date { color: #777; font-size: 12px; margin: 4px 0 6px; }
  .head { border-bottom: 2px solid #1565c0; padding-bottom: 10px; margin-bottom: 4px; }
  .qa { margin-top: 18px; }
  .q {
    background: #eef4fd;
    border-left: 4px solid #1565c0;
    border-radius: 0 6px 6px 0;
    padding: 8px 12px;
    font-weight: 600;
    page-break-after: avoid;
  }
  .a { padding: 8px 4px 2px; }
  .no-answer { color: #999; font-style: italic; }
  .md-table { border-collapse: collapse; margin: 8px 0; width: 100%; font-size: 12px; }
  .md-table th, .md-table td { border: 1px solid #c5ccd4; padding: 4px 8px; text-align: left; }
  .md-table th { background: #e8eef5; }
  .md-table tr:nth-child(even) td { background: #f7f9fb; }
  .md-list { margin: 6px 0; padding-left: 20px; }
  .md-heading { font-weight: bold; margin: 8px 0 4px; }
  .md-gap { height: 8px; }
</style>
</head>
<body>
<div class="head">
  <h1>${escapeHtml(labels.title)}</h1>
  <div class="date">${new Date().toLocaleString()}</div>
</div>
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
