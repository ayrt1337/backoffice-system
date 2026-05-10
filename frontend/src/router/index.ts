import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { resetPageState } from '../services/pageResetState';
import { api } from '../services/api';
import { useUser } from '../composables/useUser';
import { verifyApiError } from '../services/verifyApiError';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/login.vue')
  },
  {
    path: '/users',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Users',
        component: () => import('../pages/users/users.vue')
      },
      {
        path: ':name',
        name: 'UsersView',
        props: true,
        component: () => import('../pages/users/users-view.vue')
      },
      {
        path: 'create',
        name: 'UsersCreate',
        component: () => import('../pages/users/users-create.vue')
      },
      {
        path: 'edit/:name',
        name: 'UsersEdit',
        props: true,
        component: () => import('../pages/users/users-edit.vue')
      }
    ]
  },
  {
    path: '/roles',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Roles',
        component: () => import('../pages/roles/roles.vue')
      },
      {
        path: 'create',
        name: 'RolesCreate',
        component: () => import('../pages/roles/roles-create.vue')
      },
      {
        path: 'edit/:name',
        name: 'RolesEdit',
        props: true,
        component: () => import('../pages/roles/roles-edit.vue')
      },
      {
        path: ':name',
        name: 'RolesView',
        props: true,
        component: () => import('../pages/roles/roles-view.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/notFound/notFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(() => {
  resetPageState();
  return;
});

const { setUser } = useUser();

router.afterEach(async (current, before) => {
  if (current.meta.requiresAuth && current.path !== before.path) {
    try {
      const response = await api({
        url: '/me',
        method: 'get'
      });
      
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Erro ao verificar usuário:', error);
      verifyApiError(error.response?.status);
    }
  }
});

export default router;
