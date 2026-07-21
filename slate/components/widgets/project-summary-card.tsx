"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { authFetch } from "@/lib/api"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, LoaderIcon } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export function ProjectSummaryCard() {
  const { can } = useAuth()
  const [data, setData] = useState<{ total: number; aktif: number; selesai: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.project_summary")) return

    async function load() {
      try {
        const token = localStorage.getItem("auth_token")
        const headers: Record<string, string> = {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
        const res = await authFetch(`${API_BASE}/dashboard/summary`, { headers })
        if (res.ok) {
          const json = await res.json()
          setData({ total: json.project_total, aktif: json.project_aktif, selesai: json.project_selesai })
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [can])

  if (!can("widget.project_summary")) return null

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <BriefcaseIcon className="size-5 text-primary" />
        </div>
        <div>
          <CardDescription>Total Project</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? <LoaderIcon className="size-5 animate-spin" /> : data ? `${data.aktif} aktif / ${data.total} total` : "—"}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
