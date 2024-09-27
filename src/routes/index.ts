import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import { initializeKeycloak } from '../services/keycloak'

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
    if (keycloak?.authenticated) return true
  } else return false
})

export default router