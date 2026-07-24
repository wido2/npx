"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchRiwayatHargaTerbaru, type RiwayatHargaItem } from "@/lib/harga-update-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function RecentHargaUpdate() {
  const { can } = useAuth()
  const [data, setData] = useState<RiwayatHargaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.recent_harga_update")) return
    fetchRiwayatHargaTerbaru()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.recent_harga_update")) return null

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
  const diff = (item: RiwayatHargaItem) => item.harga_beli_baru - item.harga_beli_lama
  const naik = (item: RiwayatHargaItem) => diff(item) > 0
  const turun = (item: RiwayatHargaItem) => diff(item) < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Harga Terupdate</CardTitle>
        <CardDescription>6 perubahan harga terakhir per barang</CardDescription>
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
                <TableHead>Barang</TableHead>
                <TableHead>Harga Lama</TableHead>
                <TableHead>Harga Baru</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.barang?.kode || "—"} - {item.barang?.nama || "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">{fmt(item.harga_beli_lama)}</TableCell>
                  <TableCell className="tabular-nums font-semibold">{fmt(item.harga_beli_baru)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 tabular-nums ${naik(item) ? "text-emerald-600" : turun(item) ? "text-red-600" : ""}`}>
                      {naik(item) ? <TrendingUpIcon className="size-3.5" /> : turun(item) ? <TrendingDownIcon className="size-3.5" /> : null}
                      {diff(item) > 0 ? "+" : ""}{fmt(diff(item))}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
