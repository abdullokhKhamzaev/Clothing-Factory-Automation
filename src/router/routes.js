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
        name: 'club.users',
        component: () => import('pages/UsersPage.vue')
      },
      {
        path: 'thread',
        name: 'club.thread',
        component: () => import('pages/ThreadPage.vue')
      },
      {
        path: 'weave',
        name: 'club.weave',
        component: () => import('pages/WeavePage.vue')
      },
      {
        path: 'unripe-material-warehouse',
        name: 'club.unripeMaterialWarehouse',
        component: () => import('pages/UnripeMaterialWarehousePage.vue')
      },
      {
        path: 'paint',
        name: 'club.paint',
        component: () => import('pages/PaintPage.vue')
      },
      {
        path: 'material-warehouse',
        name: 'club.material-warehouse',
        component: () => import('pages/RipeMaterialWarehousePage.vue')
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
        path: 'clients',
        name: 'club.clients',
        component: () => import('pages/ClientsPage.vue')
      },
      {
        path: 'statistic',
        name: 'club.statistic',
        component: () => import('pages/StatisticPage.vue')
      },
      {
        path: 'budget',
        name: 'club.budget',
        component: () => import('pages/BudgetPage.vue')
      },
      {
        path: 'setting',
        name: 'club.setting',
        component: () => import('pages/SettingPage.vue')
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
