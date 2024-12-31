export default {
  add: 'Add',
  balance: 'Balance',
  convert: 'Convert',
  columns: 'Columns',
  delete: 'Delete',
  edit: 'Edit',
  fabrics: "Fabrics",
  from: 'From',
  language: 'Language',
  materials: 'Materials',
  noData: 'The data is empty',
  to: 'To',
  thread: 'Thread',
  threads: 'Threads',
  quantity: 'Quantity',
  warehouse: 'Warehouse',
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
    user: {
      barCreate: 'Create User',
      barEdit: 'Edit User',
    },
    thread: {
      barCreate: 'Create Thread',
      barEdit: 'Edit Thread',
    },
    material: {
      barCreate: 'Create Material',
      barEdit: 'Edit Material',
    },
    fabric: {
      barCreate: 'Create Paint Factory',
      barEdit: 'Edit Paint Factory',
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
        surname: {
          label: 'Surname',
          validation: {
            required: 'Surname is required.',
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
  },
  tables: {
    users: {
      header: {
        title: 'Users',
        searchTitle: 'Search by name',
        empty: 'There is no available user'
      },
      columns: {
        name: 'Name',
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
        title: 'Thread types',
        empty: 'There is no available thread'
      },
      columns: {
        name: 'Name',
        quantity: 'Quantity',
      },
      buttons: {
        add: 'Add Thread'
      },
    },
    material: {
      header: {
        title: 'Material types',
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
    }
  }
}
