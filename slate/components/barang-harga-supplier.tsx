"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  fetchHargaSuppliers, createHargaSupplier, updateHargaSupplier, deleteHargaSupplier,
  fetchHargaSupplierHistory,
  type HargaSupplier, type RiwayatHargaSupplier,
} from "@/lib/barang-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { formatCurrency } from "@/lib/utils"
import {
  LoaderIcon, PencilIcon, PlusIcon, SaveIcon, Trash2Icon, XIcon, HistoryIcon,
} from "lucide-react"

interface Props {
  barangId: string
}

export function BarangHargaSupplier({ barangId }: Props) {
  const [data, setData] = useState<HargaSupplier[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState("")
  const [hargaBeli, setHargaBeli] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // History sheet
  const [historyItem, setHistoryItem] = useState<HargaSupplier | null>(null)
  const [historyData, setHistoryData] = useState<RiwayatHargaSupplier[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [hs, v] = await Promise.all([
        fetchHargaSuppliers({ barang_id: barangId, per_page: 100 }),
        fetchVendors({ per_page: 100 }),
      ])
      setData(hs.data)
      setVendors(v.data)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [barangId])

  useEffect(() => { loadData() }, [loadData])

  function resetForm() {
    setShowForm(false)
    setEditId(null)
    setVendorId("")
    setHargaBeli("")
    setKeterangan("")
  }

  function openEdit(item: HargaSupplier) {
    setEditId(item.id)
    setVendorId(item.vendor_id)
    setHargaBeli(String(Math.round(item.harga_beli)))
    setKeterangan(item.keterangan || "")
    setShowForm(true)
  }

  async function handleSave() {
    if (!vendorId || !hargaBeli) {
      toast.error("Vendor dan harga harus diisi")
      return
    }
    setSaving(true)
    try {
      if (editId) {
        await updateHargaSupplier(editId, {
          harga_beli: parseFloat(hargaBeli) || 0,
          keterangan: keterangan || undefined,
        })
        toast.success("Harga supplier diupdate")
      } else {
        await createHargaSupplier({
          barang_id: barangId,
          vendor_id: vendorId,
          harga_beli: parseFloat(hargaBeli) || 0,
          keterangan: keterangan || undefined,
        })
        toast.success("Harga supplier ditambahkan")
      }
      resetForm()
      loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteHargaSupplier(id)
      toast.success("Harga supplier dihapus")
      setDeleteId(null)
      loadData()
    } catch {
      toast.error("Gagal menghapus")
    }
  }

  async function openHistory(item: HargaSupplier) {
    setHistoryItem(item)
    setHistoryLoading(true)
    setHistoryData([])
    try {
      const res = await fetchHargaSupplierHistory(item.id, { per_page: 50 })
      setHistoryData(res.data)
    } catch {
      toast.error("Gagal memuat riwayat harga")
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-10"><LoaderIcon className="size-5 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.length} harga supplier
        </p>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <PlusIcon /> Tambah
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Field>
              <FieldLabel>Vendor</FieldLabel>
              <FieldContent>
                <Combobox
                  options={vendors.map((v) => ({ value: v.id, label: `${v.kode} - ${v.nama}` }))}
                  value={vendorId}
                  onValueChange={(v) => setVendorId(v)}
                  placeholder="Pilih vendor..."
                  searchPlaceholder="Cari vendor..."
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Harga Beli</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  step="1"
                  value={hargaBeli}
                  onChange={(e) => setHargaBeli(e.target.value)}
                  placeholder="0"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Keterangan</FieldLabel>
              <FieldContent>
                <Input
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Opsional"
                />
              </FieldContent>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetForm} disabled={saving}>
              <XIcon /> Batal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <SaveIcon /> {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Harga Beli</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                  Belum ada harga supplier
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.vendor?.nama || "-"}</div>
                    <div className="text-xs text-muted-foreground">{item.vendor?.kode || ""}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(item.harga_beli)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.keterangan || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openHistory(item)} title="Riwayat harga">
                        <HistoryIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(item)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus harga supplier?</AlertDialogTitle>
            <AlertDialogDescription>Data harga untuk vendor ini akan dihapus. Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!historyItem} onOpenChange={(o) => { if (!o) setHistoryItem(null) }}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Riwayat Harga</SheetTitle>
            <SheetDescription>
              {historyItem?.vendor?.nama} &mdash; {formatCurrency(historyItem?.harga_beli ?? 0)}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            {historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : historyData.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Belum ada riwayat perubahan harga</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Harga Lama</TableHead>
                    <TableHead className="text-right">Harga Baru</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((h) => (
                    <TableRow key={h.id}>
<TableCell className="text-sm">
                         {new Date(h.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                       </TableCell>
                      <TableCell className="text-right tabular-nums text-red-600">
                        {formatCurrency(h.harga_beli_lama)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-600 font-medium">
                        {formatCurrency(h.harga_beli_baru)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.keterangan || "-"}</TableCell>
                      <TableCell className="text-sm">{h.dibuat_oleh?.name || h.created_by?.slice(0, 8) || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
