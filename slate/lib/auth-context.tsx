"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { clearToken, getToken, setToken, type AuthUser } from "@/lib/api"
import { getProfile } from "@/lib/user-api"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  loginUser: (user: AuthUser, token: string) => void
  logoutUser: () => void
  can: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  loginUser: () => {},
  logoutUser: () => {},
  can: () => false,
  hasRole: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      getProfile()
        .then((u) => {
          setUser({
            id: u.id,
            name: u.name,
            email: u.email,
            roles: u.roles ?? [],
            permissions: u.permissions ?? [],
          })
        })
        .catch(() => {
          clearToken()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function loginUser(user: AuthUser, token: string) {
    setToken(token)
    setUser(user)
  }

  function logoutUser() {
    clearToken()
    setUser(null)
  }

  function can(permission: string): boolean {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  function hasRole(role: string): boolean {
    if (!user) return false
    return user.roles.includes(role)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, can, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
