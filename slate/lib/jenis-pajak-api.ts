import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface JenisPajak {
  id: string
  nama: string
  persentase: number
  deskripsi: string | null
  aktif: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: JenisPajak[]
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

export async function fetchJenisPajak(params?: {
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

  const res = await authFetch(`${API_BASE}/jenis-pajak?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch jenis pajak (${res.status})`)
  return res.json()
}

export async function createJenisPajak(data: {
  nama: string
  persentase: number
  deskripsi?: string
  aktif?: boolean
}): Promise<JenisPajak> {
  const res = await authFetch(`${API_BASE}/jenis-pajak`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create jenis pajak (${res.status})`)
  return res.json()
}

export async function updateJenisPajak(
  id: string,
  data: Partial<{
    nama: string
    persentase: number
    deskripsi: string
    aktif: boolean
  }>
): Promise<JenisPajak> {
  const res = await authFetch(`${API_BASE}/jenis-pajak/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update jenis pajak (${res.status})`)
  return res.json()
}

export async function deleteJenisPajak(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/jenis-pajak/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete jenis pajak")
}

export async function bulkDeleteJenisPajak(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/jenis-pajak/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete jenis pajak (${res.status})`)
}
