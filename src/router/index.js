import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')

// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const Users = () => import(/* webpackChunkName: "users_rights_users" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_users" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_users" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
const Cate = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Params.vue')
const List = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "cate_params_list_add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes: routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
