<script setup lang="ts">
import { onMounted, watch } from 'vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ProgressSpinner from 'primevue/progressspinner'
import { useAuth } from './composables/useAuth'
import { useTickets } from './composables/useTickets'
import AppHeader from './components/AppHeader.vue'
import TicketList from './components/TicketList.vue'

const { isAuthenticated, initializing, user, login, logout, initAuth } = useAuth()
const { refresh } = useTickets()

onMounted(() => {
  initAuth()
})

watch(isAuthenticated, (signedIn) => {
  if (signedIn) refresh()
}, { immediate: true })
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div v-if="initializing" class="signin-screen" aria-live="polite" aria-busy="true">
    <ProgressSpinner aria-label="Loading" />
  </div>
  <template v-else-if="isAuthenticated">
    <AppHeader :user-label="user?.preferred_username ?? user?.name ?? user?.sub" @sign-out="logout" />
    <main id="main-content">
      <TicketList />
    </main>
  </template>
  <main v-else id="main-content" class="signin-screen">
    <Button label="Sign in with Corteza" @click="login" />
  </main>
</template>

<style scoped>
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 1.5rem;
}

.signin-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 1000;
  padding: 0.75rem 1rem;
  background: var(--p-primary-color, #6366f1);
  color: var(--p-primary-contrast-color, #fff);
  border-radius: 0 0 6px 0;
}

.skip-link:focus {
  left: 0;
}
</style>
