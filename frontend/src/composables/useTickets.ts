import { ref } from 'vue'
import { listTickets, type ComposeRecord } from '../services/compose'

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

export function useTickets() {
  return { tickets, loading, error, refresh }
}
