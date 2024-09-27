import {createRouter, createWebHistory} from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import {initializeKeycloak} from '../services/keycloak'
import Keycloak from "keycloak-js";
import Unauthorized from "../components/Unauthorized.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HelloWorld,
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: '/unauthorized',
            name: 'unauthorized',
            component: Unauthorized,
            meta: {
                requiresAuth: false,
            },
        }

    ],
})

router.beforeEach(async (to, _from, next) => {


    if (to.meta.requiresAuth) {
        const keycloak = await initializeKeycloak()
        if (isValidUser(keycloak)) {
            next();
            console.log('valid user')
            return;
        } else {
            console.log('unauthorized user')
            next('/unauthorized');
        }
    } else {
        console.log('open page')
        next();
    }
})

function isValidUser(keycloak: Keycloak) {
    return keycloak?.authenticated
        && keycloak.tokenParsed?.aud === 'fin-tbs-btf-5747'
        && keycloak.tokenParsed?.client_roles?.includes('fin-tbs-btf-admin');
}

export default router