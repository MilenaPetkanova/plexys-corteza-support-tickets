<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useTickets } from '../composables/useTickets'
import { fieldValue, statusSeverity, prioritySeverity, formatDate } from '../utils/ticket'

const { tickets, loading, error, refresh } = useTickets()

const viewOptions = [
  { label: 'Cards', value: 'cards', icon: 'pi pi-th-large' },
  { label: 'Table', value: 'table', icon: 'pi pi-table' },
]
const view = ref<'cards' | 'table'>('cards')
</script>

<template>
  <section aria-labelledby="tickets-heading">
    <header class="tickets-header">
      <h1 id="tickets-heading">Support Tickets</h1>
      <div class="tickets-actions">
        <SelectButton
          v-model="view"
          :options="viewOptions"
          option-label="label"
          option-value="value"
          aria-label="Ticket view"
        >
          <template #option="{ option }">
            <i :class="option.icon" aria-hidden="true" />
            <span>{{ option.label }}</span>
          </template>
        </SelectButton>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="refresh"
        />
      </div>
    </header>

    <p v-if="error" role="alert" class="tickets-error">{{ error }}</p>

    <div v-else-if="loading && tickets.length === 0" class="tickets-loading">
      <ProgressSpinner aria-label="Loading tickets" />
    </div>

    <p v-else-if="tickets.length === 0">No support tickets yet.</p>

    <ul v-else-if="view === 'cards'" class="tickets-grid" aria-label="Support tickets">
      <li v-for="ticket in tickets" :key="ticket.recordID">
        <Card class="ticket-card">
          <template #title>
            <span class="ticket-subject">{{ fieldValue(ticket, 'Subject') }}</span>
          </template>
          <template #content>
            <div class="ticket-tags">
              <Tag :value="fieldValue(ticket, 'Status')" :severity="statusSeverity(fieldValue(ticket, 'Status'))" />
              <Tag :value="fieldValue(ticket, 'Priority')" :severity="prioritySeverity(fieldValue(ticket, 'Priority'))" />
            </div>
            <p class="ticket-description">{{ fieldValue(ticket, 'Description') || 'No description' }}</p>
            <dl class="ticket-meta">
              <div v-if="fieldValue(ticket, 'DueDate')">
                <dt>Due</dt>
                <dd>{{ formatDate(fieldValue(ticket, 'DueDate')) }}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{{ formatDate(ticket.createdAt) }}</dd>
              </div>
            </dl>
          </template>
        </Card>
      </li>
    </ul>

    <div v-else class="table-scroll">
      <DataTable :value="tickets" data-key="recordID" striped-rows>
        <Column header="Subject">
          <template #body="{ data }">{{ fieldValue(data, 'Subject') }}</template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="fieldValue(data, 'Status')" :severity="statusSeverity(fieldValue(data, 'Status'))" />
          </template>
        </Column>
        <Column header="Priority">
          <template #body="{ data }">
            <Tag :value="fieldValue(data, 'Priority')" :severity="prioritySeverity(fieldValue(data, 'Priority'))" />
          </template>
        </Column>
        <Column header="Due date">
          <template #body="{ data }">{{ formatDate(fieldValue(data, 'DueDate')) ?? '—' }}</template>
        </Column>
        <Column header="Created">
          <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>

<style scoped>
.tickets-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.tickets-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.tickets-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tickets-actions :deep(.p-selectbutton .p-togglebutton) {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tickets-error {
  color: var(--p-red-500, #dc2626);
}

.tickets-loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.ticket-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--p-content-border-color, #e5e7eb);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.ticket-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.ticket-subject {
  font-size: 1.05rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.ticket-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ticket-description {
  margin: 0 0 1rem;
  color: var(--p-text-muted-color);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  min-height: 3.9em;
}

.ticket-meta {
  display: flex;
  gap: 1.5rem;
  margin: auto 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--p-content-border-color, #e5e7eb);
}

.ticket-meta dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--p-text-muted-color);
  margin: 0;
}

.ticket-meta dd {
  margin: 0;
  font-size: 0.9rem;
}

.table-scroll {
  overflow-x: auto;
}
</style>
