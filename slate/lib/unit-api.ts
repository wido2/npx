import { authFetch, getToken } from "./api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Unit {
  id: string
  nama: string
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await authFetch(`${API_BASE}/unit`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch units (${res.status})`)
  return res.json()
}
