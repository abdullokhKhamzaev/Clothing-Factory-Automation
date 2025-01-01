export default {
  add: "Qo'shish",
  balance: 'Hisob',
  convert: 'Ayriboshlash',
  columns: 'Ustunlar',
  colors: 'Ranglar',
  delete: "O'chirish",
  edit: "O'zgartirish",
  fabrics: "Fabrikalar",
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
      barEdit: 'Ip O\'zgartirish',
    },
    threadPurchase: {
      barCreate: 'Ip Sotib Olish',
    },
    material: {
      barCreate: 'Material Yaratish',
      barEdit: 'Material O\'zgartirish',
    },
    fabric: {
      barCreate: 'Bo\'yoq Fabrika Yaratish',
      barEdit: 'Bo\'yoq Fabrika O\'zgartirish',
    },
    color: {
      barCreate: 'Rang Yaratish',
      barEdit: 'Rang O\'zgartirish',
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
          validation: {
            required: 'O\'lchov birlig talab qilinadi.',
          }
        },
        quantity: {
          label: 'Miqdor',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        }
      },
      buttons: {
        create: 'Ip Yaratish',
        edit: 'Ip O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Ip muvaffaqiyatli yaratildi.',
        successEdited: 'Ip muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Ip muvaffaqiyatli o\'chirildi.',
        failure: 'Ip saqlashda xatolik yuz berdi.'
      }
    },
    threadPurchase: {
      fields: {
        thread: {
          label: 'Ip Nom',
          validation: {
            required: 'Ipning Nomi talab qilinadi.',
          }
        },
        budget: {
          label: 'Qaysi hisobdan?',
          validation: {
            required: 'Hisob nomi talab qilinadi.',
          }
        },
        price: {
          label: '1 KG Narxi?',
          validation: {
            required: 'Narx talab qilinadi.',
          }
        },
        quantity: {
          label: 'Necha kg?',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        },
        paidPrice: {
          label: 'To\'langan Miqdor',
          validation: {
            required: 'To\'langan Miqdor talab qilinadi.',
          }
        }
      },
      buttons: {
        buy: 'Sotib olish',
      },
      confirmation: {
        successBought: 'Ip muvaffaqiyatli sotib olindi.',
        failure: 'Ip sotib olishda xatolik yuz berdi.'
      }
    },
    material: {
      fields: {
        name: {
          label: 'Nom',
          validation: {
            required: 'Nom talab qilinadi.',
          }
        },
        measurement: {
          label: "O'lchov birlig",
          validation: {
            required: 'O\'lchov birlig talab qilinadi.',
          }
        },
        quantity: {
          label: 'Miqdor',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        }
      },
      buttons: {
        create: 'Material Yaratish',
        edit: 'Material O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Material muvaffaqiyatli yaratildi.',
        successEdited: 'Material muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Material muvaffaqiyatli o\'chirildi.',
        failure: 'Material saqlashda xatolik yuz berdi.'
      }
    },
    fabric: {
      fields: {
        name: {
          label: 'Nom',
          validation: {
            required: 'Nom talab qilinadi.',
          }
        },
        address: {
          label: 'Manzil',
          validation: {
            required: 'Manzil talab qilinadi.',
          }
        }
      },
      buttons: {
        create: 'Bo\'yoq Fabrika Yaratish',
        edit: 'Bo\'yoq Fabrika O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Bo\'yoq Fabrika muvaffaqiyatli yaratildi.',
        successEdited: 'Bo\'yoq Fabrika muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Bo\'yoq Fabrika muvaffaqiyatli o\'chirildi.',
        failure: 'Bo\'yoq Fabrika saqlashda xatolik yuz berdi.'
      }
    },
    color: {
      fields: {
        name: {
          label: 'Nom',
          validation: {
            required: 'Nom talab qilinadi.',
          }
        }
      },
      buttons: {
        create: 'Rang Yaratish',
        edit: 'Rang O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Rang muvaffaqiyatli yaratildi.',
        successEdited: 'Rang muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Rang muvaffaqiyatli o\'chirildi.',
        failure: 'Rang saqlashda xatolik yuz berdi.'
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
        title: 'Iplar',
        empty: 'Hech qanday ip turi mavjud emas'
      },
      columns: {
        name: 'Nomi',
        quantity: 'Miqdor',
      },
      buttons: {
        add: 'Ip Qo\'shish'
      },
    },
    material: {
      header: {
        title: 'Materiallar',
        empty: 'Hech qanday material turi mavjud emas'
      },
      columns: {
        name: 'Nomi',
        quantity: 'Miqdor',
      },
      buttons: {
        add: 'Material Qo\'shish'
      },
    },
    fabric: {
      header: {
        title: 'Bo\'yoq Fabrikalar',
        empty: 'Hech qanday bo\'yoq fabrika mavjud emas'
      },
      columns: {
        name: 'Nomi',
        address: 'Manzil',
      },
      buttons: {
        add: 'Fabrika Qo\'shish'
      },
    },
    color: {
      header: {
        title: 'Ranglar',
        empty: 'Hech qanday rang mavjud emas'
      },
      columns: {
        name: 'Nomi'
      },
      buttons: {
        add: 'Rang Qo\'shish'
      },
    }
  }
}
