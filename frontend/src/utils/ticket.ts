import type { ComposeRecord } from '../services/compose'

// Field handles as created in the Compose builder UI (System > Compose).
export function fieldValue(record: ComposeRecord, name: string): string | undefined {
  return record.values.find((v) => v.name === name)?.value
}

const STATUS_SEVERITY: Record<string, 'info' | 'warn' | 'success' | 'secondary'> = {
  New: 'info',
  'In Progress': 'warn',
  Resolved: 'success',
  Closed: 'secondary',
}

const PRIORITY_SEVERITY: Record<string, 'secondary' | 'info' | 'warn' | 'danger'> = {
  Low: 'secondary',
  Medium: 'info',
  High: 'warn',
  Urgent: 'danger',
}

// Icons differentiate status/priority tags beyond color alone (color-only
// distinctions fail WCAG's "use of color" guideline).
const STATUS_ICON: Record<string, string> = {
  New: 'pi pi-circle',
  'In Progress': 'pi pi-spinner',
  Resolved: 'pi pi-check-circle',
  Closed: 'pi pi-times-circle',
}

const PRIORITY_ICON: Record<string, string> = {
  Low: 'pi pi-arrow-down',
  Medium: 'pi pi-minus',
  High: 'pi pi-arrow-up',
  Urgent: 'pi pi-exclamation-triangle',
}

export function statusSeverity(status?: string) {
  return status ? STATUS_SEVERITY[status] ?? 'secondary' : 'secondary'
}

export function prioritySeverity(priority?: string) {
  return priority ? PRIORITY_SEVERITY[priority] ?? 'secondary' : 'secondary'
}

export function statusIcon(status?: string): string | undefined {
  return status ? STATUS_ICON[status] : undefined
}

export function priorityIcon(priority?: string): string | undefined {
  return priority ? PRIORITY_ICON[priority] : undefined
}

export function formatDate(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
