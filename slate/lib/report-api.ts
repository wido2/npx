import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface POSummary {
  total_po: number
  total_nilai: number
  draft: number
  dikirim: number
  disetujui: number
  diterima_sebagian: number
  diterima: number
  dibatalkan: number
}

export interface POStats {
  total_po: number
  total_nilai: number
  rata_rata: number
}

export interface PerBulanItem {
  bulan: string
  tahun: number
  total_po: number
  total_nilai: number
}

export interface PerVendorItem {
  vendor_id: string
  vendor_nama: string
  total_po: number
  total_nilai: number
}

export interface PerStatusItem {
  status: string
  total: number
  total_nilai: number
}

export interface TopItem {
  barang_id: string
  barang_nama: string
  barang_kode: string
  total_dipesan: number
  total_diterima: number
  total_nilai: number
}

export interface PerProjectItem {
  project_id: string
  project_kode: string
  project_nama: string
  total_po: number
  total_nilai: number
}

export interface PerClientItem {
  client_id: string
  client_kode: string
  client_nama: string
  total_po: number
  total_nilai: number
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchPOSummary(): Promise<POSummary> {
  const res = await authFetch(`${API_BASE}/reports/purchase-order/summary`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch summary (${res.status})`)
  return res.json()
}

export async function fetchPOPerBulan(): Promise<PerBulanItem[]> {
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-bulan`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch per-bulan (${res.status})`)
  return res.json()
}

export async function fetchPOPerVendor(): Promise<PerVendorItem[]> {
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-vendor`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch per-vendor (${res.status})`)
  return res.json()
}

export async function fetchPOPerStatus(): Promise<PerStatusItem[]> {
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-status`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch per-status (${res.status})`)
  return res.json()
}

export async function fetchPOTopItems(sortBy?: "total_dipesan" | "total_nilai"): Promise<TopItem[]> {
  const params = sortBy ? `?sort_by=${sortBy}` : ""
  const res = await authFetch(`${API_BASE}/reports/purchase-order/top-items${params}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch top items (${res.status})`)
  return res.json()
}

export async function fetchPOPerProject(limit?: number): Promise<PerProjectItem[]> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-project${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PO per project (${res.status})`)
  return res.json()
}

export async function fetchPOPerClient(limit?: number): Promise<PerClientItem[]> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  const res = await authFetch(`${API_BASE}/reports/purchase-order/per-client${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch PO per client (${res.status})`)
  return res.json()
}

// ——— Barang Reports ———

export interface BarangSummary {
  total_barang: number
  total_aktif: number
  total_non_aktif: number
  total_kategori: number
  total_nilai_stok: number
  total_stok: number
  stok_kosong: number
  stok_minimum: number
  stok_normal: number
  stok_menipis: number
}

export interface PerKategoriItem {
  kategori_id: string
  kategori_nama: string
  total_barang: number
  total_stok: number
}

export interface PerStatusItemBarang {
  status: string
  total: number
}

export interface StokTerendahItem {
  barang_id: string
  barang_nama: string
  barang_kode: string
  stok: number
  stok_minimum: number
  unit: string
  kategori_nama: string
}

export interface TopBarItemByNilai {
  barang_id: string
  barang_nama: string
  barang_kode: string
  stok: number
  harga_beli: number
  nilai_stok: number
  unit: string
}

export interface TopByPengambilanItem {
  barang_id: string
  barang_kode: string
  barang_nama: string
  total_pengambilan: number
  total_jumlah: number
}

export async function fetchBarangSummaryReport(): Promise<BarangSummary> {
  const res = await authFetch(`${API_BASE}/reports/barang/summary`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barang summary (${res.status})`)
  return res.json()
}

export async function fetchBarangPerKategori(): Promise<PerKategoriItem[]> {
  const res = await authFetch(`${API_BASE}/reports/barang/per-kategori`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barang per kategori (${res.status})`)
  return res.json()
}

export async function fetchBarangPerStatus(): Promise<PerStatusItemBarang[]> {
  const res = await authFetch(`${API_BASE}/reports/barang/per-status`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch barang per status (${res.status})`)
  return res.json()
}

export async function fetchBarangStokTerendah(): Promise<StokTerendahItem[]> {
  const res = await authFetch(`${API_BASE}/reports/barang/stok-terendah`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch stok terendah (${res.status})`)
  return res.json()
}

export async function fetchBarangTopItemsByNilai(): Promise<TopBarItemByNilai[]> {
  const res = await authFetch(`${API_BASE}/reports/barang/top-items-nilai`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch top items by nilai (${res.status})`)
  return res.json()
}

export async function fetchBarangTopByPengambilan(): Promise<TopByPengambilanItem[]> {
  const res = await authFetch(`${API_BASE}/reports/barang/top-by-pengambilan`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch top by pengambilan (${res.status})`)
  return res.json()
}
