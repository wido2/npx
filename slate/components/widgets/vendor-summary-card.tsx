"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchVendors } from "@/lib/vendor-api"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2Icon, LoaderIcon } from "lucide-react"

export function VendorSummaryCard() {
  const { can } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.vendor_summary")) return
    fetchVendors({ per_page: 1 })
      .then((res) => setCount(res.total))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.vendor_summary")) return null

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2Icon className="size-5 text-primary" />
        </div>
        <div>
          <CardDescription>Total Vendor</CardDescription>
          <CardTitle className="text-2xl">
            {loading ? <LoaderIcon className="size-5 animate-spin" /> : count ?? "—"}
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  )
}
