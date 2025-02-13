export function isAdmin() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_ADMIN');
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
    path: '/',
    component: () => import('pages/HomePage.vue'),
    beforeEnter: ifAuthorized
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    name: 'club.home',
    beforeEnter: ifAuthorized,
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
            component: () => import('pages/user/SalaryPage.vue')
          }
        ]
      },
      {
        path: 'weave',
        name: 'club.weave',
        component: () => import('pages/WeavePage.vue')
      },
      {
        path: 'paint',
        name: 'club.paint',
        component: () => import('pages/PaintPage.vue')
      },
      {
        path: 'cut',
        name: 'club.cut',
        component: () => import('pages/CutPage.vue')
      },
      {
        path: 'embroidery',
        name: 'club.embroidery',
        component: () => import('pages/EmbroideryPage.vue')
      },
      {
        path: 'sew',
        name: 'club.sew',
        component: () => import('pages/SewPage.vue')
      },
      {
        path: 'packing',
        name: 'club.packing',
        component: () => import('pages/PackingPage.vue')
      },
      {
        path: 'product-warehouse',
        name: 'club.productWarehouse',
        component: () => import('pages/ProductWarehousePage.vue')
      },
      {
        path: 'customers',
        name: 'club.customers',
        component: () => import('pages/CustomerPage.vue')
      },
      {
        path: 'sales',
        name: 'club.sales',
        component: () => import('pages/SalePage.vue')
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
    name: 'club.weaver.home',
    beforeEnter: ifAuthorized || isWeaver,
    children: [
      {
        path: 'orders',
        name: 'club.weaver.orders',
        component: () => import('pages/role-weaver/WeavePageRoleWeaver.vue')
      }
    ]
  },
  {
    path: '/cutter',
    component: () => import('layouts/cutter/MainLayout.vue'),
    name: 'club.cutter.home',
    beforeEnter: ifAuthorized || isCutter,
    children: [
      {
        path: 'orders',
        name: 'club.cutter.orders',
        component: () => import('pages/role-cutter/CutPageRoleCutter.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFoundPage.vue')
  }
]

export default routes
