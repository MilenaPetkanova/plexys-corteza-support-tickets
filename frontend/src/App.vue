<script setup lang="ts">
import { onMounted } from 'vue'
import Button from 'primevue/button'
import { useAuth } from './composables/useAuth'

const { isAuthenticated, user, login, logout, handleRedirectCallback, tryRestoreSession } = useAuth()

onMounted(async () => {
  const handledCode = await handleRedirectCallback()
  if (!handledCode) {
    await tryRestoreSession()
  }
})
</script>

<template>
  <main>
    <template v-if="isAuthenticated">
      <p>Signed in as {{ user?.preferred_username ?? user?.name ?? user?.sub }}</p>
      <Button label="Sign out" severity="secondary" @click="logout" />
    </template>
    <template v-else>
      <Button label="Sign in with Corteza" @click="login" />
    </template>
  </main>
</template>
