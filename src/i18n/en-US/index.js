export default {
  add: 'Add',
  accept: 'Accept',
  balance: 'Balance',
  confirmed: 'Confirmed',
  convert: 'Convert',
  columns: 'Columns',
  colors: 'Colors',
  confirm: 'Confirm',
  delete: 'Delete',
  edit: 'Edit',
  fabrics: "Fabrics",
  from: 'From',
  inProgress: 'In Progress',
  language: 'Language',
  materials: 'Materials',
  noData: 'The data is empty',
  notAccepted: 'Not Accepted',
  orders: 'Orders',
  pending: 'Pending',
  reject: 'Reject',
  report: 'Report',
  to: 'To',
  thread: 'Thread',
  threads: 'Threads',
  quantity: 'Quantity',
  warehouse: 'Warehouse',
  waiting: 'Waiting',
  waitingOrders: 'Waiting orders',
  menu: {
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
      barCreate: 'Buy Thread'
    },
    material: {
      barCreate: 'Create Material',
      barEdit: 'Edit Material',
    },
    unripeMaterialOrder: {
      barCreate: 'Create Unripe Material Order',
      barEdit: 'Edit Unripe Material Order',
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
        name: {
          label: 'Name',
          validation: {
            required: 'Name is required.',
          }
        },
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
        paidPrice: {
          label: 'Paid Price',
          validation: {
            required: 'Paid Price',
          }
        },
      },
      buttons: {
        buy: 'Buy',
      },
      confirmation: {
        successBought: 'Thread was successfully bought.',
        failure: 'There was an error buying thread.'
      }
    },
    material: {
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
        create: 'Create Order'
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
    material: {
      header: {
        title: 'Material',
        empty: 'There is no available material'
      },
      columns: {
        name: 'Name',
        quantity: 'Quantity',
      },
      buttons: {
        add: 'Add Material'
      },
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
        material: 'Material Name',
        quantity: 'Quantity',
        quantitySort2: 'Quantity Sort-2',
        roll: 'Roll',
        rollSort2: 'Roll Sort-2',
        consumed: 'Consumed',
        status: 'Status',
        receivedBy: 'Received By',
        confirmedBy: 'Confirmed By',
        createdAt: 'Created At'
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
