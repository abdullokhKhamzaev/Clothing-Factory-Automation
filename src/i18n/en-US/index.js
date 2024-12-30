export default {
  add: 'Add',
  balance: 'Balance',
  convert: 'Convert',
  delete: 'Delete',
  edit: 'Edit',
  from: 'from',
  language: 'Language',
  materials: 'Materials',
  noData: 'The data is empty',
  to: 'to',
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
    thread: {
      barCreate: 'Create Thread',
      barEdit: 'Edit Thread',
    },
  },
  forms: {
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
    }
  },
  tables: {
    thread: {
      header: {
        title: 'Thread types',
        empty: 'There is no available thread'
      },
      buttons: {
        add: 'Add Thread'
      },
    }
  }
}
