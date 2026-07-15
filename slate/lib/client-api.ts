import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Client {
  id: string
  kode: string
  nama: string
  npwp: string | null
  tipe: "perusahaan" | "perorangan"
  email: string | null
  telepon: string | null
  website: string | null
  keterangan: string | null
  aktif: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Client[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchClients(params?: {
  page?: number
  per_page?: number
  search?: string
  sort_field?: string
  sort_dir?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)

  const res = await authFetch(`${API_BASE}/client?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch clients (${res.status})`)
  return res.json()
}

export async function createClient(data: {
  kode: string
  nama: string
  npwp?: string
  tipe: "perusahaan" | "perorangan"
  email?: string
  telepon?: string
  website?: string
  keterangan?: string
  aktif?: boolean
}): Promise<Client> {
  const res = await authFetch(`${API_BASE}/client`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create client (${res.status})`)
  return res.json()
}

export async function updateClient(
  id: string,
  data: Partial<{
    kode: string
    nama: string
    npwp: string
    tipe: "perusahaan" | "perorangan"
    email: string
    telepon: string
    website: string
    keterangan: string
    aktif: boolean
  }>
): Promise<Client> {
  const res = await authFetch(`${API_BASE}/client/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update client (${res.status})`)
  return res.json()
}

export async function deleteClient(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/client/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete client")
}

export async function bulkDeleteClients(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/client/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete clients (${res.status})`)
}

export async function fetchClient(id: string): Promise<Client> {
  const res = await authFetch(`${API_BASE}/client/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch client (${res.status})`)
  return res.json()
}
