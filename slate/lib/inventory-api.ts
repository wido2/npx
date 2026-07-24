import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface MutasiStok {
  id: string
  barang_id: string
  tipe: "masuk" | "keluar" | "opname"
  jumlah: number
  stok_sebelum: number
  stok_sesudah: number
  referensi_type: string | null
  referensi_id: string | null
  keterangan: string | null
  created_by: string
  created_at: string
  barang?: { id: string; kode: string; nama: string; unit?: { id: string; singkatan: string } }
  dibuat_oleh?: { id: string; name: string }
}

export interface BarangLaporanItem {
  id: string
  kode: string
  nama: string
  stok: number
  stok_minimum: number
  harga_beli: number | null
  aktif: boolean
  kategori?: { id: string; nama: string }
  unit?: { id: string; nama: string }
}

export interface LaporanStokResponse {
  data: BarangLaporanItem[]
  total_item: number
  total_stok: number
  nilai_stok: number
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchMutasi(params: {
  search?: string
  barang_id?: string
  page?: number
  per_page?: number
}): Promise<{ data: MutasiStok[]; current_page: number; last_page: number; per_page: number; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set("search", params.search)
  if (params?.barang_id) searchParams.set("barang_id", params.barang_id)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))

  const res = await authFetch(`${API_BASE}/inventory/mutasi?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch mutasi (${res.status})`)
  return res.json()
}

export async function fetchStokMinimum(): Promise<BarangLaporanItem[]> {
  const res = await authFetch(`${API_BASE}/inventory/stok-minimum`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch stok minimum (${res.status})`)
  return res.json()
}

export async function createOpname(data: {
  barang_id: string
  stok_baru: number
  keterangan?: string
}): Promise<void> {
  const res = await authFetch(`${API_BASE}/inventory/opname`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create opname (${res.status})`)
}

export async function fetchLaporanStok(params?: {
  search?: string
  kategori_id?: string
}): Promise<LaporanStokResponse> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set("search", params.search)
  if (params?.kategori_id) searchParams.set("kategori_id", params.kategori_id)

  const res = await authFetch(`${API_BASE}/inventory/laporan-stok?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch laporan stok (${res.status})`)
  return res.json()
}
