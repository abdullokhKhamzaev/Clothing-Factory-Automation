// Ishbay oylik 15 kunlik davrlarda to'lanadi: 1-davr (1–15) va 2-davr (16 – oy oxiri).
// To'lovlar davrga QO'LDA bog'lanmaydi — FIFO qoidasi ishlaydi: oy qatoriga yozilgan
// to'lovlar xronologik tartibda avval 1-davr qarzini yopadi, ortgani 2-davrga o'tadi,
// undan ham ortgani bonus. Shu tufayli kechikkan to'lov ham o'z davriga to'g'ri tushadi.

// DateFilter'dan kelgan dateFrom ('YYYY-MM-DDT00:00:00') → tanlangan davr raqami (1 yoki 2)
export function periodFromDateFrom(dateFrom) {
  if (!dateFrom || dateFrom.length < 10) return null;
  const day = parseInt(dateFrom.substring(8, 10), 10);
  return day <= 15 ? 1 : 2;
}

// Ish yozuvlarini davrlarga bo'lib, har bir davrning ishlangan summasini qaytaradi.
// Yozuv davri — ish TASDIQLANGAN sana (createdAt) bo'yicha.
export function splitEarnedByPeriod(entries) {
  let period1 = 0;
  let period2 = 0;

  (entries || []).forEach((entry) => {
    const day = parseInt(String(entry.createdAt || '').substring(8, 10), 10);
    const price = parseFloat(entry.totalPrice || 0);
    if (!Number.isFinite(day) || !Number.isFinite(price)) return;
    if (day <= 15) period1 += price;
    else period2 += price;
  });

  return { period1, period2 };
}

// FIFO taqsimot: to'lovlar (xronologik) avval 1-davr qarzini yopadi, keyin 2-davrni,
// ortgani bonus. Bitta to'lov kerak bo'lsa ikki davrga bo'linadi — bu shunchaki
// hisob-kitob, tranzaksiyaning o'ziga tegilmaydi.
// Qaytaradi: davrlar bo'yicha to'langan summa va har davrga pul tekkan oxirgi to'lov.
export function allocatePayments(earned, transactions) {
  const result = {
    period1: { paid: 0, lastTx: null },
    period2: { paid: 0, lastTx: null },
    bonus: 0,
  };

  let remaining1 = Math.max(0, Number(earned?.period1) || 0);
  let remaining2 = Math.max(0, Number(earned?.period2) || 0);

  const sorted = [...(transactions || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  sorted.forEach((tx) => {
    let amount = parseFloat(tx.price || 0);
    if (!Number.isFinite(amount) || amount <= 0) return;

    const toPeriod1 = Math.min(amount, remaining1);
    if (toPeriod1 > 0) {
      result.period1.paid += toPeriod1;
      result.period1.lastTx = tx;
      remaining1 -= toPeriod1;
      amount -= toPeriod1;
    }

    const toPeriod2 = Math.min(amount, remaining2);
    if (toPeriod2 > 0) {
      result.period2.paid += toPeriod2;
      result.period2.lastTx = tx;
      remaining2 -= toPeriod2;
      amount -= toPeriod2;
    }

    result.bonus += amount;
  });

  return result;
}
