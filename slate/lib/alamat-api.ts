import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Alamat {
  id: string
  label: string
  alamat: string
  provinsi: string
  kota: string
  kecamatan: string | null
  kelurahan: string | null
  kode_pos: string | null
  utama: boolean
  aktif: boolean
  addressable_type: string
  addressable_id: string
  created_at: string
  updated_at: string
  addressable?: {
    id: string
    nama: string
    kode: string
  }
}

interface PaginatedResponse {
  data: Alamat[]
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

export async function fetchAlamat(params?: {
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

  const res = await authFetch(`${API_BASE}/alamat?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to fetch alamat (${res.status}): ${body}`)
  }
  return res.json()
}

export async function createAlamat(data: {
  label: string
  alamat: string
  provinsi: string
  kota: string
  kecamatan?: string
  kelurahan?: string
  kode_pos?: string
  utama?: boolean
  aktif?: boolean
  addressable_type: string
  addressable_id: string
}): Promise<Alamat> {
  const res = await authFetch(`${API_BASE}/alamat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to create alamat (${res.status}): ${body}`)
  }
  return res.json()
}

export async function updateAlamat(
  id: string,
  data: Partial<{
    label: string
    alamat: string
    provinsi: string
    kota: string
    kecamatan: string
    kelurahan: string
    kode_pos: string
    utama: boolean
    aktif: boolean
    addressable_type: string
    addressable_id: string
  }>
): Promise<Alamat> {
  const res = await authFetch(`${API_BASE}/alamat/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to update alamat (${res.status}): ${body}`)
  }
  return res.json()
}

export async function deleteAlamat(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/alamat/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete alamat")
}

export async function bulkDeleteAlamat(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/alamat/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to bulk delete alamat (${res.status}): ${body}`)
  }
}
