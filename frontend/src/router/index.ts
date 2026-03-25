import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../pages/roles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/create',
    name: 'UsersCreate',
    component: () => import('../pages/user-create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles/create',
    name: 'RolesCreate',
    component: () => import('../pages/roles-create.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
