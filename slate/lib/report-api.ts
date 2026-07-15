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
