<script setup lang="ts">
import { computed, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import ProgressSpinner from 'primevue/progressspinner'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useTickets } from '../composables/useTickets'
import {
  fieldValue,
  statusSeverity,
  prioritySeverity,
  statusIcon,
  priorityIcon,
  formatDate,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '../utils/ticket'
import type { ComposeRecord } from '../services/compose'
import TicketFormDialog from './TicketFormDialog.vue'

const { tickets, loading, error, refresh, remove } = useTickets()
const confirm = useConfirm()
const toast = useToast()

const viewOptions = [
  { label: 'Table', value: 'table', icon: 'pi pi-table' },
  { label: 'Cards', value: 'cards', icon: 'pi pi-th-large' },
]
// Table suits wide screens; narrow/mobile viewports default to the card layout.
const isMobile = window.matchMedia('(max-width: 768px)').matches
const view = ref<'cards' | 'table'>(isMobile ? 'cards' : 'table')

// Flattened view of tickets for the DataTable so PrimeVue's built-in
// filtering/sorting can address fields directly instead of the raw values array.
const rows = computed(() =>
  tickets.value.map((record) => ({
    recordID: record.recordID,
    subject: fieldValue(record, 'Subject') ?? '',
    description: fieldValue(record, 'Description') ?? '',
    status: fieldValue(record, 'Status') ?? '',
    priority: fieldValue(record, 'Priority') ?? '',
    dueDate: fieldValue(record, 'DueDate'),
    createdAt: record.createdAt,
    record,
  })),
)

const filters = ref({
  global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  subject: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  priority: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
})

const formVisible = ref(false)
const editingTicket = ref<ComposeRecord | null>(null)

function openCreate() {
  editingTicket.value = null
  formVisible.value = true
}

function openEdit(ticket: ComposeRecord) {
  editingTicket.value = ticket
  formVisible.value = true
}

function onRowClick(event: { data: { record: ComposeRecord } }) {
  openEdit(event.data.record)
}

function confirmDelete(ticket: ComposeRecord) {
  confirm.require({
    header: 'Delete ticket',
    message: `Delete "${fieldValue(ticket, 'Subject')}"? This cannot be undone.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    acceptProps: { severity: 'danger' },
    rejectLabel: 'Cancel',
    rejectProps: { severity: 'secondary', text: true },
    accept: async () => {
      try {
        await remove(ticket.recordID)
        toast.add({ severity: 'success', summary: 'Ticket deleted', life: 3000 })
      } catch (err) {
        toast.add({
          severity: 'error',
          summary: 'Could not delete ticket',
          detail: err instanceof Error ? err.message : String(err),
          life: 5000,
        })
      }
    },
  })
}
</script>

<template>
  <section aria-labelledby="tickets-heading" class="tickets-page">
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
          class="u-desktop-only"
        />
        <Button label="New ticket" icon="pi pi-plus" severity="info" @click="openCreate" />
      </div>
    </header>

    <TicketFormDialog v-model:visible="formVisible" :ticket="editingTicket" />

    <div class="tickets-body">
      <Transition name="fade" mode="out-in">
        <p v-if="error" key="error" role="alert" class="tickets-error">{{ error }}</p>

        <div v-else-if="loading && tickets.length === 0" key="loading" class="tickets-loading">
          <ProgressSpinner aria-label="Loading tickets" />
        </div>

        <p v-else-if="tickets.length === 0" key="empty">No support tickets yet.</p>

        <TransitionGroup
          v-else-if="view === 'cards'"
          key="cards"
          tag="ul"
          name="fade"
          class="tickets-grid"
          aria-label="Support tickets"
        >
          <li v-for="ticket in tickets" :key="ticket.recordID">
            <Card class="ticket-card">
              <template #title>
                <div class="ticket-card-header">
                  <span class="ticket-subject">{{ fieldValue(ticket, 'Subject') }}</span>
                  <Tag
                    :value="fieldValue(ticket, 'Status')"
                    :severity="statusSeverity(fieldValue(ticket, 'Status'))"
                    :icon="statusIcon(fieldValue(ticket, 'Status'))"
                    class="status-tag"
                  />
                </div>
              </template>
              <template #content>
                <p class="ticket-description">{{ fieldValue(ticket, 'Description') || 'No description' }}</p>
                <dl class="ticket-meta">
                  <Tag
                    :value="fieldValue(ticket, 'Priority')"
                    :severity="prioritySeverity(fieldValue(ticket, 'Priority'))"
                    :icon="priorityIcon(fieldValue(ticket, 'Priority'))"
                    rounded
                    class="priority-tag"
                  />
                  <div>
                    <dd>Created: {{ formatDate(ticket.createdAt) }}</dd>
                    
                  </div>
                  <div v-if="fieldValue(ticket, 'DueDate')">
                    <dd>Due: {{ formatDate(fieldValue(ticket, 'DueDate')) }}</dd>
                  </div>
                </dl>
              </template>
              <template #footer>
                <div class="ticket-actions">
                  <Button
                    label="Delete"
                    severity="secondary"
                    text
                    :aria-label="`Delete ${fieldValue(ticket, 'Subject')}`"
                    @click="confirmDelete(ticket)"
                  />
                  <Button
                    icon="pi pi-pencil"
                    label="Edit"
                    severity="contrast"
                    outlined
                    :aria-label="`Edit ${fieldValue(ticket, 'Subject')}`"
                    @click="openEdit(ticket)"
                  />
                </div>
              </template>
            </Card>
          </li>
        </TransitionGroup>

        <div v-else key="table" class="table-scroll">
          <DataTable
            :value="rows"
            data-key="recordID"
            striped-rows
            v-model:filters="filters"
            filter-display="row"
            :global-filter-fields="['subject', 'description']"
            row-hover
            class="tickets-table"
            @row-click="onRowClick"
          >
            <template #header>
              <IconField class="tickets-search">
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters.global.value" placeholder="Search tickets..." />
              </IconField>
            </template>
            <template #empty>No tickets match your filters.</template>
            <Column field="subject" header="Subject" :show-filter-menu="false" style="min-width: 14rem">
              <template #body="{ data }">{{ data.subject }}</template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  placeholder="Search subject"
                  @input="filterCallback()"
                />
              </template>
            </Column>
            <Column field="status" header="Status" :show-filter-menu="false" style="min-width: 12rem">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="statusSeverity(data.status)" :icon="statusIcon(data.status)" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Select
                  v-model="filterModel.value"
                  :options="STATUS_OPTIONS"
                  placeholder="Any"
                  show-clear
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column field="priority" header="Priority" :show-filter-menu="false" style="min-width: 12rem">
              <template #body="{ data }">
                <Tag :value="data.priority" :severity="prioritySeverity(data.priority)" rounded class="priority-tag" />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Select
                  v-model="filterModel.value"
                  :options="PRIORITY_OPTIONS"
                  placeholder="Any"
                  show-clear
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column header="Due date" style="min-width: 10rem">
              <template #body="{ data }">{{ formatDate(data.dueDate) ?? '—' }}</template>
            </Column>
            <Column header="Created" style="min-width: 10rem">
              <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
            </Column>
            <Column header="Actions" style="min-width: 9rem">
              <template #body="{ data }">
                <div class="ticket-actions" @click.stop>
                  <Button
                    icon="pi pi-pencil"
                    severity="secondary"
                    text
                    :aria-label="`Edit ${data.subject}`"
                    @click="openEdit(data.record)"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    :aria-label="`Delete ${data.subject}`"
                    @click="confirmDelete(data.record)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.tickets-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tickets-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.tickets-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: var(--p-datatable-header-padding);
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
  align-items: center;
  justify-content: center;
  flex: 1;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.ticket-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .ticket-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.ticket-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.ticket-subject {
  font-size: 1.05rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.status-tag {
  display: inline-flex;
  flex-shrink: 0;
}

.priority-tag {
  font-weight: 600;
}

.ticket-description {
  margin: 1rem 0;
  color: var(--p-text-muted-color);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  min-height: 3.9em;
}

.ticket-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.25rem;
  margin: auto 0 0;
  padding: 0.6rem 0;
  border-top: 1px solid var(--p-content-border-color, #e5e7eb);
}

.ticket-meta dd {
  margin: 0;
  font-size: 0.78rem;
  color: var(--p-text-muted-color);
}

.table-scroll {
  overflow-x: auto;
}

.tickets-search {
  width: 100%;
  max-width: 20rem;
}

.tickets-search :deep(input) {
  width: 100%;
}

.tickets-table :deep(tbody > tr) {
  cursor: pointer;
}

/* utilities */
.u-desktop-only {
  display: block;
}
@media (max-width: 768px) {
  .u-desktop-only {
    display: none;
  }
}
/* end of utilities */
</style>
