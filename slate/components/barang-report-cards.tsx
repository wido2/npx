"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  fetchBarangSummaryReport,
  fetchBarangPerKategori,
  fetchBarangPerStatus,
  fetchBarangStokTerendah,
  fetchBarangTopItemsByNilai,
  type BarangSummary,
  type PerKategoriItem,
  type PerStatusItemBarang,
  type StokTerendahItem,
  type TopBarItemByNilai,
} from "@/lib/report-api"
import { LoaderIcon, PackageIcon, AlertTriangleIcon, XCircleIcon, CheckCircleIcon, CoinsIcon } from "lucide-react"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

const statusColors: Record<string, string> = {
  normal: "#22c55e",
  menipis: "#f59e0b",
  kosong: "#ef4444",
}

const statusLabels: Record<string, string> = {
  normal: "Normal",
  menipis: "Menipis",
  kosong: "Kosong",
}

export function BarangReportCards() {
  const { can } = useAuth()
  if (!can("widget.barang_report_cards")) return null

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<BarangSummary | null>(null)
  const [perKategori, setPerKategori] = useState<PerKategoriItem[]>([])
  const [perStatus, setPerStatus] = useState<PerStatusItemBarang[]>([])
  const [stokTerendah, setStokTerendah] = useState<StokTerendahItem[]>([])
  const [topItemsByNilai, setTopItemsByNilai] = useState<TopBarItemByNilai[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, k, st, se, t] = await Promise.all([
        fetchBarangSummaryReport(),
        fetchBarangPerKategori(),
        fetchBarangPerStatus(),
        fetchBarangStokTerendah(),
        fetchBarangTopItemsByNilai(),
      ])
      setSummary(s)
      setPerKategori(k)
      setPerStatus(st)
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
        <TabsTrigger value="per-status">Per Status</TabsTrigger>
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
          <CardContent className="p-0">
            {perKategori.length > 0 ? (
              <div className="h-80 w-full px-1">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={perKategori} margin={{ top: 20, right: 20, bottom: 60, left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="kategori_nama" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v: number) => currency(v)} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
                            <p className="mb-1 font-medium">{label}</p>
                            {payload.map((p, i) => (
                              <p key={i} className="text-muted-foreground">
                                {p.name === "total_nilai_stok" ? "Total Nilai" : "Total Barang"}: <span className="font-semibold text-foreground">{p.name === "total_nilai_stok" ? currency(p.value as number) : p.value}</span>
                              </p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="total_barang" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Total Barang" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="per-status" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Barang per Status Stok</CardTitle></CardHeader>
          <CardContent>
            {perStatus.length > 0 ? (
              <div className="flex h-80 items-center justify-center">
                <PieChart width={400} height={350}>
                  <Pie
                    data={perStatus.map((s) => ({ ...s, name: statusLabels[s.status] || s.status }))}
                    cx={200}
                    cy={175}
                    innerRadius={60}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="total"
                    label
                  >
                    {perStatus.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">No data</div>
            )}
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
                  <TableHead className="text-right">Total Nilai</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItemsByNilai.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  topItemsByNilai.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{currency(item.total_nilai)}</TableCell>
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
