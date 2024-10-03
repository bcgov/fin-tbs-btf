import Keycloak from "keycloak-js";

const loginOptions = {
  redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI,
  idpHint: "",
};

export const keycloak = new Keycloak({
  url: `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}`,
  realm: `${import.meta.env.VITE_SSO_REALM}`,
  clientId: `${import.meta.env.VITE_SSO_CLIENT_ID}`,
});

export const getKeycloak = async (): Promise<Keycloak | undefined> => {
  if (isInitialized()) {
    return keycloak;
  }
  return initializeKeycloak();
};

const isInitialized = (): boolean => {
  return keycloak?.authenticated == true;
};

export const initializeKeycloak = async (): Promise<Keycloak | undefined> => {
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

    const auth = await keycloak.init({
      pkceMethod: "S256",
      checkLoginIframe: false,
      onLoad: "check-sso",
    });

    if (auth) {
      return keycloak;
    } else {
      await keycloak.login(loginOptions);
    }
  } catch (err) {
    console.error(err);
  }
};

// since we have to perform logout at siteminder, we cannot use keycloak-js logout method so manually triggering logout through a function
// if using post_logout_redirect_uri, then either client_id or id_token_hint has to be included and post_logout_redirect_uri need to match
// one of valid post logout redirect uris in the client configuration
export const logout = () => {
  window.location.href = `https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(
    `${import.meta.env.VITE_SSO_AUTH_SERVER_URL}/realms/${
      import.meta.env.VITE_SSO_REALM
    }/protocol/openid-connect/logout?post_logout_redirect_uri=` +
      import.meta.env.VITE_SSO_REDIRECT_URI +
      "&client_id=" +
      import.meta.env.VITE_SSO_CLIENT_ID
  )}`;
};
