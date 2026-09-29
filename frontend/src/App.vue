<script setup lang="ts">
import { onMounted } from 'vue'
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
      <button type="button" @click="logout">Sign out</button>
    </template>
    <template v-else>
      <button type="button" @click="login">Sign in with Corteza</button>
    </template>
  </main>
</template>
