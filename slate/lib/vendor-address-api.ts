import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface VendorAddress {
  id: string
  addressable_id: string
  addressable_type: string
  label: string
  alamat: string
  provinsi: string
  kota: string
  kecamatan: string | null
  kelurahan: string | null
  kode_pos: string | null
  utama: boolean
  aktif: boolean
  created_at: string
  updated_at: string
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchVendorAddresses(vendorId: string): Promise<VendorAddress[]> {
  const res = await authFetch(`${API_BASE}/vendor/${vendorId}/addresses`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch vendor addresses")
  return res.json()
}

export async function createVendorAddress(
  vendorId: string,
  data: {
    label: string
    alamat: string
    provinsi: string
    kota: string
    kecamatan?: string
    kelurahan?: string
    kode_pos?: string
    utama?: boolean
    aktif?: boolean
  }
): Promise<VendorAddress> {
  const res = await authFetch(`${API_BASE}/vendor/${vendorId}/addresses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to create address (${res.status}): ${body}`)
  }
  return res.json()
}

export async function updateVendorAddress(
  addressId: string,
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
  }>
): Promise<VendorAddress> {
  const res = await authFetch(`${API_BASE}/addresses/${addressId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to update address (${res.status}): ${body}`)
  }
  return res.json()
}

export async function deleteVendorAddress(addressId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete address")
}
