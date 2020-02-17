import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import LoginForm from '../views/LoginForm.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    redirect: { name: 'user-list' },
    children: [
      {
        path: 'users/new',
        name: 'new-user',
        component: () => import('../views/User.vue'),
      },
      {
        path: 'users/:id',
        name: 'user-detail',
        component: () => import('../views/User.vue'),
      },
      {
        path: 'users',
        name: 'user-list',
        component: () => import('../views/UserList.vue'),
      },
      {
        path: 'customers/new',
        name: 'new-customer',
        component: () => import('../views/Customer.vue'),
      },
      {
        path: 'customers/:id',
        name: 'customer-detail',
        component: () => import('../views/Customer.vue'),
      },
      {
        path: 'customers',
        name: 'customer-list',
        component: () => import('../views/CustomerList.vue'),
      },
    ],
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: LoginForm,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
