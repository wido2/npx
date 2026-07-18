"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchBarang, type Barang } from "@/lib/barang-api"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeftIcon, BanknoteIcon, PackageIcon, FileTextIcon, CalendarIcon, TagsIcon, HistoryIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BarangHargaSupplier } from "@/components/barang-harga-supplier"
import { BarangHargaHistory } from "@/components/barang-harga-history"

export function BarangDetail({ barangId }: { barangId: string }) {
  const router = useRouter()
  const [barang, setBarang] = useState<Barang | null>(null)
  const [loading, setLoading] = useState(true)

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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Harga Beli (Referensi)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold tabular-nums">
                    {formatCurrency(barang.harga_beli)}
                  </span>
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
    </div>
  )
}
