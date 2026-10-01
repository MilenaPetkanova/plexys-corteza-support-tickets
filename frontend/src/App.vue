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
  <div class="app-shell">
    <Transition name="fade" mode="out-in">
      <div v-if="initializing" key="initializing" class="centered-fill" aria-live="polite" aria-busy="true">
        <ProgressSpinner aria-label="Loading" />
      </div>
      <div v-else key="app" class="app-shell-content">
        <AppHeader
          :authenticated="isAuthenticated"
          :user-label="user?.preferred_username ?? user?.name ?? user?.sub"
          @sign-in="login"
          @sign-out="logout"
        />
        <main id="main-content" class="app-main">
          <Transition name="fade" mode="out-in">
            <TicketList v-if="isAuthenticated" key="tickets" />
            <div v-else key="signed-out" class="signed-out-message centered-fill">
              <i class="pi pi-lock" aria-hidden="true" />
              <p>Sign in with your Corteza account to view and manage support tickets.</p>
            </div>
          </Transition>
        </main>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-shell-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem 1.5rem;
}

.centered-fill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signed-out-message {
  flex-direction: column;
  gap: 0.75rem;
  color: var(--p-text-muted-color);
  text-align: center;
}

.signed-out-message .pi-lock {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .app-main {
    padding: 0 0.5rem 2rem;
  }
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
