export default {
  add: "Qo'shish",
  balance: 'Hisob',
  convert: 'Ayriboshlash',
  columns: 'Ustunlar',
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
    user: {
      barCreate: 'Foydalanuvchi Yaratish',
      barEdit: 'Foydalanuvchini O\'zgartirish',
    },
    thread: {
      barCreate: 'Ip Yaratish',
      barEdit: 'Ipni O\'zgartirish',
    },
  },
  forms: {
    user: {
      fields: {
        name: {
          label: 'Ism',
          validation: {
            required: 'Ism talab qilinadi.',
          }
        },
        surname: {
          label: 'Familya',
          validation: {
            required: 'Familya talab qilinadi.',
          }
        },
        phone: {
          label: 'Telefon',
          validation: {
            required: 'Telefon talab qilinadi.',
          }
        },
        password: {
          label: 'Parol',
          validation: {
            required: 'Parol talab qilinadi.',
          }
        },
        currency: {
          label: 'Valyuta',
          validation: {
            required: 'Valyuta talab qilinadi.',
          }
        },
        salary: {
          label: 'Oylik',
          validation: {
            required: 'Oylik talab qilinadi.',
          }
        },
      },
      buttons: {
        create: 'Foydalanuvchi yaratish',
        edit: 'Foydalanuvchi o\'zgartirish'
      },
      confirmation: {
        successCreated: 'Foydalanuvchi muvaffaqiyatli yaratildi.',
        successEdited: 'Foydalanuvchi muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Foydalanuvchi muvaffaqiyatli o\'chirildi.',
        failure: 'Foydalanuvchi saqlashda xatolik yuz berdi.'
      }
    },
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
    users: {
      header: {
        title: 'Foydalanuvchilar',
        searchTitle: 'Ism orqali qidirish',
        empty: 'Hech qanday foydalanuvchi mavjud emas'
      },
      columns: {
        name: 'Ism',
        phone: 'Telefon',
        salary: 'Oylik',
        currency: 'Valyuta',
        role: 'Huquq'
      },
      buttons: {
        add: 'Qo\'shish'
      },
    },
    thread: {
      header: {
        title: 'Ip turlari',
        empty: 'Hech qanday ip turi mavjud emas'
      },
      buttons: {
        add: 'Ip Qo\'shish'
      },
    }
  }
}
