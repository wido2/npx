"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import {
  fetchBarangSummaryReport,
  fetchBarangPerKategori,
  fetchBarangTopByPengambilan,
  fetchBarangStokTerendah,
  fetchBarangTopItemsByNilai,
  type BarangSummary,
  type PerKategoriItem,
  type TopByPengambilanItem,
  type StokTerendahItem,
  type TopBarItemByNilai,
} from "@/lib/report-api"
import { LoaderIcon, PackageIcon, AlertTriangleIcon, XCircleIcon, CheckCircleIcon, CoinsIcon } from "lucide-react"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

export function BarangReportCards() {
  const { can } = useAuth()
  if (!can("widget.barang_report_cards")) return null

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<BarangSummary | null>(null)
  const [perKategori, setPerKategori] = useState<PerKategoriItem[]>([])
  const [topPengambilan, setTopPengambilan] = useState<TopByPengambilanItem[]>([])
  const [stokTerendah, setStokTerendah] = useState<StokTerendahItem[]>([])
  const [topItemsByNilai, setTopItemsByNilai] = useState<TopBarItemByNilai[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, k, tp, se, t] = await Promise.all([
        fetchBarangSummaryReport(),
        fetchBarangPerKategori(),
        fetchBarangTopByPengambilan(),
        fetchBarangStokTerendah(),
        fetchBarangTopItemsByNilai(),
      ])
      setSummary(s)
      setPerKategori(k)
      setTopPengambilan(tp)
      setStokTerendah(se)
      setTopItemsByNilai(t)
    } catch {
      toast.error("Failed to load barang reports")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="per-kategori">Per Kategori</TabsTrigger>
        <TabsTrigger value="top-pengambilan">Top Barang</TabsTrigger>
        <TabsTrigger value="stok-terendah">Stok Terendah</TabsTrigger>
        <TabsTrigger value="top-nilai">Top Items (Nilai)</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
              <PackageIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.total_barang || 0}</div>
              <p className="text-xs text-muted-foreground">Nilai stok: {currency(summary?.total_nilai_stok || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stok Normal</CardTitle>
              <CheckCircleIcon className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{summary?.stok_normal || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
              <AlertTriangleIcon className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{summary?.stok_menipis || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stok Kosong</CardTitle>
              <XCircleIcon className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary?.stok_kosong || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Nilai Stok</CardTitle>
              <CoinsIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currency(summary?.total_nilai_stok || 0)}</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="per-kategori" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Barang per Kategori</CardTitle></CardHeader>
          <CardContent>
            {perKategori.length > 0 ? (
              <div className="flex h-80 items-center justify-center">
                <PieChart width={450} height={350}>
                  <Pie
                    data={perKategori.map((k) => ({ ...k, name: k.kategori_nama }))}
                    cx={225}
                    cy={175}
                    innerRadius={60}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="total_barang"
                    label={({ name, payload }) => `${name || payload?.kategori_nama} (${payload?.total_barang})`}
                  >
                    {perKategori.map((entry, i) => (
                      <Cell key={entry.kategori_id} fill={`hsl(${(i * 360) / perKategori.length}, 70%, 55%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as PerKategoriItem
                      return (
                        <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
                          <p className="font-medium">{d.kategori_nama}</p>
                          <p className="text-muted-foreground">Barang: {d.total_barang}</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="top-pengambilan" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Top Barang (Pengambilan Terbanyak)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Frekuensi</TableHead>
                  <TableHead className="text-right">Total Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPengambilan.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  topPengambilan.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.total_pengambilan}x</TableCell>
                      <TableCell className="text-right font-semibold">{item.total_jumlah}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stok-terendah" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Stok Terendah</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Stok Minimum</TableHead>
                  <TableHead>Satuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stokTerendah.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  stokTerendah.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{item.stok}</TableCell>
                      <TableCell className="text-right">{item.stok_minimum}</TableCell>
                      <TableCell>{item.unit_nama}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="top-nilai" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Top Items (by Nilai Stok)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Nilai/Satuan</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItemsByNilai.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  topItemsByNilai.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right">{currency(item.harga_beli)}</TableCell>
                      <TableCell className="text-right font-semibold">{currency(item.nilai_stok)}</TableCell>
                      <TableCell className="text-right">{item.stok}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
