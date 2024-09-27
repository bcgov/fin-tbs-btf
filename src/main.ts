import { createApp } from 'vue'
import './style.css'
import router from './routes'
import App from './App.vue'

export const app = createApp(App)

app.use(router)

app.mount('#app')
