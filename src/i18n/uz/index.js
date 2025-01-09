export default {
  add: "Qo'shish",
  accept: 'Qabul qilish',
  balance: 'Hisob',
  confirmed: 'Tasdiqlangan',
  completedOrders: 'Yakunlangan Zakazlar',
  convert: 'Ayriboshlash',
  columns: 'Ustunlar',
  colors: 'Ranglar',
  confirm: 'Tasdiqlash',
  delete: "O'chirish",
  debts: 'Qarzlar',
  edit: "O'zgartirish",
  finish: 'Yakunlash',
  fabrics: "Fabrikalar",
  from: 'Dan',
  inProgress: 'Jarayonda',
  language: 'Til',
  materials: 'Materiallar',
  noData: "Ma'lumot bo'sh",
  orders: 'Zakazlar',
  pending: 'Kutilmoqda',
  reject: 'Raq etish',
  report: 'Hisobot',
  pay: 'To\'lash',
  to: 'Ga',
  threads: 'Iplar',
  thread: 'Ip',
  threadPurchase: 'Ip savdosi',
  transactions: 'Tranzaksiyalar',
  quantity: 'Miqdor',
  warehouse: 'Ombor',
  waiting: 'Kutilmoqda',
  waitingOrders: 'Kutilayotgan zakazlar',
  statuses: {
    accepted: 'Qabul qilingan',
    notAccepted: 'Qabul qilinmagan',
    rejected: 'Rad etilgan',
    confirmed: 'Tasdiqlangan',
    pending: 'Kutilmoqda',
    completed: 'Tugatilgan',
  },
  menus: {
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
    },
    weaver: {
      orders: 'Zakazlar'
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
    accept: {
      bar: 'Qabul qilishni tasdiqlang',
      info: 'Haqiqatan ham qabul qilmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.',
      buttons: {
        accept: 'Qabul qilish',
        cancel: 'Bekor qilish'
      }
    },
    complete: {
      bar: 'Zakazni yakunlash',
      info: 'Haqiqatan ham zakazni yakunlamoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.',
      buttons: {
        complete: 'Yakunlash',
        cancel: 'Bekor qilish'
      }
    },
    reject: {
      bar: 'Rad etishni tasdiqlang',
      info: 'Haqiqatan ham rad etmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.',
      buttons: {
        reject: 'Rad etish',
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
      barPayDebt: 'Ip Savdo Bo\'yicha Qarz To\'lash'
    },
    unripeMaterial: {
      barCreate: 'Hom Material Yaratish',
      barEdit: 'Hom Material O\'zgartirish',
    },
    unripeMaterialOrder: {
      barCreate: 'Hom Material Zakaz Yaratish',
      barEdit: 'Hom Material Zakaz O\'zgartirish',
    },
    ripeMaterial: {
      barCreate: 'Bo\'yalgan Material Yaratish',
      barEdit: 'Bo\'yalgan Material O\'zgartirish',
    },
    completedMaterialOrderReport: {
      barCreate: 'Zakaz Haqida Hisobot Berish',
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
        fullName: {
          label: 'Ism & Familya',
          validation: {
            required: 'Ism & Familya talab qilinadi.',
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
        roles: {
          label: 'Huquqlar',
          validation: {
            required: 'Huquqlar talab qilinadi.',
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
        debtQuantity: {
          label: 'To\'lov miqdor',
          validation: {
            required: 'To\'lov miqdor talab qilinadi.',
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
        payDebt: 'To\'lash'
      },
      confirmation: {
        successBought: 'Ip muvaffaqiyatli sotib olindi.',
        failure: 'Ip sotib olishda xatolik yuz berdi.'
      }
    },
    unripeMaterial: {
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
    ripeMaterial: {
      fields: {
        name: {
          label: 'Nom',
          validation: {
            required: 'Nom talab qilinadi.',
          }
        },
        color: {
          label: 'Rang',
          validation: {
            required: 'Rang talab qilinadi.',
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
        },
        roll: {
          label: 'Ro\'lon',
          validation: {
            required: 'Ro\'lon talab qilinadi.',
          }
        },
        quantitySort2: {
          label: 'Miqdor Sort 2',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        },
        rollSort2: {
          label: 'Ro\'lon Sort 2',
          validation: {
            required: 'Ro\'lon talab qilinadi.',
          }
        },
        price: {
          label: 'Narx',
          validation: {
            required: 'Narx talab qilinadi.',
          }
        },
        priceSort2: {
          label: 'Narx Sort 2',
          validation: {
            required: 'Narx talab qilinadi.',
          }
        }
      },
      buttons: {
        create: 'Yaratish',
        edit: 'O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Material muvaffaqiyatli yaratildi.',
        successEdited: 'Material muvaffaqiyatli o\'zgartirildi.',
        successDeleted: 'Material muvaffaqiyatli o\'chirildi.',
        failure: 'Material saqlashda xatolik yuz berdi.'
      }
    },
    unripeMaterialOrder: {
      fields: {
        quantity: {
          label: 'Miqdor',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        },
        material: {
          label: 'Material',
          validation: {
            required: 'Material talab qilinadi.',
          }
        },
        expectedConsumeDtos: {
          title: 'Kutilayotgan masalliq:',
          thread: {
            label: 'Ip Turi',
            validation: {
              required: 'Ip turi talab qilinadi.',
            }
          },
          quantity: {
            label: 'Miqdor',
            validation: {
              required: 'Miqdor talab qilinadi.',
            }
          }
        }
      },
      buttons: {
        create: 'Zakaz Yaratish',
        edit: 'Zakaz O\'zgartirish'
      },
      confirmation: {
        successCreated: 'Zakaz muvaffaqiyatli yaratildi.',
        successCompleted: 'Zakaz muvaffaqiyatli yakunlandi.',
        successDeleted: 'Zakaz muvaffaqiyatli o\'chirildi.',
        failure: 'Zakaz saqlashda xatolik yuz berdi.'
      }
    },
    completedMaterialOrderReport: {
      fields: {
        sort: {
          label: 'Nechinchi sort?',
          validation: {
            required: 'Sort talab qilinadi.',
          }
        },
        roll: {
          label: 'Necha ro\'lon?',
          validation: {
            required: 'Ro\'lon talab qilinadi.',
          }
        },
        quantity: {
          label: 'Necha kg {name} tayyor?',
          validation: {
            required: 'Miqdor talab qilinadi.',
          }
        },
        consumedDtos: {
          title: 'Ishlatilgan masalliqlar:',
          thread: {
            label: 'Ip turi',
            validation: {
              required: 'Ip turi talab qilinadi.',
            }
          },
          quantity: {
            label: 'Miqdor',
            validation: {
              required: 'Miqdor talab qilinadi.',
            }
          }
        },
      },
      buttons: {
        create: 'Xabar berish'
      },
      confirmation: {
        successCreated: 'Hisobot muvaffaqiyatli yaratildi.',
        successAccepted: 'Muvaffaqiyatli qabul qilindi.',
        successRejected: 'Muvaffaqiyatli rad etildi.',
        failure: 'Hisobot saqlashda xatolik yuz berdi.'
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
        fullName: 'Ism & Familya',
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
        price: 'Narx',
      },
      buttons: {
        add: 'Ip Qo\'shish'
      },
    },
    threadPurchase: {
      header: {
        title: 'Ip Savdosi',
        empty: 'Hech qanday Ip Savdosi mavjud emas'
      },
      columns: {
        id: 'Savdo ID',
        createdAt: 'Sana',
        thread: 'Ip',
        quantity: 'Miqdor',
        price: 'Narx',
        paidPrice: 'To\'landi',
        purchasedBy: 'Kim',
        transaction: 'Tasnif',
      },
      buttons: {
        add: 'Ip Qo\'shish'
      },
    },
    transaction: {
      header: {
        title: 'Tranzaksiyalar',
        empty: 'Hech qanday tranzaksiya mavjud emas'
      },
      columns: {
        id: 'ID',
        createdAt: 'Sana',
        paidPrice: 'To\'langan suma',
        createdBy: 'Kim',
        description: 'Sabab',
        budget: 'Hisob',
        price: 'Narx'
      },
      buttons: {
        add: 'Ip Qo\'shish'
      },
    },
    unripeMaterial: {
      header: {
        title: 'Hom Materiallar',
        empty: 'Hech qanday Hom Material mavjud emas'
      },
      columns: {
        name: 'Nomi',
        quantity: 'Miqdor',
        roll: 'Ro\'lon',
        quantitySort2: 'Miqdor sort 2',
        rollSort2: 'Ro\'lon sort 2',
        price: 'Narx',
        payWorker: 'Ishchi narx'
      },
      buttons: {
        add: 'Material Qo\'shish'
      },
    },
    ripeMaterial: {
      header: {
        title: 'Bo\'yalgan Materiallar',
        empty: 'Hech qanday Bo\'yalgan Material mavjud emas'
      },
      columns: {
        name: 'Nom',
        paintFabricColor: 'Rang',
        quantity: 'Miqdor',
        roll: 'Ro\'lon',
        quantitySort2: 'Miqdor sort 2',
        rollSort2: 'Ro\'lon sort 2',
        price: 'Narx',
        priceSort2: 'Price sort 2'
      },
      buttons: {
        add: 'Qp\'shish'
      }
    },
    unripeMaterialOrder: {
      header: {
        title: 'Hom Material Zakaz',
        empty: 'Hech qanday zakaz mavjud emas'
      },
      columns: {
        id: 'Zakaz ID',
        material: 'Material Nomi',
        quantity: 'Miqdor',
        completedRoll: 'Ro\'lon',
        completedQuantity: 'Tugatilgan Miqdor',
        completedQuantitySort2: 'Miqdor Sort2',
        completedRollSort2: 'Ro\'lon Sort2',
        expectedConsume: 'Kutilgan Rasxod',
        completedUnripeMaterialOrders: 'Tavsif',
        consumed: 'Ishlatildi',
        createdAt: 'Yaratilgan Vaqt',
        createdBy: 'Tomonidan yaratildi',
        status: 'Holat',
      },
      buttons: {
        add: 'Zakaz Qo\'shish',
        complete: 'Yakunlash'
      },
    },
    completedUnripeMaterialOrder: {
      header: {
        title: 'Tugatilgan Hom Material',
        empty: 'Hech qanday zakaz mavjud emas'
      },
      columns: {
        id: 'Zakaz id',
        material: 'Material nomi',
        quantity: 'Miqdor',
        confirmedBy: 'Tomonidan tasdiqlangan',
        completedQuantity: 'Tugatilgan miqdor',
        completedQuantitySort2: 'Tugatilgan sort-2 miqdor',
        quantitySort2: 'Miqdor sort-2',
        roll: 'Ro\'lon',
        completedRoll: 'Tugatilgan ro\'lon',
        completedRollSort2: 'Tugatilgan ro\'lon sort-2',
        rollSort2: 'Ro\'lon sort-2',
        expectedConsume: 'Kutilgan rasxod',
        consumed: 'Ishlatildi',
        createdBy: 'Yaratdi',
        createdAt: 'Yaratilgan sana',
        status: 'Holat',
        completedUnripeMaterialOrders: 'Tasnif',
      }
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
