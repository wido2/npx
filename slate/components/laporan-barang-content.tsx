"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  fetchBarangSummaryReport,
  fetchBarangPerKategori,
  fetchBarangPerStatus,
  fetchBarangStokTerendah,
  fetchBarangTopItemsByNilai,
  fetchBarangTopByPengambilan,
  type BarangSummary,
  type PerKategoriItem,
  type PerStatusItemBarang,
  type StokTerendahItem,
  type TopBarItemByNilai,
  type TopByPengambilanItem,
} from "@/lib/report-api"
import { LoaderIcon, PackageIcon, AlertTriangleIcon, TrendingUpIcon, BoxIcon, TagsIcon, DownloadIcon } from "lucide-react"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

function exportToExcel(data: {
  summary: BarangSummary | null
  perKategori: PerKategoriItem[]
  perStatus: PerStatusItemBarang[]
  stokTerendah: StokTerendahItem[]
  topNilai: TopBarItemByNilai[]
  topPengambilan: TopByPengambilanItem[]
}) {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  if (data.summary) {
    const summaryRows = [
      ["Laporan Barang - Ringkasan"],
      ["Metric", "Nilai"],
      ["Total Barang", data.summary.total_barang],
      ["Total Aktif", data.summary.total_aktif],
      ["Total Non Aktif", data.summary.total_non_aktif],
      ["Total Kategori", data.summary.total_kategori],
      ["Total Nilai Stok", data.summary.total_nilai_stok],
      ["Total Stok", data.summary.total_stok],
      ["Stok Kosong", data.summary.stok_kosong],
      ["Stok Menipis (≤ Min)", data.summary.stok_minimum],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan")
  }

  // Per Kategori sheet
  const kategoriRows = [
    ["Barang per Kategori"],
    ["No", "Kategori", "Total Barang", "Total Stok"],
    ...data.perKategori.map((row, i) => [
      i + 1,
      row.kategori_nama,
      row.total_barang,
      row.total_stok,
    ]),
  ]
  const wsKategori = XLSX.utils.aoa_to_sheet(kategoriRows)
  wsKategori["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsKategori, "Per Kategori")

  // Per Status sheet
  const statusRows = [
    ["Barang per Status"],
    ["Status", "Jumlah"],
    ...data.perStatus.map((row) => [
      row.status === "aktif" ? "Aktif" : "Non Aktif",
      row.total,
    ]),
  ]
  const wsStatus = XLSX.utils.aoa_to_sheet(statusRows)
  wsStatus["!cols"] = [{ wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsStatus, "Per Status")

  // Stok Terendah sheet
  const stokTerendahRows = [
    ["Stok Terendah (≤ Stok Minimum)"],
    ["No", "Kode", "Nama Barang", "Stok", "Min Stok", "Satuan", "Kategori"],
    ...data.stokTerendah.map((row, i) => [
      i + 1,
      row.barang_kode,
      row.barang_nama,
      row.stok,
      row.stok_minimum,
      row.unit,
      row.kategori_nama,
    ]),
  ]
  const wsStokTerendah = XLSX.utils.aoa_to_sheet(stokTerendahRows)
  wsStokTerendah["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsStokTerendah, "Stok Terendah")

  // Top Nilai Stok sheet
  const topNilaiRows = [
    ["Top Barang by Nilai Stok"],
    ["No", "Kode", "Nama Barang", "Stok", "Harga Beli", "Nilai Stok", "Satuan"],
    ...data.topNilai.map((row, i) => [
      i + 1,
      row.barang_kode,
      row.barang_nama,
      row.stok,
      row.harga_beli,
      row.nilai_stok,
      row.unit,
    ]),
  ]
  const wsTopNilai = XLSX.utils.aoa_to_sheet(topNilaiRows)
  wsTopNilai["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsTopNilai, "Top Nilai Stok")

  // Top Pengambilan sheet
  const topPengambilanRows = [
    ["Top Barang by Pengambilan"],
    ["No", "Kode", "Nama Barang", "Total Pengambilan", "Total Jumlah"],
    ...data.topPengambilan.map((row, i) => [
      i + 1,
      row.barang_kode,
      row.barang_nama,
      row.total_pengambilan,
      row.total_jumlah,
    ]),
  ]
  const wsTopPengambilan = XLSX.utils.aoa_to_sheet(topPengambilanRows)
  wsTopPengambilan["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, wsTopPengambilan, "Top Pengambilan")

  XLSX.writeFile(wb, "laporan-barang.xlsx")
}

export function LaporanBarangContent() {
  const { can } = useAuth()
  if (!can("reports.view")) return null

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<BarangSummary | null>(null)
  const [perKategori, setPerKategori] = useState<PerKategoriItem[]>([])
  const [perStatus, setPerStatus] = useState<PerStatusItemBarang[]>([])
  const [stokTerendah, setStokTerendah] = useState<StokTerendahItem[]>([])
  const [topNilai, setTopNilai] = useState<TopBarItemByNilai[]>([])
  const [topPengambilan, setTopPengambilan] = useState<TopByPengambilanItem[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, k, st, str, tn, tp] = await Promise.all([
        fetchBarangSummaryReport(),
        fetchBarangPerKategori(),
        fetchBarangPerStatus(),
        fetchBarangStokTerendah(),
        fetchBarangTopItemsByNilai(),
        fetchBarangTopByPengambilan(),
      ])
      setSummary(s)
      setPerKategori(k)
      setPerStatus(st)
      setStokTerendah(str)
      setTopNilai(tn)
      setTopPengambilan(tp)
    } catch {
      toast.error("Gagal memuat data laporan barang")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const hasData = perKategori.length > 0 || perStatus.length > 0 || stokTerendah.length > 0 || topNilai.length > 0 || topPengambilan.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Menampilkan semua data barang</p>
        {hasData && (
          <Button variant="outline" size="sm" onClick={() => exportToExcel({ summary, perKategori, perStatus, stokTerendah, topNilai, topPengambilan })}>
            <DownloadIcon className="size-4 mr-1" />
            Export Excel
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            <TabsTrigger value="kategori">Per Kategori</TabsTrigger>
            <TabsTrigger value="status">Per Status</TabsTrigger>
            <TabsTrigger value="stok-terendah">Stok Terendah</TabsTrigger>
            <TabsTrigger value="top-nilai">Top Nilai Stok</TabsTrigger>
            <TabsTrigger value="top-pengambilan">Top Pengambilan</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 space-y-6">
            {summary && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                    <PackageIcon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.total_barang}</div>
                    <p className="text-xs text-muted-foreground">Aktif: {summary.total_aktif} | Non Aktif: {summary.total_non_aktif}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Nilai Stok</CardTitle>
                    <TagsIcon className="size-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{currency(summary.total_nilai_stok)}</div>
                    <p className="text-xs text-muted-foreground">Total stok: {summary.total_stok}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Stok Kosong</CardTitle>
                    <BoxIcon className="size-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{summary.stok_kosong}</div>
                    <p className="text-xs text-muted-foreground">Barang dengan stok 0</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
                    <AlertTriangleIcon className="size-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-500">{summary.stok_minimum}</div>
                    <p className="text-xs text-muted-foreground">Stok kurang dari sama dengan minimum (dan lebih dari 0)</p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-4">
                  <CardHeader><CardTitle>Total Kategori: {summary.total_kategori}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Ringkasan lengkap barang di gudang</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="kategori" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TagsIcon className="size-5" /> Barang per Kategori</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Total Barang</TableHead>
                      <TableHead className="text-right">Total Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perKategori.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : (
                      perKategori.map((row, i) => (
                        <TableRow key={row.kategori_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-medium">{row.kategori_nama}</TableCell>
                          <TableCell className="text-right">{row.total_barang}</TableCell>
                          <TableCell className="text-right">{row.total_stok}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {perKategori.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{perKategori.reduce((s, r) => s + r.total_barang, 0)}</TableCell>
                        <TableCell className="text-right">{perKategori.reduce((s, r) => s + r.total_stok, 0)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PackageIcon className="size-5" /> Barang per Status</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perStatus.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : (
                      perStatus.map((row, i) => (
                        <TableRow key={row.status}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                              row.status === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {row.status === "aktif" ? "Aktif" : "Non Aktif"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{row.total}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {perStatus.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{perStatus.reduce((s, r) => s + r.total, 0)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stok-terendah" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangleIcon className="size-5" /> Stok Terendah (≤ Minimum)</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Min Stok</TableHead>
                      <TableHead className="text-center">Satuan</TableHead>
                      <TableHead>Kategori</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokTerendah.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Tidak ada barang stok menipis</TableCell></TableRow>
                    ) : (
                      stokTerendah.map((row, i) => (
                        <TableRow key={row.barang_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{row.barang_kode}</TableCell>
                          <TableCell className="font-medium">{row.barang_nama}</TableCell>
                          <TableCell className="text-right text-red-500 font-medium">{row.stok}</TableCell>
                          <TableCell className="text-right text-yellow-500">{row.stok_minimum}</TableCell>
                          <TableCell className="text-center">{row.unit}</TableCell>
                          <TableCell>{row.kategori_nama || "-"}</TableCell>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUpIcon className="size-5" /> Top Barang by Nilai Stok</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Harga Beli</TableHead>
                      <TableHead className="text-right">Nilai Stok</TableHead>
                      <TableHead className="text-center">Satuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topNilai.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : (
                      topNilai.map((row, i) => (
                        <TableRow key={row.barang_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{row.barang_kode}</TableCell>
                          <TableCell className="font-medium">{row.barang_nama}</TableCell>
                          <TableCell className="text-right">{row.stok}</TableCell>
                          <TableCell className="text-right">{currency(row.harga_beli)}</TableCell>
                          <TableCell className="text-right font-semibold text-green-500">{currency(row.nilai_stok)}</TableCell>
                          <TableCell className="text-center">{row.unit}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-pengambilan" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><PackageIcon className="size-5" /> Top Barang by Pengambilan</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead className="text-right">Total Pengambilan</TableHead>
                      <TableHead className="text-right">Total Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPengambilan.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Tidak ada data</TableCell></TableRow>
                    ) : (
                      topPengambilan.map((row, i) => (
                        <TableRow key={row.barang_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{row.barang_kode}</TableCell>
                          <TableCell className="font-medium">{row.barang_nama}</TableCell>
                          <TableCell className="text-right">{row.total_pengambilan}</TableCell>
                          <TableCell className="text-right">{row.total_jumlah}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}