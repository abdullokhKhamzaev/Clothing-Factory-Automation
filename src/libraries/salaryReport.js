// Ish haqi PDF hisoboti: direktor uchun «ishchilardan necha pul qarzmiz» javobi.
//
// Ikki tur hisobot:
//   period = 1  -> «1–15 davr»: faqat ishbay ishchilar (shu davr ishi, FIFO bo'yicha
//                  shu davrga tushgan to'lovi, qarzi)
//   period = 2  -> «Oy yakuni»: ishbay to'liq oy + belgilangan oylik va kunlik
//                  xodimlar ham (butun oy holati)
//
// Hisob mantiqlari sahifadagi bilan BIR XIL: FIFO (salaryPeriod.js), qo'shimcha
// to'lov ishlagan davrga, qarz faqat musbat qoldiq (bonus boshqani yashirmaydi).

import { splitEarnedByPeriod, allocatePayments } from './salaryPeriod.js';

export function buildReportData(salaries, monthEntries, period) {
  // Ish yozuvlarini ishchi bo'yicha guruhlash
  const entriesByWorker = new Map();
  (monthEntries || []).forEach((entry) => {
    const iri = entry.workerBy?.['@id'] || entry.workerBy;
    if (!iri) return;
    if (!entriesByWorker.has(iri)) entriesByWorker.set(iri, []);
    entriesByWorker.get(iri).push(entry);
  });

  const rows = [];

  (salaries || []).forEach((salary) => {
    const workerIri = salary.worker?.['@id'];
    const name = (salary.worker?.fullName || '').trim();
    const currency = salary.budget?.name || '';
    const base = Number(salary.baseSalary) || 0;
    const daily = Number(salary.dailyWage) || 0;
    const workedDays = Number(salary.workedDays) || 0;
    const extra = Number(salary.worker?.extraPayment) || 0;
    const extraReason = salary.worker?.extraPaymentReason || '';
    const transactions = salary.transaction || [];
    const paidTotal = transactions.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
    const isFixed = base > 0 || daily > 0;

    const earned = splitEarnedByPeriod(entriesByWorker.get(workerIri) || []);
    const owedP1 = earned.period1 > 0 ? earned.period1 + extra : 0;
    const owedP2 = earned.period2 > 0 ? earned.period2 + extra : 0;

    // «Nega hisoblanmagan» — ishchining maosh turiga qarab aniq sabab:
    // kunlik -> davomat yuritilmagan; oylik -> summa belgilanmagan; ishbay -> ish yozuvi yo'q
    const salaryType = salary.worker?.salaryType;
    const unearnedReason = salaryType === 'daily' ? 'noAttendance'
      : salaryType === 'monthly' ? 'noSalarySet'
      : 'noEntries';

    let type;
    let owed;
    let paid;
    let note = '';

    if (period === 1) {
      // 1–15: faqat ishbay
      if (isFixed) return;
      type = 'piecework';
      owed = owedP1;
      paid = allocatePayments({ period1: owedP1, period2: owedP2 }, transactions).period1.paid;
      if (owed === 0 && paidTotal === 0) return;
      if (owed === 0 && paid === 0) return; // bu davrga tegishli hech narsa yo'q
      if (owed === 0 && paid > 0) note = unearnedReason;
    } else {
      // Oy yakuni: butun oy holati
      paid = paidTotal;
      if (isFixed) {
        type = base > 0 ? 'monthly' : 'daily';
        owed = (base > 0 ? base : daily) + extra * 2;
      } else {
        type = salaryType === 'daily' ? 'daily' : salaryType === 'monthly' ? 'monthly' : 'piecework';
        owed = owedP1 + owedP2;
      }
      if (owed === 0 && paid === 0) return;
      if (owed === 0 && paid > 0) note = unearnedReason;
    }

    rows.push({
      name,
      type,
      currency,
      owed,
      paid,
      debt: Math.max(0, owed - paid),
      bonus: Math.max(0, paid - owed),
      extra,
      extraReason,
      workedDays: type === 'daily' ? workedDays : null,
      note,
    });
  });

  // Eng katta qarzlar tepada
  rows.sort((a, b) => b.debt - a.debt || b.owed - a.owed);

  const totals = {};
  rows.forEach((row) => {
    if (!totals[row.currency]) totals[row.currency] = { owed: 0, paid: 0, debt: 0, bonus: 0 };
    const t = totals[row.currency];
    t.owed += row.owed;
    t.paid += row.paid;
    t.debt += row.debt;
    t.bonus += row.bonus;
  });

  return { rows, totals };
}

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Chop etiladigan hujjat: brauzerning "PDF sifatida saqlash"i bilan bir bosishda PDF
export function buildReportHtml({ rows, totals }, { title, subtitle, generatedLine, labels, formatMoney }) {
  const statusCell = (row) => {
    if (row.note) {
      return `<span class="warn">${esc(labels.reasons[row.note] || labels.reasons.noEntries)}</span>`;
    }
    if (row.debt > 0) {
      return `<span class="debt">${esc(labels.debt)}: ${formatMoney(row.debt)} ${esc(row.currency)}</span>`;
    }
    if (row.bonus > 0) {
      return `<span class="bonus">${esc(labels.bonus)}: +${formatMoney(row.bonus)} ${esc(row.currency)}</span>`;
    }
    return `<span class="ok">${esc(labels.fullyPaid)}</span>`;
  };

  const extraCell = (row) => {
    if (!(row.extra > 0)) return '';
    const reason = row.extraReason ? ` (${esc(row.extraReason)})` : '';
    return `<div class="muted">+ ${formatMoney(row.extra)} ${esc(labels.extraSuffix)}${reason}</div>`;
  };

  const bodyRows = rows.map((row, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${esc(row.name)}${extraCell(row)}</td>
      <td>${esc(labels.types[row.type] || row.type)}${row.workedDays ? ` (${row.workedDays} ${esc(labels.days)})` : ''}</td>
      <td class="num">${row.owed > 0 ? `${formatMoney(row.owed)} ${esc(row.currency)}` : '—'}</td>
      <td class="num">${row.paid > 0 ? `${formatMoney(row.paid)} ${esc(row.currency)}` : '—'}</td>
      <td class="num">${row.debt > 0 ? `<b class="debt">${formatMoney(row.debt)} ${esc(row.currency)}</b>` : '—'}</td>
      <td>${statusCell(row)}</td>
    </tr>`).join('');

  const totalLines = Object.entries(totals).map(([currency, t]) => `
    <div class="total-box">
      <div class="total-currency">${esc(currency)}</div>
      <div>${esc(labels.owed)}: <b>${formatMoney(t.owed)}</b></div>
      <div>${esc(labels.paid)}: <b>${formatMoney(t.paid)}</b></div>
      <div class="debt">${esc(labels.totalDebt)}: <b>${formatMoney(t.debt)}</b></div>
      ${t.bonus > 0 ? `<div class="bonus">${esc(labels.bonus)}: <b>+${formatMoney(t.bonus)}</b></div>` : ''}
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, "Helvetica Neue", sans-serif; color: #1a1a1a; margin: 24px; font-size: 13px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .subtitle { color: #555; margin-bottom: 16px; }
  .totals { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
  .total-box { border: 1px solid #ccc; border-radius: 8px; padding: 10px 14px; min-width: 200px; }
  .total-currency { font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #eee; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f0f0f0; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .debt { color: #b00020; }
  .bonus { color: #9a6700; }
  .ok { color: #1a7f37; }
  .warn { color: #9a6700; }
  .muted { color: #777; font-size: 11px; }
  .footer { margin-top: 16px; color: #777; font-size: 11px; }
  @media print { body { margin: 8mm; } .no-print { display: none; } }
</style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="subtitle">${esc(subtitle)}</div>
  <div class="totals">${totalLines || `<div class="total-box">${esc(labels.empty)}</div>`}</div>
  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>${esc(labels.worker)}</th>
        <th>${esc(labels.type)}</th>
        <th class="num">${esc(labels.owed)}</th>
        <th class="num">${esc(labels.paid)}</th>
        <th class="num">${esc(labels.debt)}</th>
        <th>${esc(labels.status)}</th>
      </tr>
    </thead>
    <tbody>${bodyRows || `<tr><td colspan="7">${esc(labels.empty)}</td></tr>`}</tbody>
  </table>
  <div class="footer">${esc(generatedLine)}</div>
</body>
</html>`;
}
