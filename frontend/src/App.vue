<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import { useAuth } from './composables/useAuth'
import { listTickets, type ComposeRecord } from './services/compose'

const { isAuthenticated, user, login, logout, handleRedirectCallback, tryRestoreSession } = useAuth()

const tickets = ref<ComposeRecord[]>([])
const ticketsError = ref<string | null>(null)

async function loadTickets() {
  ticketsError.value = null
  try {
    tickets.value = await listTickets()
  } catch (err) {
    ticketsError.value = err instanceof Error ? err.message : String(err)
  }
}

onMounted(async () => {
  const handledCode = await handleRedirectCallback()
  if (!handledCode) {
    await tryRestoreSession()
  }
})

// temporary: proves the Compose API wiring before the real DataTable UI
watch(isAuthenticated, (signedIn) => {
  if (signedIn) loadTickets()
}, { immediate: true })
</script>

<template>
  <main>
    <template v-if="isAuthenticated">
      <p>Signed in as {{ user?.preferred_username ?? user?.name ?? user?.sub }}</p>
      <Button label="Sign out" severity="secondary" @click="logout" />

      <p v-if="ticketsError" role="alert">Error loading tickets: {{ ticketsError }}</p>
      <pre v-else>{{ tickets }}</pre>
    </template>
    <template v-else>
      <Button label="Sign in with Corteza" @click="login" />
    </template>
  </main>
</template>
