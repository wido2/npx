"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchBarang, fetchBarangHargaHistory, type Barang, type RiwayatHarga } from "@/lib/barang-api"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeftIcon, BanknoteIcon, PackageIcon, FileTextIcon, CalendarIcon, TagsIcon, HistoryIcon, LoaderIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BarangHargaSupplier } from "@/components/barang-harga-supplier"
import { BarangHargaHistory } from "@/components/barang-harga-history"
import { cn } from "@/lib/utils"

export function BarangDetail({ barangId }: { barangId: string }) {
  const router = useRouter()
  const [barang, setBarang] = useState<Barang | null>(null)
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [historyData, setHistoryData] = useState<RiwayatHarga[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const b = await fetchBarang(barangId)
      setBarang(b)
    } catch {
      toast.error("Gagal memuat data barang")
    } finally {
      setLoading(false)
    }
  }, [barangId])

  useEffect(() => { load() }, [load])

  async function openHargaHistory() {
    setHistoryLoading(true)
    setSheetOpen(true)
    try {
      const res = await fetchBarangHargaHistory(barangId, { per_page: 50 })
      setHistoryData(res.data)
    } catch {
      toast.error("Gagal memuat riwayat harga")
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!barang) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Barang tidak ditemukan
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/barang")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{barang.nama}</h1>
          <p className="text-sm text-muted-foreground">
            {barang.kode}
            {barang.kategori && <span> &middot; {barang.kategori.nama}</span>}
            {barang.unit && <span> &middot; {barang.unit.singkatan}</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {barang.latest_po_price ? (
          <Card className="col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileTextIcon className="size-4" />
                Harga PO Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums">
                    {formatCurrency(barang.latest_po_price.harga)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileTextIcon className="size-3.5" />
                  <span>{barang.latest_po_price.po_number}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarIcon className="size-3.5" />
                  <span>{barang.latest_po_price.po_date ? new Date(barang.latest_po_price.po_date).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-"}</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {barang.latest_po_price.po_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={openHargaHistory}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Harga Beli (Referensi)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums">
                    {formatCurrency(barang.harga_beli)}
                  </span>
                  <HistoryIcon className="ml-auto size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stok</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <PackageIcon className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums">{barang.stok}</span>
                  {barang.stok_minimum > 0 && (
                    <span className="text-sm text-muted-foreground">min {barang.stok_minimum}</span>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{barang.deskripsi || "-"}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="vendor">
        <TabsList className="justify-center">
          <TabsTrigger value="vendor"><TagsIcon className="size-4" /> Harga Supplier</TabsTrigger>
          <TabsTrigger value="history"><HistoryIcon className="size-4" /> Riwayat Harga</TabsTrigger>
        </TabsList>
        <TabsContent value="vendor" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Harga per Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <BarangHargaSupplier barangId={barangId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <BarangHargaHistory barangId={barangId} compact />
        </TabsContent>
      </Tabs>

      <Sheet open={sheetOpen} onOpenChange={(o) => { if (!o) setSheetOpen(false) }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Riwayat Harga Beli</SheetTitle>
            <SheetDescription>
              {barang?.nama} &mdash; {barang?.kode}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : historyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Belum ada riwayat perubahan harga</p>
            ) : (
              historyData.map((h) => {
                const selisih = h.harga_beli_baru - h.harga_beli_lama
                const naik = selisih >= 0
                return (
                  <Card key={h.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(h.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                        <span>{h.dibuat_oleh?.name || h.created_by?.slice(0, 8) || "-"}</span>
                      </div>
                      {h.vendor && (
                        <div className="text-sm font-medium text-foreground">
                          Vendor: {h.vendor.nama}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Harga Lama</span>
                          <span className="tabular-nums text-red-600 line-through">{formatCurrency(h.harga_beli_lama)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className={cn("tabular-nums font-medium", naik ? "text-emerald-600" : "text-red-600")}>
                            {formatCurrency(selisih >= 0 ? selisih : -selisih)}
                          </span>
                          {naik ? <TrendingUpIcon className="size-3 text-emerald-600" /> : <TrendingDownIcon className="size-3 text-red-600" />}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground">Harga Baru</span>
                          <span className="tabular-nums text-emerald-600 font-medium">{formatCurrency(h.harga_beli_baru)}</span>
                        </div>
                      </div>
                      {h.keterangan && (
                        <p className="text-xs text-muted-foreground">{h.keterangan}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
