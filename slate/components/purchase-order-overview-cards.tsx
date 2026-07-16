"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPurchaseOrderStats, type POStats } from "@/lib/purchase-order-api"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PackageCheckIcon,
  BanIcon,
  LoaderIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

export function PurchaseOrderOverviewCards() {
  const { can } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<POStats | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const s = await fetchPurchaseOrderStats()
      setStats(s)
    } catch {
      toast.error("Gagal memuat ringkasan PO")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  if (!can("widget.po_overview")) return null

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total PO Bulan Ini</CardTitle>
          <FileTextIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{stats?.total_bulan_ini || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">{currency(stats?.total_nilai_bulan_ini || 0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          <ClockIcon className="size-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-blue-600">{stats?.draft || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">{currency(stats?.draft_nilai || 0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
          <CheckCircleIcon className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-emerald-600">{stats?.disetujui || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">{currency(stats?.disetujui_nilai || 0)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Diterima</CardTitle>
          <PackageCheckIcon className="size-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-violet-600">{(stats?.diterima || 0) + (stats?.diterima_sebagian || 0)}</div>
          <p className="text-xs text-muted-foreground mt-1">{currency((stats?.diterima_nilai || 0) + (stats?.diterima_sebagian_nilai || 0))}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Dibatalkan</CardTitle>
          <BanIcon className={cn("size-4", (stats?.dibatalkan || 0) > 0 ? "text-red-500" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold tabular-nums", (stats?.dibatalkan || 0) > 0 ? "text-red-600" : "text-muted-foreground")}>
            {stats?.dibatalkan || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{currency(stats?.dibatalkan_nilai || 0)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
