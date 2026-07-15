import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Vendor {
  id: string
  kode: string
  nama: string
  npwp: string | null
  tipe: "supplier" | "konsumen" | "keduanya"
  keterangan: string | null
  aktif: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Vendor[]
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

export async function fetchVendors(params?: {
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

  const res = await authFetch(`${API_BASE}/vendor?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to fetch vendors (${res.status}): ${body}`)
  }
  return res.json()
}

export async function fetchVendor(id: string): Promise<Vendor> {
  const res = await authFetch(`${API_BASE}/vendor/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch vendor (${res.status})`)
  return res.json()
}

export async function createVendor(data: {
  kode: string
  nama: string
  npwp?: string
  tipe: "supplier" | "konsumen" | "keduanya"
  keterangan?: string
  aktif?: boolean
}): Promise<Vendor> {
  const res = await authFetch(`${API_BASE}/vendor`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to create vendor (${res.status}): ${body}`)
  }
  return res.json()
}

export async function updateVendor(
  id: string,
  data: Partial<{
    kode: string
    nama: string
    npwp: string
    tipe: "supplier" | "konsumen" | "keduanya"
    keterangan: string
    aktif: boolean
  }>
): Promise<Vendor> {
  const res = await authFetch(`${API_BASE}/vendor/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to update vendor (${res.status}): ${body}`)
  }
  return res.json()
}

export async function deleteVendor(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/vendor/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete vendor")
}

export async function bulkDeleteVendors(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/vendor/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to bulk delete vendors (${res.status}): ${body}`)
  }
}
