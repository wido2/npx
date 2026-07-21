"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchPOPerVendor, type PerVendorItem } from "@/lib/report-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoaderIcon, TrophyIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function TopVendorTable() {
  const { can } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PerVendorItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!can("widget.top_vendor")) return
    fetchPOPerVendor()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [can])

  if (!can("widget.top_vendor")) return null

  const sorted = [...data].sort((a, b) => b.total_nilai - a.total_nilai).slice(0, 5)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => router.push("/reports")}>
        <div className="flex items-center gap-2">
          <TrophyIcon className="size-4 text-yellow-500" />
          <CardTitle className="text-base">Top Vendor by Nilai PO</CardTitle>
        </div>
        <CardDescription>Vendor dengan nilai PO tertinggi</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada data</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Total PO</TableHead>
                <TableHead>Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((v, i) => (
                <TableRow key={v.vendor_id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{v.vendor_nama}</TableCell>
                  <TableCell>{v.total_po}</TableCell>
                  <TableCell className="tabular-nums">{v.total_nilai.toLocaleString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
