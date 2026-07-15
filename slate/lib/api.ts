const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

interface LoginResponse {
  user: AuthUser
  token: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }))
    throw new Error(error.message || error.errors?.email?.[0] || "Login failed")
  }

  return res.json()
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token)
}

export function clearToken(): void {
  localStorage.removeItem("auth_token")
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export async function authFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init)
  if (res.status === 401) {
    clearToken()
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }
  return res
}
