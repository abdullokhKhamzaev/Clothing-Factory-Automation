// O'zbek lotin <-> kirill transliteratsiyasi.
// Qidiruvda "ruxshona" deb yozilsa "Рухшона" ham topilishi uchun.
// Tartib muhim: avval ko'p harfli birikmalar almashtiriladi.
const LAT_TO_CYR = [
  ["o'", 'ў'], ['o‘', 'ў'], ['oʻ', 'ў'],
  ["g'", 'ғ'], ['g‘', 'ғ'], ['gʻ', 'ғ'],
  ['sh', 'ш'], ['ch', 'ч'],
  ['yo', 'ё'], ['yu', 'ю'], ['ya', 'я'], ['ye', 'е'],
  ['ts', 'ц'],
  ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'],
  ['g', 'г'], ['h', 'ҳ'], ['i', 'и'], ['j', 'ж'], ['k', 'к'],
  ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'],
  ['q', 'қ'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'],
  ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з'],
  ["'", 'ъ'], ['’', 'ъ'],
];

// Hamma matnni yagona (kirill) ko'rinishga keltiradi:
// kirill belgilar o'zgarmaydi, lotincha belgilar kirillga o'giriladi
export function toCyrillic(text) {
  let result = String(text ?? '').toLowerCase();
  for (const [lat, cyr] of LAT_TO_CYR) {
    result = result.split(lat).join(cyr);
  }
  return result;
}

// Amalda almashinib yoziladigan harflarni bitta ko'rinishga keltiradi:
// Ҳамид/Хамид (h/x), Элдор/Елдор (э/е) va h.k. — qidiruv ikkalasida ham topsin
const FOLD_PAIRS = [
  ['ҳ', 'х'],
  ['э', 'е'],
  ['щ', 'ш'],
  ['ы', 'и'],
];

function fold(text) {
  let result = text;
  for (const [from, to] of FOLD_PAIRS) {
    result = result.split(from).join(to);
  }
  return result;
}

// Alifbodan qat'i nazar qidiruv mosligini tekshiradi
export function searchMatch(label, needle) {
  const rawNeedle = String(needle ?? '').toLowerCase().trim();
  if (!rawNeedle) return true;

  const rawLabel = String(label ?? '').toLowerCase();
  if (rawLabel.includes(rawNeedle)) return true;

  return fold(toCyrillic(rawLabel)).includes(fold(toCyrillic(rawNeedle)));
}
