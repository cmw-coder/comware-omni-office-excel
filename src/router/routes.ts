import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'root',
    path: '/',
    redirect: '/taskpane',
  },
  {
    name: 'taskpane',
    path: '/taskpane',
    component: () => import('layouts/TaskpaneLayout.vue'),
    children: [
      {
        name: 'taskpane-root',
        path: '',
        redirect: '/taskpane/dashboard',
      },
      {
        name: 'taskpane-dashboard',
        path: 'dashboard',
        components: {
          header: () => import('layouts/headers/TaskpaneHeader.vue'),
          default: () => import('pages/taskpane/DashboardPage.vue'),
        },
      },
      {
        name: 'taskpane-settings',
        path: 'settings',
        components: {
          header: () => import('layouts/headers/TaskpaneHeader.vue'),
          default: () => import('pages/taskpane/SettingsPage.vue'),
        },
      },
    ],
  },

  // Always leave this as the last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
