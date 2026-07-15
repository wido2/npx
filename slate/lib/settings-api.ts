import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Setting {
  id: string
  group: string
  data: Record<string, unknown>
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

export async function fetchSetting(group: string): Promise<Setting> {
  const res = await authFetch(`${API_BASE}/settings/${group}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch settings (${res.status})`)
  return res.json()
}

export async function updateSetting(
  group: string,
  data: Record<string, unknown>
): Promise<Setting> {
  const res = await authFetch(`${API_BASE}/settings/${group}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`Failed to update settings (${res.status})`)
  return res.json()
}

export async function uploadLogo(file: File): Promise<{ path: string }> {
  const token = getToken()
  const formData = new FormData()
  formData.append("logo", file)

  const res = await authFetch(`${API_BASE}/settings/upload-logo`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) throw new Error(`Failed to upload logo (${res.status})`)
  return res.json()
}
