import { createRouter, createWebHistory } from "vue-router";
import DashboardPage from "../components/DashboardPage.vue";
import Unauthorized from "../components/Unauthorized.vue";
import UploadPage from "../components/UploadPage.vue";
import { useAuthStore } from "../stores/auth-store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "dashboard",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardPage,
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
      component: Unauthorized,
      meta: {
        requiresAuth: false,
      },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  await authStore.init(to.meta.requiresAuth as boolean);
  if (to.meta.requiresAuth) {
    if (authStore.isAuthorized) {
      next();
      return;
    } else {
      next("/unauthorized");
    }
  } else {
    console.log("open page");
    next();
  }
});

/*
function isValidUser(keycloak: Keycloak | undefined) {
  return (
    keycloak?.authenticated &&
    keycloak?.tokenParsed?.aud === "fin-tbs-btf-5747" &&
    keycloak?.tokenParsed?.client_roles?.includes("fin-tbs-btf-admin")
  );
}
*/

export default router;
