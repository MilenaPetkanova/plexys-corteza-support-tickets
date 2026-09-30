<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

defineProps<{
  authenticated: boolean
  userLabel?: string
}>()

defineEmits<{
  (e: 'sign-in'): void
  (e: 'sign-out'): void
}>()
</script>

<template>
  <Toolbar class="app-header">
    <template #start>
      <span class="app-title">Plexys Homework</span>
      <span class="app-subtitle">Support Tickets</span>
    </template>
    <template #end>
      <div v-if="authenticated" class="app-user">
        <Avatar :label="userLabel?.[0]?.toUpperCase()" shape="circle" />
        <span class="app-user-label">{{ userLabel }}</span>
        <Button label="Sign out" icon="pi pi-sign-out" severity="secondary" text @click="$emit('sign-out')" />
      </div>
      <Button v-else label="Sign in with Corteza" icon="pi pi-sign-in" @click="$emit('sign-in')" />
    </template>
  </Toolbar>
</template>

<style scoped>
.app-header {
  border-radius: 0;
  border-inline: none;
  border-top: none;
  margin-bottom: 1.5rem;
}

.app-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.app-subtitle {
  margin-left: 0.5rem;
  color: var(--p-text-muted-color);
}

.app-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-user-label {
  font-weight: 500;
}

@media (max-width: 640px) {
  .app-subtitle {
    display: none;
  }
  .app-user-label {
    display: none;
  }
}
</style>
