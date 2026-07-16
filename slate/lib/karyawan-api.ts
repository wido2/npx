import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Karyawan {
  id: string
  nip: string | null
  nama: string
  jabatan: string | null
  telepon: string | null
  aktif: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Karyawan[]
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

export async function fetchKaryawans(params?: {
  page?: number
  per_page?: number
  search?: string
  aktif?: boolean
  sort_field?: string
  sort_dir?: string
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.aktif !== undefined) searchParams.set("aktif", String(params.aktif))
  if (params?.sort_field) searchParams.set("sort_field", params.sort_field)
  if (params?.sort_dir) searchParams.set("sort_dir", params.sort_dir)

  const res = await authFetch(`${API_BASE}/karyawan?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch karyawans (${res.status})`)
  return res.json()
}

export async function createKaryawan(data: {
  nip?: string
  nama: string
  jabatan?: string
  telepon?: string
  aktif?: boolean
}): Promise<Karyawan> {
  const res = await authFetch(`${API_BASE}/karyawan`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create karyawan (${res.status})`)
  return res.json()
}

export async function updateKaryawan(id: string, data: {
  nip?: string
  nama: string
  jabatan?: string
  telepon?: string
  aktif?: boolean
}): Promise<Karyawan> {
  const res = await authFetch(`${API_BASE}/karyawan/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update karyawan (${res.status})`)
  return res.json()
}

export async function deleteKaryawan(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/karyawan/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete karyawan")
}
