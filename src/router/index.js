import Vue from "vue";
import VueRouter from "vue-router";
import Meetings from "../views/Meetings.vue";
import MeetingRoom from "../views/MeetingRoom.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Logout from "../views/Logout.vue";
import PageNotFound from "../views/404.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "meetings",
    component: Meetings,
    meta: {
      requiresLogin: true
    }
  },
  {
    path: "/room/:roomId",
    name: "room/",
    component: MeetingRoom,
    meta: {
      requiresLogin: true
    }
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/register",
    name: "register",
    component: Register
  },
  {
    path: "/logout",
    name: "logout",
    component: Logout,
    meta: {
      requiresLogin: true
    }
  },
  { 
    path: "*", 
    component: PageNotFound 
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
