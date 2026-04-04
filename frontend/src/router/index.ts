import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/login.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/users/users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../pages/roles/roles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/create',
    name: 'UsersCreate',
    component: () => import('../pages/users/user-create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles/create',
    name: 'RolesCreate',
    component: () => import('../pages/roles/roles-create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles/:name',
    name: 'RolesView',
    props: true,
    component: () => import('../pages/roles/roles-view.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
