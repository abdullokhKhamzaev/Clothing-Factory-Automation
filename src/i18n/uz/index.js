export default {
  add: "Qo'shish",
  balance: 'Hisob',
  convert: 'Ayriboshlash',
  delete: "O'chirish",
  edit: "O'zgartirish",
  from: 'Dan',
  language: 'Til',
  materials: 'Materiallar',
  noData: "Ma'lumot bo'sh",
  to: 'Ga',
  threads: 'Iplar',
  thread: 'Ip',
  quantity: 'Miqdor',
  warehouse: 'Ombor',
  menu: {
    sideBar: {
      budget: 'Hisob',
      customers: 'Mijozlar',
      cutting: 'Bichuv',
      embroidery: 'Kashta Tikish',
      package: 'Qadoqlash',
      paint: "Bo'yoq",
      paintedMaterialWarehouse: "Bo'yalgan Material Ombor",
      productWarehouse: 'Maxsulot Ombor',
      settings: 'Sozlamalar',
      unripeMaterialWarehouse: "Hom Material Ombor",
      sewing: 'Tikuv',
      statistics: 'Statistika',
      threadWarehouse: 'Ip Ombor',
      users: 'Foydalanuvchilar',
      weaving: "To'quv"
    }
  },
  dialogs: {
    delete: {
      bar: 'Oʻchirishni tasdiqlang',
      info: 'Haqiqatan ham bu elementni oʻchirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.',
      buttons: {
        confirm: 'Tasdiqlash',
        cancel: 'Bekor qilish'
      }
    },
    thread: {
      barCreate: 'Ip yaratish',
      barEdit: 'Ipni O\'zgartirish',
    },
  },
  forms: {
    thread: {
      fields: {
        name: {
          label: 'Nom',
          validation: {
            required: 'Nom talab qilinadi.',
          }
        },
        measurement: {
          label: "O'lchov birlig",
          options: [
            {
              label: 'Image Side',
              value: 'imageSide'
            },
            {
              label: 'Page Content',
              value: 'pageContent'
            }
          ],
          validation: {
            required: 'O\'lchov birlig talab qilinadi.',
          }
        },
        quantity: {
          label: 'Miqdor',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        },
        buttons: {
          create: 'Ip Yaratish',
          edit: 'Ip O\'zgartirish'
        }
      },
      confirmation: {
        successCreated: 'Ip muvaffaqiyatli yaratildi.',
        successEdited: 'Ip muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Ip muvaffaqiyatli o\'chirildi.',
        failure: 'Ip saqlashda xatolik yuz berdi.'
      }
    }
  },
  tables: {
    thread: {
      header: {
        title: 'Ip turlari',
        empty: 'Hech qanday ip turi mavjud emas'
      }
    }
  }
}
