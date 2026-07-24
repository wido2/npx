"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchBarangSummary, type BarangSummary } from "@/lib/barang-api"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PackageIcon,
  AlertTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function BarangOverviewCards() {
  const { can } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<BarangSummary | null>(null)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    try {
      const s = await fetchBarangSummary()
      setSummary(s)
    } catch {
      toast.error("Gagal memuat ringkasan barang")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])

  if (!can("widget.barang_overview")) return null

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Barang</CardTitle>
          <PackageIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">{summary?.total || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stok Normal</CardTitle>
          <CheckCircleIcon className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums text-emerald-600">{summary?.stok_normal || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stok Menipis</CardTitle>
          <AlertTriangleIcon className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold tabular-nums", (summary?.stok_menipis || 0) > 0 ? "text-amber-600" : "text-muted-foreground")}>
            {summary?.stok_menipis || 0}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Stok Kosong</CardTitle>
          <XCircleIcon className="size-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold tabular-nums", (summary?.stok_kosong || 0) > 0 ? "text-red-600" : "text-muted-foreground")}>
            {summary?.stok_kosong || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
