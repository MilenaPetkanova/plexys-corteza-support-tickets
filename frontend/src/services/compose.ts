import { apiClients } from '@cortezaproject/corteza-js'
import { useAuth } from '../composables/useAuth'

// Compose endpoints are all mounted under /compose (verified against Corteza's
// own compose.yaml OpenAPI spec) - the api-client's own path constants don't
// include that prefix, so it must be part of the baseURL.
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL as string}/compose`
const NAMESPACE_SLUG = 'plexys-homework'
const MODULE_HANDLE = 'support-ticket'

const { accessTokenFn } = useAuth()

const compose = new apiClients.Compose({
  baseURL: API_BASE_URL,
  accessTokenFn,
})

export interface RawValue {
  name: string
  value?: string
}

export interface ComposeRecord {
  recordID: string
  values: RawValue[]
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  ownedBy?: string
}

interface ComposeNamespace {
  namespaceID: string
  slug: string
}

interface ComposeModule {
  moduleID: string
  handle: string
}

interface ListResponse<T> {
  set: T[]
}

let moduleRef: { namespaceID: string; moduleID: string } | undefined

// Resolves and caches the namespace/module IDs behind the fixed slug/handle
// above (both created via the Compose builder UI, not by this app).
async function resolveModule(): Promise<{ namespaceID: string; moduleID: string }> {
  if (moduleRef) return moduleRef

  const { set: namespaces } = (await compose.namespaceList({ slug: NAMESPACE_SLUG })) as unknown as ListResponse<ComposeNamespace>
  const namespace = namespaces?.[0]
  if (!namespace) {
    throw new Error(`Namespace "${NAMESPACE_SLUG}" not found`)
  }

  const { set: modules } = (await compose.moduleList({
    namespaceID: namespace.namespaceID,
    handle: MODULE_HANDLE,
  })) as unknown as ListResponse<ComposeModule>
  const module = modules?.[0]
  if (!module) {
    throw new Error(`Module "${MODULE_HANDLE}" not found in namespace "${NAMESPACE_SLUG}"`)
  }

  moduleRef = { namespaceID: namespace.namespaceID, moduleID: module.moduleID }
  return moduleRef
}

export async function listTickets(): Promise<ComposeRecord[]> {
  const { namespaceID, moduleID } = await resolveModule()
  const { set } = (await compose.recordList({
    namespaceID,
    moduleID,
    sort: 'createdAt DESC',
  })) as unknown as ListResponse<ComposeRecord>
  return set ?? []
}

export async function createTicket(values: RawValue[]): Promise<ComposeRecord> {
  const { namespaceID, moduleID } = await resolveModule()
  return (await compose.recordCreate({ namespaceID, moduleID, values })) as unknown as ComposeRecord
}

export async function updateTicket(recordID: string, values: RawValue[]): Promise<ComposeRecord> {
  const { namespaceID, moduleID } = await resolveModule()
  return (await compose.recordUpdate({ namespaceID, moduleID, recordID, values })) as unknown as ComposeRecord
}

export async function deleteTicket(recordID: string): Promise<void> {
  const { namespaceID, moduleID } = await resolveModule()
  await compose.recordDelete({ namespaceID, moduleID, recordID })
}
