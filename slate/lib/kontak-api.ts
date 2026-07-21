import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Kontak {
  id: string
  nama: string
  jabatan: string | null
  telepon: string | null
  hp: string | null
  email: string | null
  utama: boolean
  aktif: boolean
  contactable_type: string
  contactable_id: string
  created_at: string
  updated_at: string
  contactable?: {
    id: string
    nama: string
    kode: string
  }
}

interface PaginatedResponse {
  data: Kontak[]
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

export async function fetchKontak(params?: {
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

  const res = await authFetch(`${API_BASE}/kontak?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to fetch kontak (${res.status}): ${body}`)
  }
  return res.json()
}

export async function createKontak(data: {
  nama: string
  jabatan?: string
  telepon?: string
  hp?: string
  email?: string
  utama?: boolean
  aktif?: boolean
  contactable_type: string
  contactable_id: string
}): Promise<Kontak> {
  const res = await authFetch(`${API_BASE}/kontak`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to create kontak (${res.status}): ${body}`)
  }
  return res.json()
}

export async function updateKontak(
  id: string,
  data: Partial<{
    nama: string
    jabatan: string
    telepon: string
    hp: string
    email: string
    utama: boolean
    aktif: boolean
    contactable_type: string
    contactable_id: string
  }>
): Promise<Kontak> {
  const res = await authFetch(`${API_BASE}/kontak/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to update kontak (${res.status}): ${body}`)
  }
  return res.json()
}

export async function deleteKontak(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/kontak/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete kontak")
}

export async function bulkDeleteKontak(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/kontak/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to bulk delete kontak (${res.status}): ${body}`)
  }
}
