# fin-tbs-btf
Treasury Board Budget Transfer Process Form Solution
User's Browser:
Initiates a request to access the Vue.js application hosted on GitHub Pages.

GitHub Pages Server:
Serves the static HTML, CSS, and JavaScript files of the Vue.js application to the browser.
Vue.js Application:

Renders the initial user interface in the browser.
If authentication is required, it redirects the user to the Keycloak server.

Keycloak Server:
Handles user authentication and authorization.
Presents a login form to the user.
After successful login, issues an access token to the user.
GitHub Pages Server (with Keycloak Integration):

The Vue.js application includes code to intercept requests and send the access token to Keycloak for validation.
If the token is valid, Keycloak allows access to protected resources.
Vue.js Application (with Keycloak Integration):

Uses the access token to fetch additional data from protected APIs (if necessary).
Renders the full user interface, including dynamic content based on the authenticated user's information.
