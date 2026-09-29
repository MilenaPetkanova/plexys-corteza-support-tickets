<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useTickets } from '../composables/useTickets'
import type { ComposeRecord } from '../services/compose'
import { fieldValue as getFieldValue } from '../utils/ticket'

const STATUS_OPTIONS = ['New', 'In Progress', 'Resolved', 'Closed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent']

const props = defineProps<{
  visible: boolean
  ticket?: ComposeRecord | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const { create, update } = useTickets()
const toast = useToast()

const form = reactive({
  subject: '',
  description: '',
  status: 'New' as string,
  priority: 'Medium' as string,
  dueDate: null as Date | null,
})

const saving = ref(false)
const subjectInvalid = ref(false)

function resetForm(ticket?: ComposeRecord | null) {
  form.subject = ticket ? getFieldValue(ticket, 'Subject') ?? '' : ''
  form.description = ticket ? getFieldValue(ticket, 'Description') ?? '' : ''
  form.status = ticket ? getFieldValue(ticket, 'Status') ?? 'New' : 'New'
  form.priority = ticket ? getFieldValue(ticket, 'Priority') ?? 'Medium' : 'Medium'
  const dueDate = ticket ? getFieldValue(ticket, 'DueDate') : undefined
  form.dueDate = dueDate ? new Date(dueDate) : null
  subjectInvalid.value = false
}

watch(
  () => [props.visible, props.ticket] as const,
  ([visible, ticket]) => {
    if (visible) resetForm(ticket)
  },
  { immediate: true },
)

function close() {
  emit('update:visible', false)
}

async function save() {
  subjectInvalid.value = form.subject.trim().length === 0
  if (subjectInvalid.value) return

  saving.value = true
  try {
    const values = [
      { name: 'Subject', value: form.subject.trim() },
      { name: 'Description', value: form.description },
      { name: 'Status', value: form.status },
      { name: 'Priority', value: form.priority },
      { name: 'DueDate', value: form.dueDate ? form.dueDate.toISOString() : '' },
    ]

    if (props.ticket) {
      await update(props.ticket.recordID, values)
      toast.add({ severity: 'success', summary: 'Ticket updated', life: 3000 })
    } else {
      await create(values)
      toast.add({ severity: 'success', summary: 'Ticket created', life: 3000 })
    }
    close()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: props.ticket ? 'Could not update ticket' : 'Could not create ticket',
      detail: err instanceof Error ? err.message : String(err),
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="ticket ? 'Edit ticket' : 'New ticket'"
    :style="{ width: '32rem', maxWidth: '95vw' }"
    @update:visible="(v: boolean) => !v && close()"
  >
    <form class="ticket-form" @submit.prevent="save">
      <div class="field">
        <label for="ticket-subject">Subject *</label>
        <InputText
          id="ticket-subject"
          v-model="form.subject"
          :invalid="subjectInvalid"
          aria-describedby="ticket-subject-error"
          autofocus
        />
        <Message v-if="subjectInvalid" id="ticket-subject-error" severity="error" size="small" variant="simple">
          Subject is required
        </Message>
      </div>

      <div class="field">
        <label for="ticket-description">Description</label>
        <Textarea id="ticket-description" v-model="form.description" rows="4" auto-resize />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="ticket-status">Status *</label>
          <Select id="ticket-status" v-model="form.status" :options="STATUS_OPTIONS" />
        </div>
        <div class="field">
          <label for="ticket-priority">Priority *</label>
          <Select id="ticket-priority" v-model="form.priority" :options="PRIORITY_OPTIONS" />
        </div>
      </div>

      <div class="field">
        <label for="ticket-due-date">Due date</label>
        <DatePicker
          id="ticket-due-date"
          v-model="form.dueDate"
          show-time
          show-icon
          show-button-bar
          hour-format="24"
        />
      </div>
    </form>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="close" />
      <Button label="Save" icon="pi pi-check" :loading="saving" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field :deep(input),
.field :deep(textarea),
.field :deep(.p-select) {
  width: 100%;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.field-row .field {
  flex: 1;
}

label {
  font-weight: 500;
  font-size: 0.9rem;
}
</style>
