<script setup lang="ts">
import { onMounted, watch } from 'vue'
import Button from 'primevue/button'
import { useAuth } from './composables/useAuth'
import { useTickets } from './composables/useTickets'
import AppHeader from './components/AppHeader.vue'
import TicketList from './components/TicketList.vue'

const { isAuthenticated, user, login, logout, handleRedirectCallback, tryRestoreSession } = useAuth()
const { refresh } = useTickets()

onMounted(async () => {
  const handledCode = await handleRedirectCallback()
  if (!handledCode) {
    await tryRestoreSession()
  }
})

watch(isAuthenticated, (signedIn) => {
  if (signedIn) refresh()
}, { immediate: true })
</script>

<template>
  <template v-if="isAuthenticated">
    <AppHeader :user-label="user?.preferred_username ?? user?.name ?? user?.sub" @sign-out="logout" />
    <main>
      <TicketList />
    </main>
  </template>
  <main v-else class="signin-screen">
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
</style>
