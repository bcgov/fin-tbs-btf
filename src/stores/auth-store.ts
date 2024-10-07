import Keycloak from "keycloak-js";
import { defineStore } from "pinia";
import { ref } from "vue";
import router from "../routes";

const loginOptions = {
  redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI,
  idpHint: "",
};

export const useAuthStore = defineStore("authStore", () => {
  const keycloak = new Keycloak({
    url: `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}`,
    realm: `${import.meta.env.VITE_SSO_REALM}`,
    clientId: `${import.meta.env.VITE_SSO_CLIENT_ID}`,
  });

  const isAuthenticated = ref<boolean>(false);
  const isAuthorized = ref<boolean>(false);
  const user = ref<any>(undefined);

  const init = async (
    forceLoginIfNotAuthenticated: boolean = false
  ): Promise<Keycloak | undefined> => {
    if (keycloak?.authenticated) {
      return keycloak;
    }

    try {
      keycloak.onTokenExpired = () => {
        keycloak
          .updateToken()
          .then(function (refreshed) {
            if (refreshed) {
              console.log("Token was successfully refreshed");
            }
          })
          .catch(function () {
            console.error(
              "Failed to refresh the token, or the session has expired"
            );
            logout();
          });
      };

      const isKeycloakAdapterInitialized =
        keycloak?.authenticated === true || keycloak?.authenticated === false;

      if (!isKeycloakAdapterInitialized) {
        await keycloak.init({
          pkceMethod: "S256",
          checkLoginIframe: false,
          onLoad: forceLoginIfNotAuthenticated ? "login-required" : "check-sso",
        });
      }

      if (!keycloak?.authenticated && forceLoginIfNotAuthenticated) {
        await keycloak.login(loginOptions);
      }
      checkAuth();
      return keycloak;
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    keycloak.logout({ redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI });
  };

  const checkAuth = () => {
    const newIsAuthenticated = keycloak?.authenticated == true;
    const newUser = keycloak?.tokenParsed;
    const newIsAuthorized =
      keycloak?.authenticated &&
      keycloak?.tokenParsed?.aud === "fin-tbs-btf-5747" &&
      keycloak?.tokenParsed?.client_roles?.includes("fin-tbs-btf-admin");

    const changed =
      isAuthenticated.value != newIsAuthenticated ||
      isAuthorized.value != newIsAuthorized ||
      user.value?.idir_username != newUser?.idir_username;

    isAuthenticated.value = newIsAuthenticated;
    user.value = newUser;
    isAuthorized.value = newIsAuthorized;

    if (changed) {
      onAuthChanged();
    }
  };

  const onAuthChanged = () => {
    if (isAuthenticated.value && !isAuthorized.value) {
      router.push("unauthorized");
    }
  };

  // Return the public interface for the store
  return {
    user,
    isAuthenticated,
    isAuthorized,
    init,
    logout,
  };
});
