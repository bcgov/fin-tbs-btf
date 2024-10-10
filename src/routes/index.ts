import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../components/LoginPage.vue";
import UnauthorizedPage from "../components/UnauthorizedPage.vue";
import UploadPage from "../components/UploadPage.vue";
import { useAuthStore } from "../stores/auth-store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "upload",
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: "/upload",
      name: "upload",
      component: UploadPage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/unauthorized",
      name: "unauthorized",
      component: UnauthorizedPage,
      meta: {
        requiresAuth: false,
      },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  await authStore.init();
  if (to.meta.requiresAuth) {
    if (authStore.isAuthorized) {
      next();
      return;
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
