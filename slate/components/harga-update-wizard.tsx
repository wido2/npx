"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Combobox } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
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
import { createHargaUpdate } from "@/lib/harga-update-api"
import { fetchBarangs, fetchHargaSuppliers, type Barang, type HargaSupplier } from "@/lib/barang-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

interface LineItem {
  barang_id: string
  barang_nama: string
  barang_kode: string
  harga_lama: number
  harga_baru: string
  tempId: string
}

const steps = ["Vendor & Keterangan", "Items", "Review"]

export function HargaUpdateWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [vendorPrices, setVendorPrices] = useState<HargaSupplier[]>([])

  const [vendorId, setVendorId] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [search, setSearch] = useState("")

  const [items, setItems] = useState<LineItem[]>([])
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [bulkHarga, setBulkHarga] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const loadRefs = useCallback(async () => {
    try {
      const [v, b] = await Promise.all([
        fetchVendors({ per_page: 100 }),
        fetchBarangs({ per_page: 200, sort_field: "nama", sort_dir: "asc" }),
      ])
      setVendors(v.data)
      setBarangs(b.data)
    } catch {
      toast.error("Gagal memuat data")
    }
  }, [])

  useEffect(() => { loadRefs() }, [loadRefs])

  const onVendorChange = useCallback(async (v: string) => {
    setVendorId(v)
    setVendorPrices([])
    if (v) {
      try {
        const res = await fetchHargaSuppliers({ vendor_id: v, per_page: 500 })
        setVendorPrices(res.data)
      } catch {}
    }
  }, [])

  function getHarga(barang: Barang): number {
    const hp = vendorPrices.find((p) => p.barang_id === barang.id)
    if (hp) return Number(hp.harga_beli)
    return Number(barang.harga_beli) || 0
  }

  const filteredBarangs = barangs.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.kode.toLowerCase().includes(q) || b.nama.toLowerCase().includes(q)
  })

  function toggleSelect(barangId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(barangId)) next.delete(barangId)
      else next.add(barangId)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredBarangs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredBarangs.map((b) => b.id)))
    }
  }

  function applyBulkHarga() {
    const harga = parseInt(bulkHarga.replace(/\D/g, ""), 10)
    if (isNaN(harga) || harga < 0 || selectedIds.size === 0) return

    setItems((prev) => {
      const existing = new Map(prev.map((i) => [i.barang_id, i]))
      for (const barangId of selectedIds) {
        if (!existing.has(barangId)) {
          const b = barangs.find((x) => x.id === barangId)
          if (b) {
            existing.set(barangId, {
              barang_id: barangId,
              barang_nama: b.nama,
              barang_kode: b.kode,
              harga_lama: getHarga(b),
              harga_baru: String(harga),
              tempId: Math.random().toString(36).slice(2),
            })
          }
        }
      }
      return Array.from(existing.values())
    })
    setSelectedIds(new Set())
    setBulkHarga("")
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId))
    setDeleteItemId(null)
  }

  async function handleSubmit() {
    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (!vendorId) {
      toast.error("Pilih vendor")
      setStep(0)
      submitRef.current = false
      setSubmitting(false)
      return
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu barang")
      setStep(1)
      submitRef.current = false
      setSubmitting(false)
      return
    }
    try {
      const hu = await createHargaUpdate({
        vendor_id: vendorId,
        keterangan: keterangan.trim() || undefined,
        items: items.map((it) => ({
          barang_id: it.barang_id,
          harga_beli: parseInt(it.harga_baru, 10),
        })),
      })
      toast.success(`Harga berhasil diupdate (${hu.kode})`)
      router.push("/barang")
    } catch {
      toast.error("Gagal menyimpan update harga")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/barang")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Update Harga per Supplier</h1>
          <p className="text-muted-foreground">Perubahan harga per supplier akan tercatat dengan nomor dokumen otomatis</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckIcon className="size-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i <= step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>
      <Progress value={((step + 1) / steps.length) * 100} className="h-1" />

      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Pilih Supplier & Keterangan</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); setStep(1) }} className="space-y-4">
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="vendor_id">Supplier <span className="text-destructive">*</span></FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={vendors.map((v) => ({ value: v.id, label: `${v.kode} - ${v.nama}` }))}
                        value={vendorId}
                        onValueChange={onVendorChange}
                        placeholder="Pilih supplier..."
                        searchPlaceholder="Cari supplier..."
                      />
                    </FieldContent>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="keterangan">Alasan / Dasar Perubahan Harga</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="keterangan"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Contoh: harga dari supplier naik, penyesuaian harga pasar, dll."
                      rows={4}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
              {vendorId && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <span className="text-muted-foreground">Supplier terpilih: </span>
                  <span className="font-medium">{vendors.find((v) => v.id === vendorId)?.nama}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-muted-foreground">{vendorPrices.length} barang dengan harga khusus</span>
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={!vendorId}>
                  <ArrowRightIcon /> Selanjutnya: Items
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Barang & Tentukan Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari barang..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Harga untuk semua"
                    value={bulkHarga ? `Rp ${parseInt(bulkHarga.replace(/\D/g, ""), 10).toLocaleString("id-ID")}` : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "")
                      setBulkHarga(raw)
                    }}
                    className="h-9 w-44"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={applyBulkHarga}
                    disabled={!bulkHarga || selectedIds.size === 0}
                  >
                    Terapkan ke {selectedIds.size} terpilih
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={filteredBarangs.length > 0 && selectedIds.size === filteredBarangs.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Barang</TableHead>
                      <TableHead className="text-right">Harga Saat Ini</TableHead>
                      <TableHead className="text-right w-40">Harga Baru</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBarangs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Tidak ada barang
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBarangs.map((b) => {
                        const existing = items.find((i) => i.barang_id === b.id)
                        const hargaLama = getHarga(b)
                        return (
                          <TableRow key={b.id} className={selectedIds.has(b.id) ? "bg-muted/30" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(b.id)}
                                onCheckedChange={() => toggleSelect(b.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{b.nama}</div>
                              <div className="text-xs text-muted-foreground">{b.kode}</div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(hargaLama)}</TableCell>
                            <TableCell className="text-right">
                              {existing ? (
                                <span className="font-medium tabular-nums">{formatCurrency(parseInt(existing.harga_baru, 10))}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Daftar Yang Akan Diupdate ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Harga Lama</TableHead>
                    <TableHead className="text-right">Harga Baru</TableHead>
                    <TableHead className="text-right">Selisih</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Belum ada barang</TableCell></TableRow>
                  ) : (
                    items.map((item) => {
                      const baru = parseInt(item.harga_baru, 10)
                      const selisih = baru - item.harga_lama
                      return (
                        <TableRow key={item.tempId}>
                          <TableCell>
                            <div className="font-medium">{item.barang_nama}</div>
                            <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(item.harga_lama)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{formatCurrency(baru)}</TableCell>
                          <TableCell className={`text-right tabular-nums font-medium ${selisih >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {selisih >= 0 ? "+" : ""}{formatCurrency(selisih)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteItemId(item.tempId)}>
                              <Trash2Icon className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeftIcon /> Kembali: Supplier</Button>
            <Button onClick={() => setStep(2)} disabled={items.length === 0}>
              <ArrowRightIcon /> Selanjutnya: Review
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Review</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Supplier:</span>{" "}
                <span className="font-medium">{vendors.find((v) => v.id === vendorId)?.nama || "-"}</span>
              </div>
              {keterangan && (
                <div>
                  <span className="text-muted-foreground">Alasan Perubahan:</span>
                  <p className="mt-1 text-sm">{keterangan}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Jumlah Barang:</span>{" "}
                <span className="font-medium">{items.length} item</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Daftar Barang ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Harga Lama</TableHead>
                    <TableHead className="text-right">Harga Baru</TableHead>
                    <TableHead className="text-right">Selisih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const baru = parseInt(item.harga_baru, 10)
                    const selisih = baru - item.harga_lama
                    return (
                      <TableRow key={item.tempId}>
                        <TableCell>
                          <div className="font-medium">{item.barang_nama}</div>
                          <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(item.harga_lama)}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{formatCurrency(baru)}</TableCell>
                        <TableCell className={`text-right tabular-nums font-medium ${selisih >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {selisih >= 0 ? "+" : ""}{formatCurrency(selisih)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
              <ArrowLeftIcon /> Kembali: Items
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <SaveIcon />
              {submitting ? "Menyimpan..." : "Simpan Update Harga"}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteItemId} onOpenChange={(o) => { if (!o) setDeleteItemId(null) }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus item?</AlertDialogTitle>
            <AlertDialogDescription>Barang akan dihapus dari daftar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteItemId && removeItem(deleteItemId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
