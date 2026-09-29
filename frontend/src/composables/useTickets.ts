import { ref } from 'vue'
import {
  listTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  type ComposeRecord,
  type RawValue,
} from '../services/compose'

const tickets = ref<ComposeRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function refresh(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    tickets.value = await listTickets()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

async function create(values: RawValue[]): Promise<void> {
  await createTicket(values)
  await refresh()
}

async function update(recordID: string, values: RawValue[]): Promise<void> {
  await updateTicket(recordID, values)
  await refresh()
}

async function remove(recordID: string): Promise<void> {
  await deleteTicket(recordID)
  await refresh()
}

export function useTickets() {
  return { tickets, loading, error, refresh, create, update, remove }
}
