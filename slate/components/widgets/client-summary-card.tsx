"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchClients } from "@/lib/client-api"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, LoaderIcon } from "lucide-react"

export function ClientSummaryCard() {
  const { can } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.client_summary")) return
    fetchClients({ per_page: 1 })
      .then((res) => setCount(res.total))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.client_summary")) return null

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <UsersIcon className="size-5 text-primary" />
        </div>
        <div>
          <CardDescription>Total Client</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? <LoaderIcon className="size-5 animate-spin" /> : count ?? "—"}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
