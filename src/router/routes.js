function isAdmin() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_ADMIN')
  }
  return false
}

function isWeaver() {
  if (localStorage.getItem('accessToken')) {
    return JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).roles.includes('ROLE_WEAVER')
  }
  return false
}
const ifAuthorized = (to, from, next) => {
  if (localStorage.getItem('accessToken') !== null) {
    next('/aaa')
  } else {
    next('/login')
  }
}

const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    beforeEnter: !ifAuthorized
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    name: 'club.home',
    beforeEnter: ifAuthorized && isAdmin,
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
        component: () => import('pages/MaterialWarehousePage.vue')
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
    beforeEnter: ifAuthorized && isWeaver || isAdmin,
    children: [
      {
        path: 'orders',
        name: 'club.weaver.orders',
        component: () => import('pages/role-weaver/WeavePageRoleWeaver.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/NotFoundPage.vue')
  }
]

export default routes
