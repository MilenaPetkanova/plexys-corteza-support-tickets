import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: { preset: Aura },
  license: import.meta.env.VITE_PRIMEVUE_LICENSE_KEY as string,
})

app.mount('#app')
