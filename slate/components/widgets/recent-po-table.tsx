"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPurchaseOrders, type PurchaseOrder } from "@/lib/purchase-order-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentPoTable() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.recent_po")) return
    fetchPurchaseOrders({ per_page: 5, sort_field: "created_at", sort_dir: "desc" })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.recent_po")) return null

  const statusColor: Record<string, string> = {
    draft: "secondary",
    dikirim: "secondary",
    disetujui: "default",
    diterima: "default",
    diterima_sebagian: "secondary",
    dibatalkan: "destructive",
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/purchase-order")}>
        <CardTitle className="text-base">PO Terbaru</CardTitle>
        <CardDescription>5 Purchase Order terakhir</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada data</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((po) => (
                <TableRow key={po.id} className="cursor-pointer" onClick={() => router.push(`/purchase-order/${po.id}`)}>
                  <TableCell className="font-medium">{po.kode || "—"}</TableCell>
                  <TableCell>{po.vendor?.nama || "—"}</TableCell>
                  <TableCell className="tabular-nums">{po.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge variant={(statusColor[po.status] || "secondary") as any}>{po.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
