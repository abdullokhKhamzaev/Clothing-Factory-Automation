# KidsClub — Tikuv Fabrikasi Avtomatlashtiruv Tizimi

> Loyihaning to'liq qo'llanmasi: arxitektura, rollar, sahifalar, biznes-oqimlar, maosh va pul tizimi, xavfsizlik.
> Oxirgi yangilanish: 2026-08-23

---

## 1. Umumiy arxitektura

| Qatlam | Texnologiya | Manzil |
|---|---|---|
| Frontend | Quasar v2 (Vue 3, JavaScript, Pinia, Axios, vue-i18n) | `Clothing-Factory-Automation` repo (GitHub) |
| Backend | PHP 8.2, Symfony 6.2, API Platform 3.1, Doctrine ORM | `kids-club-api` repo (GitLab) |
| Baza | MariaDB 10.5 (Docker) | 44 jadval |
| Auth | JWT (LexikJWT, RS256), login = **telefon raqami** | access + refresh token |
| Tillar | O'zbek-lotin (asosiy), O'zbek-kirill, Ingliz | `src/i18n/` |

- API qatlami: `src/boot/axios.js` (bitta global client, JWT header, `application/ld+json`).
- Har API resurs uchun bitta Pinia store (`src/stores/`).
- Backend: entity-driven API (40 ta `#[ApiResource]`), biznes-logika `src/Component/`, maxsus amallar `src/Controller/`.
- Soft-delete: `ReadExtension` API so'rovlarida `deletedAt IS NULL` filtrini avtomatik qo'shadi (konsol buyruqlariga ta'sir qilmaydi!).

### Ishlab chiqarish zanjiri

```
TO'QUV → BO'YOQ → BICHUV → VISHIVKA (agar bo'lsa) → TIKUV → QADOQLASH → MAHSULOT OMBORI → SAVDO
```

### Omborlar (warehouse jadvalidagi nomlar)

| ID | Nom (bazada) | Ma'nosi |
|---|---|---|
| 1 | cutterWarehouse | Bichuv ombori (bichilgan mahsulot) |
| 2 | cutterDefectiveWarehouse | Brak ombori |
| 3 | embroideryWarehouse | Vishivka ombori (kirim) |
| 4 | embroideryReadyWarehouse | Vishivka tayyor |
| 5 | sewerWarehouse | Tikuv ombori (kirim) |
| 6 | sewerReadyWarehouse | (ishlatilmaydi — tikuv to'g'ridan-to'g'ri 7 ga o'tadi) |
| 7 | packagerWarehouse | Qadoqlash ombori (kirim) |
| 8 | packagerReadyWarehouse | Qadoqlangan tayyor |
| 9 | productsWarehouse | Mahsulot ombori (sotuvga tayyor) |

---

## 2. ROLLAR va vazifalari

Har userda **bitta rol** (forma shunday cheklangan; baza texnik jihatdan massiv saqlaydi).

### SUPER_ADMIN
Hamma eshik ochiq, cheklovsiz.

### ADMIN
Hozircha super-admin bilan teng huquqli (kelajakda cheklovlar kiritilishi mumkin). Vazifalari:
- Zakaz (Order) va savdo yaratish, mijozlar, byudjet/pul amallari, oyliklar to'lash
- To'quv va bichuv buyurtmalarini yaratish; **to'quvchi va bichuvchi hisobotlarini tasdiqlash/rad etish**
- Qadoqlangan mahsulotni mahsulot omboriga (8→9) **jo'natish va qabul qilish — faqat admin**
- Sozlamalar (model, material, ip, aksessuar, vishivka, bo'yoq)
- Foydalanuvchi yaratish/boshqarish

### MASTER
**Vishivkachi, Tikuvchi, Qadoqlovchi** bo'limlariga tegishli BARCHA ombor o'tishlarini tasdiqlaydi/rad etadi — ham ishchilarning hisobotlarini (chiqim), ham ularning omborlariga kirimlarni (masalan bichuvdan vishivkaga, vishivkadan tikuvga kelganini master qabul qiladi). Bichuvchi va To'quvchi hisobotlari bilan ishlamaydi (ular admin nazoratida). Pul, savdo, sozlamalarga kira olmaydi. 8→9 (mahsulot omboriga) o'tishga aralasha olmaydi.

### TO'QUVCHI (WEAVER)
- Admin bergan to'quv buyurtmasini ko'radi va **qabul qiladi** (faqat `pending→confirmed`)
- "To'qib bo'ldim" hisobotini topshiradi: kg (1-sort/2-sort), ro'lon, ishlatilgan ip (rasxod)
- O'z oyligini ko'radi. Boshqa hech narsa.

### BICHUVCHI (CUTTER)
- Bichuv buyurtmasini qabul qiladi (faqat `pending→confirmed`, faqat status maydonini o'zgartira oladi)
- "Bichdim" hisobotini topshiradi (o'lchamlar bo'yicha dona)
- Bichilganlarni vishivka/tikuvga **jo'natadi**
- **Brak omboriga kelgan amallarni qabul/rad etadi** (master shart emas) va brakni qayta bichib hisobot topshiradi
- Mato (materiallar) bilan ishlaydi, o'z oyligini ko'radi

### VISHIVKACHI (EMBROIDERER)
- Hisobot topshiradi: modelga **qaysi vishivkalar** urilganini o'zi tanlaydi (`selectedEmbroideryIds`) + dona. Modeldagi sozlama vishivkalari faqat default/ma'lumot — maosh hisobotdagi tanlovdan!
- Brakka jo'natadi. Kirim ham, hisobot ham **master tomonidan** tasdiqlanadi. O'z oyligini ko'radi.

### TIKUVCHI (SEWER)
- Hisobot topshiradi → tasdiqlangach mahsulot **qadoqlash omborida (7)** paydo bo'ladi (tikuvchi va qadoqlovchi bir xonada — 6-ombor ishlatilmaydi)
- Brakka jo'natadi. Kirim ham, hisobot ham **master tomonidan** tasdiqlanadi. O'z oyligini ko'radi.

### QADOQLOVCHI (PACKAGER)
- Hisobot topshiradi (7→8), brakka jo'natadi. Master tasdiqlaydi. O'z oyligini ko'radi.
- 8→9 ga jo'nata OLMAYDI (admin ishi).

### USER
Huquqsiz "shunchaki odam" — dasturga kirmaydi, davomat/oylik hisobida turadi (masalan kunlik ishchi).

### MERCHANT
Ishlatilmaydi (savdoni adminlar qiladi). Rol tanlovidan olib tashlangan.

---

## 3. Xavfsizlik matritsasi (backendda majburiy)

### Qabul qilish (acceptance) huquqlari

| Amal | Kim |
|---|---|
| To'quv hisobotini qabul/rad (`completed-unripe.../acceptance`) | ADMIN |
| Bichuv hisobotini qabul/rad (`product_model_order_completeds/{id}/accept`) | ADMIN |
| Ombor o'tishini qabul/rad (`product_in_warehouse_actions/{id}/accept`) | ADMIN, MASTER; CUTTER faqat brak omboriga(2) kelganini. Vishivkachi/tikuvchi/qadoqlovchi qabul qilMAYdi — ularning kirim-chiqimini master tasdiqlaydi |
| 8→9 (mahsulot omboriga) qabul VA jo'natish | faqat ADMIN |
| Ish yozuvini qabul (`work_entries/{id}/accept`) | ADMIN |

### Status-o'tish qoidasi
Ishchi (to'quvchi/bichuvchi) buyurtma statusini faqat **`pending → confirmed`** o'tkaza oladi. Orqaga qaytarish, yakunlash — faqat admin. Bichuvchi alohida `/product_model_orders/{id}/status` endpointidan foydalanadi (faqat status+confirmedBy maydonlari — buyurtmani qayta yozib bo'lmaydi).

### Takror-qabul himoyalari (pul/ombor ikki marta o'zgarmasligi uchun)
- Ombor o'tishlari: `receivedAt` belgisi (faqat qabulda yoziladi)
- To'quv: `receivedBy` belgisi
- Bichuv: asl status `pending` bo'lishi shart
- Savdo mahsuloti: buyurtma qatorlari omborga tegmaydi (`productInWarehouse = null` guard)

### Boshqa himoyalar
- **Pul endpointlari** (savdo, buyurtma, mijoz, byudjet, tranzaksiya, qarz, oylik to'lovlari) — faqat ADMIN (o'qish ham)
- **Oylik va ish yozuvlari**: ishchi faqat O'ZINIKINI ko'radi (`OwnWorkerDataExtension`)
- `POST /api/users` — token + ADMIN (avval internetga ochiq edi — yopilgan)
- Frontend double-click: barcha hisobot/tasdiqlash formalarida loading-guard
- **Ochiq qolgan (2-bosqichga)**: sozlamalar yozuvlari (model/ip/aksessuar yaratish), bichuvchi mato oqimi (`cutter_ripe_material_warehouse`) — istalgan login yoza oladi

---

## 4. Sahifalar katalogi

### 4.1 Admin panel (`/admin/*`)

| Sahifa | Yo'l | Asosiy featurelar |
|---|---|---|
| Foydalanuvchilar | `users/employees` | Xodim yaratish (bitta rol), tahrirlash, o'chirish (soft) |
| Davomat | `users/attendance` | Kunlik davomat belgilash |
| Oyliklar | `users/salary` | **Tepada 3 jami-karta** (hisoblangan / to'langan(avans bilan) / qoldiq — oy filtri bo'yicha, valyuta alohida); oylik/avans to'lash |
| To'quv | `weave/*` | Buyurtma yaratish (material + kutilgan ip sarfi), pending/completed, hisobotlarni qabul/rad |
| Bo'yoq | `paint/*` | Mato bo'yoqqa jo'natish (status: expected→accepted), repaint |
| Bichuv | `cut/*` | Buyurtmalar, hisobotlar qabul/rad, materiallar, brak |
| Vishivka / Tikuv / Qadoqlash | `embroidery/*`, `sew/*`, `packing/*` | Omborlar ko'rinishi, o'tishlarni tasdiqlash |
| Mahsulot ombori | `product-warehouse` | Qoldiqlar (reviziya — super-admin UI'da), 8→9 qabul |
| Mijozlar | `customers`, `customers/:id` | CRUD, mijoz kartasi (savdolari, qarzi) |
| **Buyurtmalar (zakazlar)** | `orders` | Zakaz yaratish: **istalgan katalog modelidan** (omborda 0 bo'lsa ham!), avans qabul qilish; jadvalda: model nomlari bilan mahsulotlar, **Yetkazilish progress** (N/M %), Avans (qoldiq), qo'lda **Yopish/Bekor qilish** (progress ko'rsatilgan tasdiq bilan), "Yopildi (qisman)" halol statusi |
| Savdo | `sales` | Savdo yaratish: xaridor → **ochiq zakazga bog'lash (ixtiyoriy, avtoto'ldirish: mahsulot+kelishilgan narx, byudjet zakaz valyutasiga mos)**, **avansdan ishlatish** maydoni, chegirma, to'lov xulosasida avans/qarz to'g'ri; qarz to'lash (receivedSaleDebt) |
| Statistika | `statistic` | quyida 6-bo'lim |
| Byudjet | `budget/*` | Kassalar, kirim/chiqim, o'tkazma (send, tasdiqlash bilan), konvertatsiya, qarzdorlik (indebtedness), qarz to'lash |
| Sozlamalar | `setting/*` | Ip, Materiallar, Bo'yoq fabrikasi, Rang, **Model** (o'lchamlar, narx, default vishivkalar, aksessuarlar), Aksessuar (turlari bilan), Vishivka (nom + ishchi narxi) |

### 4.2 Rol portallari

| Portal | Sahifalar | Featurelar |
|---|---|---|
| `/weaver` | orders (pending), completed, salary | Qabul qilish, hisobot (kg/ro'lon/2-sort/ip sarfi), o'z oyligi |
| `/cutter` | orders (pending), completed, materials, warehouse, defects | Qabul, hisobot, mato olish, ombor ko'rinishi, **brak qabul/rad + qayta bichish hisoboti** |
| `/embroiderer` | warehouse, ready, salary | Kirimni qabul/rad, hisobot (**vishivkalarni tanlab**), brakka jo'natish |
| `/sewer` | warehouse, salary | Kirimni qabul/rad, hisobot (→7-ombor), brakka jo'natish |
| `/packager` | warehouse, salary | Hisobot (7→8), brakka jo'natish |
| `/master` | embroidery ready, sewing ready, packaging ready, cutting | Uch bo'lim ishlarini tasdiqlash/rad etish |

Login'dan keyin yo'naltirish roli bo'yicha (`LoginPage.redirectUserByRole`).

---

## 5. Maosh tizimi

### Maosh turlari (user.salaryType)
- **monthly** — oylik stavka (`baseSalary`)
- **kunlik** — `dailyWage × workedDays` (davomatdan)
- **ishbay (piecework)** — `pieceworkEarning` (ish yozuvlaridan yig'iladi)

Hisoblangan oylik = `baseSalary` yoki `kunlik×kun` yoki `ishbay`. To'langan = `advancePayment + paidAmount`.

### Ishbay maosh qanday yoziladi (WorkEntries)

| Rol | Manba | Formula | Qachon |
|---|---|---|---|
| To'quvchi | Material sozlamasi | `payWorker×kg + payWorkerSort2×kg2` | Admin hisobotni qabul qilganda |
| Vishivkachi | Hisobotda tanlangan vishivkalar | Σ `vishivka.workerPrice × dona` | Master qabul qilganda |
| Vishivkachi (qo'shimcha, mas. "chiska") | Modelga ulangan `embroideryService` aksessuar | `workerPrice × dona` | Master qabul qilganda (tanlovdan ALOHIDA, ataylab qo'shimcha) |
| Tikuvchi | Modelga ulangan `sewerService`/`sewer` aksessuar | `workerPrice × dona` | Master qabul qilganda (5→7) |
| Qadoqlovchi | `packagerService`/`packager` aksessuar | `workerPrice × dona` | Master qabul qilganda (7→8) |
| Bichuvchi | Ishbay yozuvi YO'Q (bichuv qabuli faqat omborni o'zgartiradi) | — | — |

**Qoida**: modelga narx/xizmat ulanmagan bo'lsa — to'lanmaydi (ataylab shunday).

### Muhim mexanizmlar
- Oylik qatorlarini `salary:create` cron buyrug'i yaratadi (faqat o'chirilmagan userlar, idempotent — takror ishlatsa dublikat yo'q). Qator bo'lmasa ham daromad yo'qolmaydi: qabul paytida qator avtomatik yaratiladi.
- Ish yozuvi qabul **joriy oy** oyligiga qo'shiladi (qabul sanasi bo'yicha).
- `attendance:create` cron ham faqat o'chirilmagan userlarga.
- Ish yozuvini DELETE qilish API'da yo'q; accepted yozuv qayta qabul qilinmaydi.

---

## 6. Statistika sahifasi (`/admin/statistic`)

1. **Sana filtri** — default bugungi kun (2 ta sana tanlagich).
2. **KPI Dashboard** (7 karta): Sotildi, Ishlab chiqarildi, Ombordagi qoldiq, Tushum, To'langan, Qarz, Xarajat (oylik/ayriboshlashsiz). Valyutalar alohida. (Foyda kartasi ataylab yo'q — tan narx noma'lum.)
3. **Ishlab chiqarish jarayoni** paneli — bitta qatorda 8 bosqich: tasdiqlangan miqdor + to'q sariq **"Tasdiq kutmoqda"** belgisi + **eng eskisi qancha kutayotgani**; kartani bossa tegishli bosqichga o'tadi.
4. **Stepper** (8 qadam): To'quv, Bichuv, Vishivka, Tikuv, Qadoqlash, Savdo, Xarajatlar, Pul almashinuvi.
   - Har tab: **Mahsulot bo'yicha / Xodim bo'yicha** toggle (yagona `ModelStatsBreakdown` komponenti)
   - Har tab: **⏱ vaqt ko'rsatkichi** (tasdiqlash o'rtacha/eng uzoq; kutish o'rtacha/eng eskisi) + **"Batafsil (vaqtlar)"** — har yozuv: kim, qachon topshirgan → qachon tasdiqlangan (kim aybdorligini ko'rsatadi)
   - To'quv: kg + ro'lon + 2-sort birliklari bilan
5. **Savdo qadami — 3 tab**:
   - *Savdo*: model bo'yicha, ichida xaridorlar; xaridor bo'yicha (qarzlari bilan)
   - *Tahlil*: sotuv/ishlab-chiqarish %, top modellar, xaridor konsentratsiyasi (70%+ qizil), ombor qoldig'i ("bu davrda sotilmagan" belgisi), **Qarzdorlar** (eng eski qarz sanasi bilan), top xaridorlar
   - *Talab*: zakazlar asosida — talab vs yetkazildi, yetkazilmadi (qizil), eng talabgor modellar, xaridorlar kesimida

Texnik: sotuvlar so'rovi 30s keshlanadi (bir sahifada takror so'rov ketmaydi).

### Statistika ma'lumot manbalari (nima, qayerdan, qanday)

| Ko'rsatkich | API manbasi | Hisoblash |
|---|---|---|
| Dashboard: Sotildi / Tushum / To'langan / Qarz | `GET /sales` (sana oralig'i, server filtri) | dona = saleProduct.quantities yig'indisi; tushum = totalPrice, qarz = totalPrice − paidPrice; valyuta `budget.name`dan (so'm/USD) |
| Dashboard: Ishlab chiqarildi | `GET /product_in_warehouse_actions?from=7&to=8&status=accepted` | qadoqlangan-qabul qilingan donalar (getStats) |
| Dashboard: Ombordagi qoldiq | `GET /warehouses?name=productsWarehouse` | productInWarehouses ichidagi size.quantity yig'indisi (JORIY holat, sanaga bog'liq emas) |
| Dashboard: Xarajat | `GET /transactions?isIncome=false` (sana oralig'i) | paidPrice yig'indisi; 'ayriboshlash' va 'payedcustomersalary' chiqariladi |
| Jarayon paneli: To'quv | `GET /completed_unripe_material_orders` (HAMMASI, sana filtri CLIENTDA — endpointda DateFilter yo'q) | accepted=kg yig'indisi; kutilmoqda=notAccepted |
| Jarayon paneli: Bo'yoq | `GET /ripe_material_orders` (sana filtri clientda) | accepted / expected, sentQuantitySort1+2 kg |
| Jarayon paneli: Bichuv | `GET /product_model_order_completeds` (server sana filtri) | accepted / pending donalar |
| Jarayon paneli: Vishivka/Tikuv/Qadoqlash/Ombor | `GET /product_in_warehouse_actions` tegishli from/to bilan | accepted / pending; "eng eskisi" = pending ichidagi eng kichik createdAt dan hozirgacha |
| Stepper tablari (Bichildi, Vishivka urildi...) | tegishli resurs + status + sana | getStats: model→dona, model→xodim (sentBy/confirmedBy) |
| ⏱ Vaqt ko'rsatkichlari | yozuvlarning o'zidan | tasdiqlash = createdAt → receivedAt (ombor amallari) yoki updatedAt (to'quv/bichuv); kutish = createdAt → hozir |
| Savdo tabi | `GET /sales` | model→xaridor kesimi, USD/so'm alohida, to'langan proporsional taqsim |
| Tahlil: sotuv/ishlab-chiqarish % | sales + PIWA 7→8 accepted (bir xil davr) | sotilgan/ishlab-chiqarilgan ×100 (100%+ = eski zaxiradan sotilgan) |
| Tahlil: Qarzdorlar | `GET /customers?hasDebt=true` + `GET /sales?isPayed=false` (sanasiz!) | usdDebts/uzsDebts (backend hisoblaydi) + eng eski to'lanmagan sotuv sanasi |
| Tahlil: Ombor qoldig'i | warehouses?name=productsWarehouse | model→o'lcham; "bu davrda sotilmagan" = davr sotuvlarida yo'q model |
| Talab tabi | `GET /orders` (sana filtri CLIENTDA) + sales | talab = order.products.quantities; yetkazildi = o'sha xaridor+model bo'yicha davr sotuvlari; yetkazilmadi = max(0, farq) |
| Oyliklar sahifasi jamilari | `GET /salaries?month=...&pagination=false` | hisoblangan = baseSalary yoki kunlik×kun yoki ishbay; to'langan = advancePayment+paidAmount |

**Muhim ogohlantirishlar**:
- To'quv, Bo'yoq va Talab (orders) manbalarida server sana-filtri yo'q — hamma yozuv olinib clientda filtrlanadi; ma'lumot juda ko'payganda backend'ga DateFilter qo'shish tavsiya etilgan
- Solishtirmalar (sotuv vs ishlab-chiqarish, talab vs yetkazish) BIR XIL davr ichida — davrlararo zaxira harakati foizni 100%+ qilishi tabiiy
- Ombor qoldig'i va Qarzdorlar — doim joriy holat, sana filtri ta'sir qilmaydi

---

## 7. Zakaz (Order) va Avans tizimi

**Oqim**: Zakaz (istalgan modeldan, ombor shart emas, omborga TEGMAYDI) → savdolar zakazga bog'lanadi → progress avtomatik → **qo'lda** yopish/bekor (har zakazning o'z talab-taklifi bor).

- Har so'rov = alohida zakaz (tarix o'zgarmas: "5000 so'radi, 400 oldi" saqlanadi)
- Statuslar: pending → delivering → delivered / **cancelled** (yo'qotilgan talab)
- `deliveredQuantity` — bog'langan savdolardan backend hisoblaydi
- Savdo formasi: zakaz tanlanganda mahsulot+narx avtoto'ldiriladi, faqat son kiritiladi; byudjet zakaz valyutasiga avto-moslanadi (aralashsa banner + avans o'chadi)
- Aralash savdo (zakazdagi + tashqi mahsulot) = ikkita alohida savdo qilinadi

**Avans (zakazda oldindan to'lov)** — buxgalteriya qoidasi:
- Zakaz yaratilganda avans kassaga **kirim** bo'ladi (`orderAdvance #N` tranzaksiya)
- Savdoda "Avansdan ishlatish": to'lovga qo'shiladi, LEKIN kassaga **qayta kirim yozilmaydi** va tranzaksiya `price`sidan chiqariladi (qarzdorlik oweUs ga ham yozilmaydi) — pul ikki marta hisoblanmaydi
- Himoya: ishlatish ≤ min(qoldiq, savdo summasi − naqd); zakaz qoldig'i avtomatik kamayadi

---

## 8. Pul tizimi (Budget/Transaction)

- Har tranzaksiya saqlanganda kassa avtomatik o'zgaradi (Transaction PrePersist): kirim → `quantity += paidPrice`; farq (`price − paidPrice`) → **oweUs** (bizga qarzdorlar); chiqim → kamayadi
- Savdo: nested tranzaksiya faqat NAQD qismga; qarz = price−paid → oweUs
- `budgets/transaction` (kirim/chiqim), `budgets/send` (kassalararo, tasdiqlash bilan), `budgets/converts` (valyuta), `budgets/payDebt` (indebtedness bo'lib to'lash)
- Xarajatlar statistikasi: `isIncome=false`, 'ayriboshlash' va 'payedcustomersalary' chiqarilgan (oylik alohida toggle)

---

## 9. Qidiruv — alifbo-agnostik

`ruxshona` ↔ `Рухшона`, `xalat` ↔ `Халат` — ikkala yo'nalishda:
- **Frontend**: `src/libraries/transliterate.js` + `selectableList` (barcha dropdownlar) + 5 ombor sahifasi
- **Backend**: `TransliteratedSearchFilter` (SearchFilter kompozitsiyasi — u final klass!) 11 entity'da: Customer, ProductModel, Material, Thread, Accessory, Embroidery, RipeMaterial, User, Transaction, Sale, Order
- **Almashinuvchi harflar birlashtirilgan**: `h↔x` (Hamid/Xamid/Ҳамид/Хамид — to'rttasi ham bir-birini topadi), `е↔э` (Eldor/Элдор); frontendda qo'shimcha `щ→ш`, `ы→и`

## 9a. Xatolik xabarlari — aniq va tushunarli

- **Frontend**: barcha xatolik-toastlar (82 joy, 37 komponent) backend yuborgan `hydra:description` matnini ko'rsatadi (`apiErrorMessage` helper, defaults.js); backend xabar bermasa — eski umumiy matn
- **Backend**: "yetarli emas" xabarlari model/material nomi va raqamlar bilan:
  `«Model» modelidan S razmer Vishivka omborida yetarli emas (bor: 2, kerak: 50)` — savdo, ombor o'tishlari, brak qayta-bichish, bo'yoq buyurtmalari/repaint, ip yetishmasligi. Ombor nomlari o'zbekcha (`WAREHOUSE_LABELS` xaritasi, ProductInWarehouseAccept)

---

## 10. Deploy va lokal muhit

### Serverga chiqarish
```bash
# Frontend (GitHub, SSH kalit sozlangan):
git pull && npm run build

# Backend (GitLab, SSH):
git pull
docker compose exec php bin/console doctrine:migrations:migrate   # migratsiya bo'lsa
docker compose exec php bin/console cache:clear                    # HAR kod o'zgarishida
```
`docker compose down/up` KERAK EMAS (kod volume orqali ulangan); muammoda `docker compose restart php`.

### Lokal ishlab chiqish (macOS)
```bash
cd kids-club-api && docker compose up -d      # API: localhost:9090
cd Clothing-Factory-Automation && quasar dev  # UI: localhost:9000
```
Lokal-maxsus fayllar (git'ga kirmaydi): backend `.env.local` (DB host=mysql), `docker-compose.override.yml` (macOS katta-kichik harf muammosi uchun baza Docker ichki diskida); frontend `axios.js` baseURL vaqtincha localhost (commitdan oldin qaytarish!).

Lokal test userlar (parol hammasida `test1234`): +99890000000**1** admin/super, **2** tikuvchi, **3** master, **5** bichuvchi, **6** to'quvchi, **7** vishivkachi, **8** qadoqlovchi. Test model: TEST-MODEL-RBAC (#79), vishivka: TEST-EMB-RBAC (#52, 0.50).

### Cron (serverda)
`salary:create` va `attendance:create` avtomatik ishlaydi.

---

## 11. Ma'lum cheklovlar / kelajak ishlari

- [ ] Sozlamalar/materiallar YOZUVlariga rol cheklovi (hozir istalgan login yoza oladi) — 2-bosqich
- [ ] Bichuvchi mato oqimi (`/cutter/orders/materials`) alohida testlanmagan
- [ ] Admin uchun alohida cheklovlar (hozircha super bilan teng — ega aytganda kiritiladi)
- [ ] Statistikada oyma-oy trend grafigi; ombor qoldig'i mutlaq ko'rinishi
- [ ] Talab tabi hozircha davr-bo'yicha taxminiy; zakaz-bog'lamlardan aniq hisobga o'tkazish mumkin
- Eski mayda buglar: `/admin/weave` ostida uch child bir xil `path: 'orders'` (ikkitasi ochilmaydi); router guardidagi `ifAuthorized` doim truthy (rol tekshiruvi baribir ishlaydi)

---

## 12. Foydali fayl-ko'rsatkichlar

| Nima | Qayerda |
|---|---|
| Rol yordamchilari (isAdmin, isMaster...) | `src/router/routes.js` |
| Ombor IRI konstantalari, getStats, formatDuration | `src/libraries/constants/defaults.js` |
| Statistika komponentlari | `src/components/statistics/` |
| Yagona breakdown/timing komponentlari | `ModelStatsBreakdown.vue`, `TimingSummary.vue` |
| Transliteratsiya + harf birlashuvi | `src/libraries/transliterate.js`, backend `Component/Core/Transliterator.php` |
| API xatosini toast'da ko'rsatish | `apiErrorMessage` — `src/libraries/constants/defaults.js` |
| Ombor o'tishi qabul mantiqi (rol xaritasi, 8→9 qoida, ishbay maosh) | backend `Controller/ProductInWarehouseAction/ProductInWarehouseAccept.php` |
| To'quvchi maoshi | backend `Controller/CompletedUnripeMaterialOrder/AcceptanceAction.php` |
| Maosh yozish subscriber | backend `EventSubscriber/WorkEntriesSubscriber.php` + `Component/Salary/CreatorSalary.php` |
| Status-o'tish qoidalari | backend `Controller/UnripeMaterialOrder/UnripeMaterialOrderStatusAction.php`, `Controller/ProductModelOrder/ProductModelOrderStatusAction.php` |
| Oylik/ish yozuvlarini o'ziga cheklash | backend `ApiPlatform/Extension/OwnWorkerDataExtension.php` |
| Transliteratsiyali qidiruv filtri | backend `ApiPlatform/Filter/TransliteratedSearchFilter.php` |
