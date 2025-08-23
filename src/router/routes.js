export function isAdmin() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_ADMIN');
  }
  return false;
}

export function isSuperAdmin() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_SUPER_ADMIN');
  }
  return false;
}

export function isWeaver() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_WEAVER');
  }
  return false;
}

export function isCutter() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_CUTTER');
  }
  return false;
}

export function isEmbroiderer() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_EMBROIDERER');
  }
  return false;
}

export function isSewer() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_SEWER');
  }
  return false;
}

export function isPackager() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_PACKAGER');
  }
  return false;
}

export function isMaster() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_MASTER');
  }
  return false;
}

const ifAuthorized = (to, from, next) => {
  if (localStorage.getItem('accessToken') !== null) {
    next()
  } else {
    next('/login')
  }
}

const ifNotAuthorized = (to, from, next) => {
  if (localStorage.getItem('accessToken') === null) {
    next()
  } else {
    next('/')
  }
}

const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    beforeEnter: ifNotAuthorized
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isAdmin()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: 'users',
        component: () => import('pages/UsersPage.vue'),
        children: [
          {
            path: 'employees',
            name: 'club.users.employees',
            component: () => import('pages/user/WorkersPage.vue')
          },
          {
            path: 'attendance',
            name: 'club.users.attendance',
            component: () => import('pages/user/AttendancePage.vue')
          },
          {
            path: 'salary',
            name: 'club.users.salary',
            component: () => import('pages/user/SalariesPage.vue')
          },
          {
            path: 'salaries/:id',
            name: 'club.user.salary',
            component: () => import('pages/user/SalaryPage.vue'),
          }
        ]
      },
      {
        path: 'weave',
        component: () => import('pages/WeavePage.vue'),
        children: [
          {
            path: 'orders',
            name: 'club.weave.orders',
            component: () => import('pages/weave/OrdersPage.vue')
          },
          {
            path: 'orders',
            name: 'club.weave.pending',
            component: () => import('pages/weave/PendingOrdersPage.vue')
          },
          {
            path: 'orders',
            name: 'club.weave.completed',
            component: () => import('pages/weave/CompletedOrdersPage.vue')
          }
        ]
      },
      {
        path: 'paint',
        component: () => import('pages/PaintPage.vue'),
        children: [
          {
            path: 'orders',
            name: 'club.paint.orders',
            component: () => import('pages/paint/OrdersPage.vue')
          },
          {
            path: 'repaint-orders',
            name: 'club.paint.repaintOrders',
            component: () => import('pages/paint/RepaintOrdersPage.vue')
          },
          {
            path: 'completed',
            name: 'club.paint.completedOrders',
            component: () => import('pages/paint/CompletedOrdersPage.vue')
          },
          {
            path: 'completed-repaint-orders',
            name: 'club.paint.completedRepaintOrders',
            component: () => import('pages/paint/CompletedRepaintOrdersPage.vue')
          }
        ]
      },
      {
        path: 'cut',
        component: () => import('pages/CutPage.vue'),
        children: [
          {
            path: 'orders',
            name: 'club.cut.orders',
            component: () => import('pages/cut/OrdersPage.vue')
          },
          {
            path: 'pending',
            name: 'club.cut.pending',
            component: () => import('pages/cut/PendingOrdersPage.vue')
          },
          {
            path: 'completed-orders',
            name: 'club.cut.completedOrders',
            component: () => import('pages/cut/CompletedOrdersPage.vue')
          },
          {
            path: 'materials',
            name: 'club.cut.materials',
            component: () => import('pages/cut/MaterialsPage.vue')
          },
          {
            path: 'warehouse',
            name: 'club.cut.warehouse',
            component: () => import('pages/cut/WarehousePage.vue')
          },
          {
            path: 'defects',
            name: 'club.cut.defects',
            component: () => import('pages/cut/DefectsPage.vue')
          },
        ]
      },
      {
        path: 'embroidery',
        component: () => import('pages/EmbroideryPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.embroidery.warehouse',
            component: () => import('pages/embroidery/WarehousePage.vue')
          },
          {
            path: 'ready',
            name: 'club.embroidery.ready',
            component: () => import('pages/embroidery/ReadyPage.vue')
          },
        ]
      },
      {
        path: 'sew',
        component: () => import('pages/SewPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.sew.warehouse',
            component: () => import('pages/sew/WarehousePage.vue')
          }
        ]
      },
      {
        path: 'packing',
        name: 'club.packing',
        component: () => import('pages/PackingPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.package.warehouse',
            component: () => import('pages/package/WarehousePage.vue')
          },
          {
            path: 'ready',
            name: 'club.package.ready',
            component: () => import('pages/package/ReadyPage.vue')
          },
        ]
      },
      {
        path: 'product-warehouse',
        name: 'club.productWarehouse',
        component: () => import('pages/ProductWarehousePage.vue')
      },
      {
        path: 'customers',
        name: 'club.customers',
        component: () => import('pages/customer/CustomersPage.vue'),
      },
      {
        path: 'customers/:id',
        name: 'club.customer',
        component: () => import('pages/customer/CustomerPage.vue'),
      },
      {
        path: 'sales',
        name: 'club.sales',
        component: () => import('pages/SalePage.vue')
      },
      {
        path: 'orders',
        name: 'club.orders',
        component: () => import('pages/OrderPage.vue')
      },
      {
        path: 'warehouse',
        component: () => import('pages/WarehousePage.vue'),
        children: [
          {
            path: 'accessory',
            name: 'club.warehouse.accessory',
            component: () => import('pages/warehouse/AccessoryPage.vue')
          },
          {
            path: 'thread',
            name: 'club.warehouse.thread',
            component: () => import('pages/warehouse/ThreadPage.vue')
          },
          {
            path: 'unripe-material',
            name: 'club.warehouse.unripeMaterial',
            component: () => import('pages/warehouse/UnripeMaterialPage.vue')
          },
          {
            path: 'ripe-material',
            name: 'club.warehouse.ripeMaterial',
            component: () => import('pages/warehouse/RipeMaterialPage.vue')
          }
        ]
      },
      {
        path: 'statistic',
        name: 'club.statistic',
        component: () => import('pages/StatisticPage.vue')
      },
      {
        path: 'budget',
        component: () => import('pages/BudgetPage.vue'),
        children: [
          {
            path: 'transactions',
            name: 'club.budget.transactions',
            component: () => import('pages/budget/TransactionPage.vue')
          },
          {
            path: 'sale',
            name: 'club.budget.sale',
            component: () => import('pages/budget/SalePage.vue')
          },
          {
            path: 'thread',
            name: 'club.budget.thread',
            component: () => import('pages/budget/ThreadPage.vue')
          },
          {
            path: 'ripe-material',
            name: 'club.budget.ripeMaterial',
            component: () => import('pages/budget/RipeMaterialPage.vue')
          },
          {
            path: 'paint',
            name: 'club.budget.paint',
            component: () => import('pages/budget/PaintPage.vue')
          },
          {
            path: 'accessory',
            name: 'club.budget.accessory',
            component: () => import('pages/budget/AccessoryPage.vue')
          },
          {
            path: 'indebtedness',
            name: 'club.budget.indebtedness',
            component: () => import('pages/budget/IndebtednessPage.vue')
          },
          {
            path: 'exchange',
            name: 'club.budget.exchange',
            component: () => import('pages/budget/ExchangePage.vue')
          },
        ]
      },
      {
        path: 'setting',
        component: () => import('pages/SettingPage.vue'),
        children: [
          {
            path: 'thread',
            name: 'club.setting.thread',
            component: () => import('pages/setting/ThreadPage.vue')
          },
          {
            path: 'unripe-material',
            name: 'club.setting.unripeMaterial',
            component: () => import('pages/setting/UnripeMaterialPage.vue')
          },
          {
            path: 'ripe-material',
            name: 'club.setting.ripeMaterial',
            component: () => import('pages/setting/RipeMaterialPage.vue')
          },
          {
            path: 'paint-factory',
            name: 'club.setting.paintFactory',
            component: () => import('pages/setting/PaintFactoryPage.vue')
          },
          {
            path: 'color',
            name: 'club.setting.color',
            component: () => import('pages/setting/ColorPage.vue')
          },
          {
            path: 'model',
            name: 'club.setting.model',
            component: () => import('pages/setting/ModelPage.vue')
          },
          {
            path: 'accessory',
            name: 'club.setting.accessory',
            component: () => import('pages/setting/AccessoryPage.vue')
          },
          {
            path: 'embroidery',
            name: 'club.setting.embroidery',
            component: () => import('pages/setting/EmbroideryPage.vue')
          },
        ]
      }
    ]
  },
  {
    path: '/weaver',
    component: () => import('layouts/weaver/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isWeaver()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: 'orders',
        component: () => import('pages/role-weaver/IndexPage.vue'),
        children: [
          {
            path: 'pending',
            name: 'club.weaver.orders',
            component: () => import('pages/role-weaver/OrdersPage.vue'),
          },
          {
            path: 'completed',
            name: 'club.weaver.completed',
            component: () => import('pages/role-weaver/CompletedOrdersPage.vue'),
          },
        ]
      },
    ]
  },
  {
    path: '/cutter',
    component: () => import('layouts/cutter/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isCutter()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: 'orders',
        component: () => import('pages/role-cutter/IndexPage.vue'),
        children: [
          {
            path: 'pending',
            name: 'club.cutter.orders',
            component: () => import('pages/role-cutter/OrdersPage.vue'),
          },
          {
            path: 'completed',
            name: 'club.cutter.completedOrders',
            component: () => import('pages/role-cutter/CompletedOrdersPage.vue'),
          },
          {
            path: 'materials',
            name: 'club.cutter.materials',
            component: () => import('pages/role-cutter/MaterialsPage.vue'),
          },
          {
            path: 'warehouse',
            name: 'club.cutter.warehouse',
            component: () => import('pages/role-cutter/WarehousePage.vue'),
          },
          {
            path: 'defects',
            name: 'club.cutter.defects',
            component: () => import('pages/role-cutter/DefectsPage.vue'),
          },
        ]
      }
    ]
  },
  {
    path: '/embroiderer',
    component: () => import('layouts/embroiderer/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isEmbroiderer()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: '',
        component: () => import('pages/role-embroiderer/IndexPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.embroiderer.warehouse',
            component: () => import('pages/role-embroiderer/WarehousePage.vue'),
          },
          {
            path: 'ready',
            name: 'club.embroiderer.ready',
            component: () => import('pages/role-embroiderer/ReadyWarehousePage.vue'),
          },
          {
            path: 'salary',
            name: 'club.embroiderer.salary',
            component: () => import('pages/user/SalaryPage.vue'),
          },
        ]
      }
    ]
  },
  {
    path: '/sewer',
    component: () => import('layouts/sewer/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isSewer()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: '',
        component: () => import('pages/role-sewer/IndexPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.sewer.warehouse',
            component: () => import('pages/role-sewer/WarehousePage.vue'),
          },
          {
            path: 'salary',
            name: 'club.sewer.salary',
            component: () => import('pages/user/SalaryPage.vue'),
          },
        ]
      }
    ]
  },
  {
    path: '/packager',
    component: () => import('layouts/packager/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isPackager()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: '',
        component: () => import('pages/role-packager/IndexPage.vue'),
        children: [
          {
            path: 'warehouse',
            name: 'club.packager.warehouse',
            component: () => import('pages/role-packager/WarehousePage.vue'),
          },
          {
            path: 'salary',
            name: 'club.packager.salary',
            component: () => import('pages/user/SalaryPage.vue'),
          },
        ]
      }
    ]
  },
  {
    path: '/master',
    component: () => import('layouts/master/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      if ((ifAuthorized && isMaster()) || isSuperAdmin()) {
        next();
      } else {
        next('/login');
      }
    },
    children: [
      {
        path: '',
        component: () => import('pages/role-master/IndexPage.vue'),
        children: [
          {
            path: 'embroidery/ready',
            name: 'club.master.embroidery.ready',
            component: () => import('pages/role-master/EmbroideryReadyWarehousePage.vue'),
          },
          {
            path: 'sewing/ready',
            name: 'club.master.sewing.ready',
            component: () => import('pages/role-master/SewerReadyWarehouse.vue'),
          },
          {
            path: 'packaging/ready',
            name: 'club.master.packaging.ready',
            component: () => import('pages/role-master/PackagerReadyPage.vue'),
          },
        ]
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFoundPage.vue')
  }
]

export default routes
