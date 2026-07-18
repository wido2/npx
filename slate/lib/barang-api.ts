import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Kategori {
  id: string
  nama: string
}

export interface Unit {
  id: string
  nama: string
  singkatan: string
}

export interface Barang {
  id: string
  kode: string
  nama: string
  deskripsi: string | null
  stok: number
  stok_minimum: number
  harga_beli: number | null
  harga_jual: number | null
  gambar: string | null
  keterangan: string | null
  aktif: boolean
  kategori_id: string | null
  kategori_barang_id: string | null
  unit_id: string | null
  vendor_id: string | null
  created_at: string
  updated_at: string
  kategori?: Kategori
  unit?: Unit
  vendor?: { id: string; kode: string; nama: string }
  latest_po_price?: {
    harga: number
    po_number: string
    po_date: string
    po_status: string
  } | null
}

interface PaginatedResponse {
  data: Barang[]
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

export async function fetchBarangs(params?: {
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

  const res = await authFetch(`${API_BASE}/barang?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barangs (${res.status})`)
  return res.json()
}

export async function fetchCategories(): Promise<Kategori[]> {
  const res = await authFetch(`${API_BASE}/kategori`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`)
  return res.json()
}

export async function fetchBarang(id: string): Promise<Barang> {
  const res = await authFetch(`${API_BASE}/barang/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barang (${res.status})`)
  return res.json()
}

export async function createCategory(nama: string): Promise<Kategori> {
  const res = await authFetch(`${API_BASE}/kategori`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama }),
  })
  if (!res.ok) throw new Error(`Failed to create category (${res.status})`)
  return res.json()
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await authFetch(`${API_BASE}/unit`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch units (${res.status})`)
  return res.json()
}

export async function createUnit(nama: string, singkatan: string): Promise<Unit> {
  const res = await authFetch(`${API_BASE}/unit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nama, singkatan }),
  })
  if (!res.ok) throw new Error(`Failed to create unit (${res.status})`)
  return res.json()
}

export async function createBarang(data: {
  kode: string
  nama: string
  deskripsi?: string
  kategori_id?: string
  unit_id?: string
  harga_beli?: number
  stok?: number
  stok_minimum?: number
  gambar?: string
  aktif?: boolean
}): Promise<Barang> {
  const res = await authFetch(`${API_BASE}/barang`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create barang (${res.status})`)
  return res.json()
}

export async function updateBarang(
  id: string,
  data: Partial<{
    kode: string
    nama: string
    deskripsi: string
    kategori_id: string
    unit_id: string
    harga_beli: number
    stok: number
    stok_minimum: number
    gambar: string
    aktif: boolean
  }>
): Promise<Barang> {
  const res = await authFetch(`${API_BASE}/barang/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update barang (${res.status})`)
  return res.json()
}

export async function deleteBarang(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/barang/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete barang")
}

export async function bulkUpdateHarga(items: { id: string; harga_beli: number }[]): Promise<{ message: string; updated: number; errors: { id: string; message: string }[] }> {
  const res = await authFetch(`${API_BASE}/barang/bulk-update-harga`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error(`Failed to bulk update harga (${res.status})`)
  return res.json()
}

export async function bulkDeleteBarangs(ids: string[]): Promise<void> {
  const res = await authFetch(`${API_BASE}/barang/bulk-delete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Failed to bulk delete barangs (${res.status})`)
}

export interface RiwayatHarga {
  id: string
  barang_id: string
  harga_beli_lama: number
  harga_beli_baru: number
  referensi_type: string | null
  referensi_id: string | null
  keterangan: string | null
  created_by: string | null
  created_at: string
  dibuat_oleh?: { id: string; name: string }
  vendor?: { id: string; kode: string; nama: string } | null
}

interface RiwayatHargaResponse {
  data: RiwayatHarga[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface BarangSummary {
  total: number
  stok_normal: number
  stok_menipis: number
  stok_kosong: number
  total_nilai_stok: number
}

export async function fetchBarangSummary(): Promise<BarangSummary> {
  const res = await authFetch(`${API_BASE}/barang?per_page=1`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barang summary (${res.status})`)
  const json = await res.json()
  const total: number = json.total || 0

  let stok_normal = 0
  let stok_menipis = 0
  let stok_kosong = 0
  let total_nilai_stok = 0

  const allRes = await authFetch(`${API_BASE}/barang?per_page=${total || 1}`, {
    headers: authHeaders(),
  })
  if (allRes.ok) {
    const allJson = await allRes.json()
    const items: Barang[] = allJson.data || []
    for (const b of items) {
      if (b.stok === 0) stok_kosong++
      else if (b.stok_minimum > 0 && b.stok <= b.stok_minimum) stok_menipis++
      else stok_normal++
      if (b.harga_beli != null) total_nilai_stok += b.stok * b.harga_beli
    }
  }

  return { total, stok_normal, stok_menipis, stok_kosong, total_nilai_stok }
}

export interface HargaSupplier {
  id: string
  barang_id: string
  vendor_id: string
  harga_beli: number
  mata_uang: string
  keterangan: string | null
  created_at: string
  updated_at: string
  barang?: { id: string; kode: string; nama: string }
  vendor?: { id: string; kode: string; nama: string }
}

export async function fetchHargaSuppliers(params?: {
  barang_id?: string
  vendor_id?: string
  per_page?: number
}): Promise<{ data: HargaSupplier[]; current_page: number; last_page: number; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.barang_id) searchParams.set("barang_id", params.barang_id)
  if (params?.vendor_id) searchParams.set("vendor_id", params.vendor_id)
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))

  const res = await authFetch(`${API_BASE}/harga-supplier?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch harga suppliers (${res.status})`)
  return res.json()
}

export async function createHargaSupplier(data: {
  barang_id: string
  vendor_id: string
  harga_beli: number
  mata_uang?: string
  keterangan?: string
}): Promise<HargaSupplier> {
  const res = await authFetch(`${API_BASE}/harga-supplier`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to create harga supplier (${res.status})`)
  return res.json()
}

export async function updateHargaSupplier(id: string, data: {
  harga_beli: number
  mata_uang?: string
  keterangan?: string
}): Promise<HargaSupplier> {
  const res = await authFetch(`${API_BASE}/harga-supplier/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Failed to update harga supplier (${res.status})`)
  return res.json()
}

export async function deleteHargaSupplier(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/harga-supplier/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete harga supplier (${res.status})`)
}

export interface RiwayatHargaSupplier {
  id: string
  harga_supplier_id: string
  barang_id: string
  vendor_id: string
  harga_beli_lama: number
  harga_beli_baru: number
  referensi_type: string | null
  referensi_id: string | null
  keterangan: string | null
  created_by: string | null
  created_at: string
  dibuat_oleh?: { id: string; name: string }
}

export async function fetchHargaSupplierHistory(
  id: string,
  params?: { page?: number; per_page?: number }
): Promise<{ data: RiwayatHargaSupplier[]; current_page: number; last_page: number; per_page: number; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))

  const res = await authFetch(`${API_BASE}/harga-supplier/${id}/history?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch harga supplier history (${res.status})`)
  return res.json()
}

export async function fetchBarangHargaHistory(
  id: string,
  params?: { page?: number; per_page?: number }
): Promise<RiwayatHargaResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.per_page) searchParams.set("per_page", String(params.per_page))

  const res = await authFetch(`${API_BASE}/barang/${id}/harga-history?${searchParams}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch harga history (${res.status})`)
  return res.json()
}
