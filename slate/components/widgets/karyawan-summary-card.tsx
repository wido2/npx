"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchKaryawans } from "@/lib/karyawan-api"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactIcon, LoaderIcon } from "lucide-react"

export function KaryawanSummaryCard() {
  const { can } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.karyawan_summary")) return
    fetchKaryawans({ per_page: 1, aktif: true })
      .then((res) => setCount(res.total))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.karyawan_summary")) return null

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <ContactIcon className="size-5 text-primary" />
        </div>
        <div>
          <CardDescription>Total Karyawan</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? <LoaderIcon className="size-5 animate-spin" /> : count ?? "—"}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
