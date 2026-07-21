"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPengambilanBarangs, type PengambilanBarang } from "@/lib/pengambilan-barang-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function RecentPbTable() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PengambilanBarang[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.recent_pb")) return
    fetchPengambilanBarangs({ per_page: 5, sort_field: "created_at", sort_dir: "desc" })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.recent_pb")) return null

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/pengambilan-barang")}>
        <CardTitle className="text-base">PB Terbaru</CardTitle>
        <CardDescription>5 Pengambilan Barang terakhir</CardDescription>
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
                <TableHead>Tanggal</TableHead>
                <TableHead>Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((pb) => (
                <TableRow key={pb.id} className="cursor-pointer" onClick={() => router.push(`/pengambilan-barang/${pb.id}`)}>
                  <TableCell className="font-medium">{pb.kode || "—"}</TableCell>
                  <TableCell>{new Date(pb.tanggal_pengambilan).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>{pb.items_count ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
