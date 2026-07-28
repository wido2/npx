"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchBarangStokTerendah, type StokTerendahItem } from "@/lib/report-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon, AlertTriangleIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function LowStockTable() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<StokTerendahItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.low_stock")) return
    fetchBarangStokTerendah()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.low_stock")) return null

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/inventory")}>
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-destructive" />
          <CardTitle className="text-base">Stok Menipis</CardTitle>
        </div>
        <CardDescription>Barang dengan stok rendah</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Semua stok aman</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Min.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((item) => (
                <TableRow key={item.barang_id} className="cursor-pointer" onClick={() => router.push(`/barang/${item.barang_id}`)}>
                  <TableCell className="font-medium">{item.barang_nama}</TableCell>
                  <TableCell>{item.barang_kode}</TableCell>
                  <TableCell>
                    <Badge variant={item.stok === 0 ? "destructive" : "secondary"}>
                      {item.stok} {item.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.stok_minimum} {item.unit}
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
