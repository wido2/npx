import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface HargaUpdate {
  id: string
  kode: string
  keterangan: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  dibuat_oleh?: { id: string; name: string }
  riwayat?: HargaUpdateRiwayat[]
}

export interface HargaUpdateRiwayat {
  id: string
  barang_id: string
  harga_beli_lama: number
  harga_beli_baru: number
  keterangan: string | null
  created_at: string
  barang?: { id: string; kode: string; nama: string }
}

interface PaginatedResponse {
  data: HargaUpdate[]
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

export async function fetchHargaUpdates(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))

  const res = await authFetch(`${API_BASE}/harga-update?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch harga updates (${res.status})`)
  return res.json()
}

export async function fetchHargaUpdate(id: string): Promise<HargaUpdate> {
  const res = await authFetch(`${API_BASE}/harga-update/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch harga update (${res.status})`)
  return res.json()
}

export async function createHargaUpdate(data: {
  vendor_id: string
  keterangan?: string
  items: { barang_id: string; harga_beli: number }[]
}): Promise<HargaUpdate> {
  const res = await authFetch(`${API_BASE}/harga-update`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create harga update (${res.status})`)
  return res.json()
}
