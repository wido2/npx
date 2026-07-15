const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  bio: string | null
  avatar: string | null
  facebook: string | null
  instagram: string | null
  twitter: string | null
  linkedin: string | null
  whatsapp: string | null
  telegram: string | null
  tiktok: string | null
  youtube: string | null
  github: string | null
  roles: string[]
  permissions: string[]
  created_at: string
  updated_at: string
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export async function getProfile(): Promise<User> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  if (!res.ok) throw new Error("Failed to fetch profile")
  return res.json()
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/user`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to update profile" }))
    throw new Error(err.message || err.errors?.email?.[0] || "Failed to update profile")
  }
  return res.json()
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
): Promise<void> {
  const token = getToken()
  const res = await fetch(`${API_BASE}/user/password`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to change password" }))
    throw new Error(err.message || "Failed to change password")
  }
}
