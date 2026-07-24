"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchHargaUpdates, type HargaUpdate } from "@/lib/harga-update-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentHargaUpdate() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<HargaUpdate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.recent_harga_update")) return
    fetchHargaUpdates({ per_page: 5 })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.recent_harga_update")) return null

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/barang/harga/update")}>
        <CardTitle className="text-base">Harga Terupdate</CardTitle>
        <CardDescription>5 Harga Update terakhir</CardDescription>
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
                <TableHead>Item</TableHead>
                <TableHead>Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((hu) => (
                <TableRow key={hu.id} className="cursor-pointer" onClick={() => router.push(`/barang/harga/update/${hu.id}`)}>
                  <TableCell className="font-medium">{hu.kode || "—"}</TableCell>
                  <TableCell>{hu.vendor?.nama || "—"}</TableCell>
                  <TableCell className="tabular-nums">{hu.riwayat?.length || 0}</TableCell>
                  <TableCell>{new Date(hu.created_at).toLocaleDateString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
