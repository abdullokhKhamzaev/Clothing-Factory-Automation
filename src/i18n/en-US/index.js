export default {
  add: 'Add',
  accept: 'Accept',
  balance: 'Balance',
  confirmed: 'Confirmed',
  completedOrders: 'Completed Orders',
  convert: 'Convert',
  columns: 'Columns',
  colors: 'Colors',
  confirm: 'Confirm',
  delete: 'Delete',
  debts: 'Debts',
  edit: 'Edit',
  finish: 'Finish',
  fabrics: "Fabrics",
  from: 'From',
  inProgress: 'In Progress',
  language: 'Language',
  materials: 'Materials',
  noData: 'The data is empty',
  orders: 'Orders',
  pending: 'Pending',
  reject: 'Reject',
  report: 'Report',
  pay: 'Pay',
  to: 'To',
  thread: 'Thread',
  threads: 'Threads',
  threadPurchase: 'Thread Purchase',
  transactions: 'Transactions',
  quantity: 'Quantity',
  warehouse: 'Warehouse',
  waiting: 'Waiting',
  waitingOrders: 'Waiting orders',
  statuses: {
    accepted: 'Accepted',
    notAccepted: 'Not Accepted',
    rejected: 'Rejected',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
  },
  menus: {
    sideBar: {
      budget: 'Budget',
      customers: 'Customers',
      cutting: 'Cutting',
      embroidery: 'Embroidery',
      package: 'Package',
      paint: 'Paint',
      paintedMaterialWarehouse: 'Painted Material Warehouse',
      productWarehouse: 'Product Warehouse',
      settings: 'Settings',
      unripeMaterialWarehouse: 'Unripe Material Warehouse',
      sewing: 'Sewing',
      statistics: 'Statistics',
      threadWarehouse: 'Thread Warehouse',
      users: 'Users',
      weaving: 'Weaving'
    },
    weaver: {
      orders: 'Orders'
    }
  },
  dialogs: {
    delete: {
      bar: 'Confirm Deletion',
      info: 'Are you sure you want to delete this item? This action cannot be undone.',
      buttons: {
        confirm: 'Confirm',
        cancel: 'Cancel'
      }
    },
    accept: {
      bar: 'Confirm Accept',
      info: 'Are you sure you want to accept? This action cannot be undone.',
      buttons: {
        accept: 'Accept',
        cancel: 'Cancel'
      }
    },
    complete: {
      bar: 'Complete order',
      info: 'Are you sure you want to complete order? This action cannot be undone.',
      buttons: {
        complete: 'Complete',
        cancel: 'Cancel'
      }
    },
    reject: {
      bar: 'Confirm Reject',
      info: 'Are you sure you want to reject? This action cannot be undone.',
      buttons: {
        reject: 'Reject',
        cancel: 'Cancel'
      }
    },
    user: {
      barCreate: 'Create User',
      barEdit: 'Edit User',
    },
    thread: {
      barCreate: 'Create Thread',
      barEdit: 'Edit Thread',
    },
    threadPurchase: {
      barCreate: 'Buy Thread',
      barPayDebt: 'Pay Thread Purchase Debt'
    },
    unripeMaterial: {
      barCreate: 'Create Unripe Material',
      barEdit: 'Edit Unripe Material',
    },
    unripeMaterialOrder: {
      barCreate: 'Create Unripe Material Order',
      barEdit: 'Edit Unripe Material Order',
    },
    ripeMaterial: {
      barCreate: 'Create Ripe Material',
      barEdit: 'Edit Ripe Material',
    },
    ripeMaterialPurchase: {
      barCreate: 'Buy Ripe Material',
      barPayDebt: 'Pay Ripe Material Purchase Debt'
    },
    paint: {
      barCreate: 'Create Paint Order',
      barEdit: 'Edit Paint Order',
    },
    completedMaterialOrderReport: {
      barCreate: 'Report About Order',
    },
    fabric: {
      barCreate: 'Create Paint Factory',
      barEdit: 'Edit Paint Factory',
    },
    color: {
      barCreate: 'Create Color',
      barEdit: 'Edit Color',
    },
  },
  forms: {
    user: {
      fields: {
        fullName: {
          label: 'Name & Surname',
          validation: {
            required: 'Name & Surname is required.',
          }
        },
        phone: {
          label: 'Phone',
          validation: {
            required: 'Phone is required.',
          }
        },
        password: {
          label: 'Password',
          validation: {
            required: 'Password is required.',
          }
        },
        currency: {
          label: 'Currency',
          validation: {
            required: 'Currency is required.',
          }
        },
        salary: {
          label: 'Salary',
          validation: {
            required: 'Salary is required.',
          }
        },
        roles: {
          label: 'Roles',
          validation: {
            required: 'Roles required',
          }
        },
      },
      buttons: {
        create: 'Create User',
        edit: 'Edit User'
      },
      confirmation: {
        successCreated: 'User was successfully created.',
        successEdited: 'User was successfully edited.',
        successDeleted: 'User was successfully deleted.',
        failure: 'There was an error saving user.'
      }
    },
    thread: {
      fields: {
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        },
        measurement: {
          label: 'Measurement',
          validation: {
            required: 'Measurement is required.',
          }
        },
        quantity: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        }
      },
      buttons: {
        create: 'Create Thread',
        edit: 'Edit Thread'
      },
      confirmation: {
        successCreated: 'Thread was successfully created.',
        successEdited: 'Thread was successfully edited.',
        successDeleted: 'Thread was successfully deleted.',
        failure: 'There was an error saving thread.'
      }
    },
    threadPurchase: {
      fields: {
        thread: {
          label: 'Thread Name',
          validation: {
            required: 'Thread Name is required.',
          }
        },
        budget: {
          label: 'From Which Budget?',
          validation: {
            required: 'Budget name is required.',
          }
        },
        price: {
          label: '1kg price?',
          validation: {
            required: 'Price is required.',
          }
        },
        quantity: {
          label: 'How many kg?',
          validation: {
            required: 'Quantity is required.',
          }
        },
        debtQuantity: {
          label: 'Payment quantity',
          validation: {
            required: 'Payment quantity is required.',
          }
        },
        paidPrice: {
          label: 'Paid Price',
          validation: {
            required: 'Paid Price',
          }
        },
      },
      buttons: {
        buy: 'Buy',
        payDebt: 'Pay'
      },
      confirmation: {
        successBought: 'Thread was successfully bought.',
        failure: 'There was an error buying thread.'
      }
    },
    unripeMaterial: {
      fields: {
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        },
        measurement: {
          label: 'Measurement',
          validation: {
            required: 'Measurement is required.',
          }
        },
        quantity: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        }
      },
      buttons: {
        create: 'Create Material',
        edit: 'Edit Material'
      },
      confirmation: {
        successCreated: 'Material was successfully created.',
        successEdited: 'Material was successfully edited.',
        successDeleted: 'Material was successfully deleted.',
        failure: 'There was an error saving material.'
      }
    },
    ripeMaterial: {
      fields: {
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        },
        color: {
          label: 'Color',
          validation: {
            required: 'Color is required.',
          }
        },
        measurement: {
          label: 'Measurement',
          validation: {
            required: 'Measurement is required.',
          }
        },
        quantity: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        },
        roll: {
          label: 'Roll',
          validation: {
            required: 'Roll is required.',
          }
        },
        quantitySort2: {
          label: 'Quantity Sort 2',
          validation: {
            required: 'Quantity is required.',
          }
        },
        rollSort2: {
          label: 'Roll Sort 2',
          validation: {
            required: 'Roll is required.',
          }
        },
        price: {
          label: 'Price',
          validation: {
            required: 'Price is required.',
          }
        },
        priceSort2: {
          label: 'Price Sort 2',
          validation: {
            required: 'Price is required.',
          }
        },
      },
      buttons: {
        create: 'Create',
        edit: 'Edit'
      },
      confirmation: {
        successCreated: 'Material was successfully created.',
        successEdited: 'Material was successfully edited.',
        successDeleted: 'Material was successfully deleted.',
        failure: 'There was an error saving material.'
      }
    },
    paint: {
      fields: {
        unripeMaterial: {
          label: 'Unripe material',
          validation: {
            required: 'Name is required.',
          }
        },
        paintFabric: {
          label: 'Choose fabric',
          validation: {
            required: 'Fabric is required.',
          }
        },
        sentQuantitySort1: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        },
        sentQuantitySort2: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        },
        sentRollSort1: {
          label: 'Roll',
          validation: {
            required: 'Roll is required.',
          }
        },
        sentRollSort2: {
          label: 'Roll',
          validation: {
            required: 'Roll is required.',
          }
        },
        dealDate: {
          label: 'Deal Date',
          validation: {
            required: 'Date is required.',
          }
        },
      },
      buttons: {
        order: 'Create Order',
        edit: 'Edit'
      },
      confirmation: {
        successOrderCreated: 'Order was successfully created.',
        successOrderEdited: 'Order was successfully edited.',
        successOrderDeleted: 'Order was successfully deleted.',
        failure: 'There was an error saving Order.'
      }
    },
    ripeMaterialPurchase: {
      fields: {
        ripeMaterial: {
          label: 'Ripe material name',
          validation: {
            required: 'name is required.',
          }
        },
        budget: {
          label: 'From Which Budget?',
          validation: {
            required: 'Budget name is required.',
          }
        },
        price: {
          label: '1kg price?',
          validation: {
            required: 'Price is required.',
          }
        },
        priceSort2: {
          label: '1kg price sort 2?',
          validation: {
            required: 'Price is required.',
          }
        },
        roll: {
          label: 'How many roll?',
          validation: {
            required: 'Roll is required.',
          }
        },
        quantity: {
          label: 'How many kg?',
          validation: {
            required: 'Quantity is required.',
          }
        },
        quantitySort2: {
          label: 'How many sort-2 kg?',
          validation: {
            required: 'Quantity is required.',
          }
        },
        rollSort2: {
          label: 'How many sort-2 roll?',
          validation: {
            required: 'Roll is required.',
          }
        },
        debtQuantity: {
          label: 'Payment quantity',
          validation: {
            required: 'Payment quantity is required.',
          }
        },
        paidPrice: {
          label: 'Paid Price',
          validation: {
            required: 'Paid Price',
          }
        },
      },
      buttons: {
        buy: 'Buy',
        payDebt: 'Pay'
      },
      confirmation: {
        successBought: 'Ripe Material was successfully bought.',
        failure: 'There was an error buying Ripe Material.'
      }
    },
    unripeMaterialOrder: {
      fields: {
        quantity: {
          label: 'Quantity',
          validation: {
            required: 'Quantity is required.',
          }
        },
        material: {
          label: 'Material',
          validation: {
            required: 'Material is required.',
          }
        },
        expectedConsumeDtos: {
          title: 'Expected consumes:',
          thread: {
            label: 'Thread Type',
            validation: {
              required: 'Thread Type is required.',
            }
          },
          quantity: {
            label: 'Quantity',
            validation: {
              required: 'Quantity is required.',
            }
          }
        }
      },
      buttons: {
        create: 'Create Order',
        edit: 'Edit Order'
      },
      confirmation: {
        successCreated: 'Unripe material order was successfully created.',
        successCompleted: 'Unripe material order was successfully completed.',
        successDeleted: 'Unripe material order was successfully deleted.',
        failure: 'There was an error saving Unripe material order.'
      }
    },
    completedMaterialOrderReport: {
      fields: {
        sort: {
          label: 'Which sort?',
          validation: {
            required: 'Sort is required.',
          }
        },
        roll: {
          label: 'How many rolls?',
          validation: {
            required: 'Roll is required.',
          }
        },
        quantity: {
          label: 'How many kg of {name} ready?',
          validation: {
            required: 'Quantity is required.',
          }
        },
        consumedDtos: {
          title: 'Used consumes:',
          thread: {
            label: 'Thread Type',
            validation: {
              required: 'Thread Type is required.',
            }
          },
          quantity: {
            label: 'Quantity',
            validation: {
              required: 'Quantity is required.',
            }
          }
        },
      },
      buttons: {
        create: 'Report'
      },
      confirmation: {
        successCreated: 'Report was successfully created.',
        successAccepted: 'Successfully accepted.',
        successRejected: 'Successfully rejected.',
        failure: 'There was an error saving Report.'
      }
    },
    fabric: {
      fields: {
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        },
        address: {
          label: 'Address',
          validation: {
            required: 'Address is required.',
          }
        }
      },
      buttons: {
        create: 'Create Paint Factory',
        edit: 'Edit Paint Factory'
      },
      confirmation: {
        successCreated: 'Paint Factory was successfully created.',
        successEdited: 'Paint Factory was successfully edited.',
        successDeleted: 'Paint Factory was successfully deleted.',
        failure: 'There was an error saving paint factory.'
      }
    },
    color: {
      fields: {
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        }
      },
      buttons: {
        create: 'Create Color',
        edit: 'Edit Color'
      },
      confirmation: {
        successCreated: 'Color was successfully created.',
        successEdited: 'Color was successfully edited.',
        successDeleted: 'Color was successfully deleted.',
        failure: 'There was an error saving paint color.'
      }
    },
  },
  tables: {
    users: {
      header: {
        title: 'Users',
        searchTitle: 'Search by name',
        empty: 'There is no available user'
      },
      columns: {
        fullName: 'Name & Surname',
        phone: 'Phone',
        salary: 'Salary',
        currency: 'Currency',
        role: 'Role'
      },
      buttons: {
        add: 'Add User'
      },
    },
    thread: {
      header: {
        title: 'Thread',
        empty: 'There is no available thread'
      },
      columns: {
        name: 'Name',
        quantity: 'Quantity',
        price: 'Price',
      },
      buttons: {
        add: 'Add Thread'
      },
    },
    threadPurchase: {
      header: {
        title: 'Thread Purchase',
        empty: 'There is no available Thread Purchase'
      },
      columns: {
        id: 'Purchase ID',
        createdAt: 'Created At',
        thread: 'Thread',
        quantity: 'Quantity',
        price: 'Price',
        paidPrice: 'Paid Price',
        purchasedBy: 'Purchased By',
        transaction: 'Description',
      },
      buttons: {
        add: 'Add Thread'
      },
    },
    transaction: {
      header: {
        title: 'Transactions',
        empty: 'There is no available transaction'
      },
      columns: {
        id: 'ID',
        createdAt: 'Date',
        paidPrice: 'Paid Price',
        createdBy: 'Created By',
        description: 'Reason',
        budget: 'Budget',
        price: 'Price'
      },
      buttons: {
        add: 'Add Thread'
      },
    },
    unripeMaterial: {
      header: {
        title: 'Unripe Materials',
        empty: 'There is no available Unripe Materials'
      },
      columns: {
        name: 'Name',
        quantity: 'Quantity',
        roll: 'Roll',
        quantitySort2: 'Quantity sort 2',
        rollSort2: 'Roll sort 2',
        price: 'Price',
        payWorker: 'Worker price'
      },
      buttons: {
        add: 'Add Material'
      },
    },
    ripeMaterial: {
      header: {
        title: 'Ripe Materials',
        empty: 'There is no available Ripe Materials'
      },
      columns: {
        name: 'Name',
        paintFabricColor: 'Color',
        quantity: 'Quantity',
        roll: 'Roll',
        quantitySort2: 'Quantity sort 2',
        rollSort2: 'Roll sort 2',
        price: 'Price',
        priceSort2: 'Price sort 2'
      },
      buttons: {
        add: 'Add'
      }
    },
    paint: {
      header: {
        title: 'Paint Orders',
        empty: 'There is no available Paint Orders'
      },
      columns: {
        sentQuantitySort1: 'Quantity sort 1',
        sentRollSort1: 'Roll sort 1',
        sentQuantitySort2: 'Quantity sort 2',
        sentRollSort2: 'Roll sort 2',
        status: 'Status',
        createdBy: 'Created By',
        receivedBy: 'Received By',
        paintFabric: 'Fabric',
        createdAt: 'Created At',
        receivedAt: 'Received At',
        dealDate: 'Deal Date',
        unripeMaterial: 'Unripe Material',
        ripeMaterialOrderAccepteds: 'Description'
      },
      buttons: {
        add: 'Add Order'
      }
    },
    unripeMaterialOrder: {
      header: {
        title: 'Unripe Material Order',
        empty: 'There is no available order'
      },
      columns: {
        id: 'Order ID',
        material: 'Material Name',
        quantity: 'Quantity',
        completedQuantity: 'Completed Quantity',
        completedRoll: 'Roll',
        completedQuantitySort2: 'Quantity Sort2',
        completedRollSort2: 'Roll Sort2',
        expectedConsume: 'Expected Consume',
        completedUnripeMaterialOrders: 'Description',
        consumed: 'Consumed',
        createdAt: 'Created At',
        createdBy: 'Created By',
        status: 'Status',
      },
      buttons: {
        add: 'Add Order',
        complete: 'Complete'
      },
    },
    completedUnripeMaterialOrder: {
      header: {
        title: 'Completed Unripe Material',
        empty: 'There is no available order'
      },
      columns: {
        id: 'Order id',
        material: 'Material name',
        quantity: 'Quantity',
        confirmedBy: 'Confirmed by',
        completedQuantity: 'Completed quantity',
        completedQuantitySort2: 'Completed quantity sort2',
        quantitySort2: 'Quantity sort2',
        roll: 'Roll',
        completedRoll: 'Completed roll',
        completedRollSort2: 'Completed roll sort2',
        rollSort2: 'Roll sort2',
        expectedConsume: 'Expected consume',
        consumed: 'Consumed',
        createdBy: 'Created by',
        createdAt: 'Created at',
        status: 'Status',
        completedUnripeMaterialOrders: 'Description',
      }
    },
    fabric: {
      header: {
        title: 'Paint Factories',
        empty: 'There is no available paint factory'
      },
      columns: {
        name: 'Name',
        address: 'Address',
      },
      buttons: {
        add: 'Add Factory'
      },
    },
    color: {
      header: {
        title: 'Colors',
        empty: 'There is no available color'
      },
      columns: {
        name: 'Name'
      },
      buttons: {
        add: 'Add Color'
      },
    }
  }
}
