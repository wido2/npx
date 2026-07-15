import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface VendorContact {
  id: string
  contactable_id: string
  contactable_type: string
  nama: string
  jabatan: string | null
  telepon: string | null
  hp: string | null
  email: string | null
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

export async function fetchVendorContacts(vendorId: string): Promise<VendorContact[]> {
  const res = await authFetch(`${API_BASE}/vendor/${vendorId}/contacts`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to fetch vendor contacts")
  return res.json()
}

export async function createVendorContact(
  vendorId: string,
  data: {
    nama: string
    jabatan?: string
    telepon?: string
    hp?: string
    email?: string
    utama?: boolean
    aktif?: boolean
  }
): Promise<VendorContact> {
  const res = await authFetch(`${API_BASE}/vendor/${vendorId}/contacts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to create contact (${res.status}): ${body}`)
  }
  return res.json()
}

export async function updateVendorContact(
  contactId: string,
  data: Partial<{
    nama: string
    jabatan: string
    telepon: string
    hp: string
    email: string
    utama: boolean
    aktif: boolean
  }>
): Promise<VendorContact> {
  const res = await authFetch(`${API_BASE}/contacts/${contactId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Failed to update contact (${res.status}): ${body}`)
  }
  return res.json()
}

export async function deleteVendorContact(contactId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/contacts/${contactId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error("Failed to delete contact")
}
