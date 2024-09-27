import {createRouter, createWebHistory} from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import {initializeKeycloak} from '../services/keycloak'
import Keycloak from "keycloak-js";

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
    ],
})

router.beforeEach(async (to, _from) => {


    if (to.meta.requiresAuth) {
        const keycloak = await initializeKeycloak()
        if (isValidUser(keycloak)) return true
    } else return false
})

function isValidUser(keycloak: Keycloak) {
    return keycloak?.authenticated
        && keycloak.tokenParsed?.aud === 'fin-tbs-btf-5747'
        && keycloak.tokenParsed?.client_roles?.includes('fin-tbs-btf-admin');
}

export default router