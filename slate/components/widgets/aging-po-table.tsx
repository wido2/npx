"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { authFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon, AlertTriangleIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface AgingPOItem {
  id: string
  kode: string
  vendor_nama: string
  total: number
  status: string
  created_at: string
  hari: number
}

export function AgingPoTable() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AgingPOItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.aging_po")) return
    async function load() {
      try {
        const token = localStorage.getItem("auth_token")
        const headers: Record<string, string> = {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
        const res = await authFetch(`${API_BASE}/dashboard/aging-po?limit=5`, { headers })
        if (res.ok) setData(await res.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [can])

  if (!can("widget.aging_po")) return null

  const statusColor: Record<string, string> = {
    draft: "secondary",
    dikirim: "secondary",
    disetujui: "default",
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/purchase-order")}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Aging PO</CardTitle>
          {data.some((d) => Math.round(d.hari) > 7) && <AlertTriangleIcon className="size-4 text-destructive" />}
        </div>
        <CardDescription>PO pending paling lama</CardDescription>
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
                <TableHead>Hari</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((po) => (
                <TableRow key={po.id} className="cursor-pointer" onClick={() => router.push(`/purchase-order/${po.id}`)}>
                  <TableCell className="font-medium">{po.kode || "—"}</TableCell>
                  <TableCell>{po.vendor_nama}</TableCell>
                  <TableCell className="tabular-nums">{po.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge variant={(statusColor[po.status] || "secondary") as any}>{po.status}</Badge>
                  </TableCell>
                  <TableCell className={Math.round(po.hari) > 7 ? "text-destructive font-medium" : ""}>{Math.round(po.hari)} hari</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
