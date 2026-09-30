<script setup lang="ts">
import { onMounted, watch } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ProgressSpinner from 'primevue/progressspinner'
import { useAuth } from './composables/useAuth'
import { useTickets } from './composables/useTickets'
import { useConfirm } from 'primevue/useconfirm'
import AppHeader from './components/AppHeader.vue'
import TicketList from './components/TicketList.vue'

const { isAuthenticated, initializing, user, login, logout, initAuth } = useAuth()
const { refresh } = useTickets()
const confirm = useConfirm()

onMounted(() => {
  initAuth()
})

watch(isAuthenticated, (signedIn) => {
  if (signedIn) refresh()
}, { immediate: true })

// ConfirmDialog has no dismissableMask prop, so wire mask-click dismissal manually.
function closeConfirmOnMaskClick(event: MouseEvent) {
  if (event.target === event.currentTarget) confirm.close()
}
</script>

<template>
  <Toast />
  <ConfirmDialog :pt="{ mask: { onClick: closeConfirmOnMaskClick } }" />
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <div v-if="initializing" class="signin-screen" aria-live="polite" aria-busy="true">
    <ProgressSpinner aria-label="Loading" />
  </div>
  <template v-else>
    <AppHeader
      :authenticated="isAuthenticated"
      :user-label="user?.preferred_username ?? user?.name ?? user?.sub"
      @sign-in="login"
      @sign-out="logout"
    />
    <main id="main-content">
      <TicketList v-if="isAuthenticated" />
      <div v-else class="signed-out-message">
        <i class="pi pi-lock" aria-hidden="true" />
        <p>Sign in with your Corteza account to view and manage support tickets.</p>
      </div>
    </main>
  </template>
</template>

<style scoped>
main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 1.5rem;
}

.signed-out-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--p-text-muted-color);
  text-align: center;
}

.signed-out-message .pi-lock {
  font-size: 2rem;
}

@media (max-width: 768px) {
  main {
    padding: 0 0.5rem 2rem;
  }
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
