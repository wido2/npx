"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  SearchIcon,
  SaveIcon,
  LoaderIcon,
  BanknoteIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"
import {
  fetchBarangs, updateBarang, bulkUpdateHarga,
  type Barang,
} from "@/lib/barang-api"
import { cn, formatCurrency } from "@/lib/utils"

export function HargaUpdateForm() {
  const [mode, setMode] = useState("single")

  // Single mode
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [barangsLoading, setBarangsLoading] = useState(false)
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null)
  const [hargaBaru, setHargaBaru] = useState("")
  const [submittingSingle, setSubmittingSingle] = useState(false)

  // Massal mode
  const [data, setData] = useState<Barang[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({})
  const [submittingMassal, setSubmittingMassal] = useState(false)
  const [result, setResult] = useState<{ message: string; updated: number; errors: { id: string; message: string }[] } | null>(null)

  // Load barangs for combobox
  useEffect(() => {
    setBarangsLoading(true)
    fetchBarangs({ per_page: 200, sort_field: "nama", sort_dir: "asc" })
      .then((res) => setBarangs(res.data))
      .catch(() => toast.error("Gagal memuat barang"))
      .finally(() => setBarangsLoading(false))
  }, [])

  // Load barangs for massal table
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = "nama"
      const sortDir = "asc"
      const res = await fetchBarangs({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search,
        sort_field: sortField,
        sort_dir: sortDir,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, search])

  useEffect(() => { loadData() }, [loadData])

  // Single submit
  async function handleSingleSubmit() {
    if (!selectedBarang) return
    const harga = parseInt(hargaBaru.replace(/\D/g, ""), 10)
    if (isNaN(harga) || harga < 0) {
      toast.error("Harga tidak valid")
      return
    }
    setSubmittingSingle(true)
    try {
      await updateBarang(selectedBarang.id, {
        kode: selectedBarang.kode,
        nama: selectedBarang.nama,
        kategori_id: selectedBarang.kategori_id ?? undefined,
        unit_id: selectedBarang.unit_id ?? undefined,
        harga_beli: harga,
        stok: selectedBarang.stok,
        stok_minimum: selectedBarang.stok_minimum,
        aktif: selectedBarang.aktif,
      })
      toast.success(`Harga ${selectedBarang.nama} berhasil diupdate`)
      setSelectedBarang(null)
      setHargaBaru("")
    } catch {
      toast.error("Gagal update harga")
    } finally {
      setSubmittingSingle(false)
    }
  }

  // Massal submit
  async function handleMassalSubmit() {
    const items = Object.entries(editedPrices)
      .map(([id, price]) => ({ id, harga_beli: parseInt(price.replace(/\D/g, ""), 10) }))
      .filter((i) => !isNaN(i.harga_beli) && i.harga_beli >= 0)

    if (items.length === 0) {
      toast.error("Tidak ada perubahan harga")
      return
    }

    setSubmittingMassal(true)
    setResult(null)
    try {
      const res = await bulkUpdateHarga(items)
      setResult(res)
      toast.success(res.message)
      setEditedPrices({})
      loadData()
    } catch {
      toast.error("Gagal update harga massal")
    } finally {
      setSubmittingMassal(false)
    }
  }

  const formatRp = (val: number | null | undefined) =>
    formatCurrency(val)

  const pageCount = Math.ceil(total / pagination.pageSize)

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Update Harga Barang</h1>
        <p className="text-muted-foreground">Update harga beli barang secara single atau massal</p>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="massal">Massal</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6 space-y-6">
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label>Barang</Label>
              <Combobox
                options={barangs.map((b) => ({ value: b.id, label: `${b.kode} — ${b.nama}` }))}
                value={selectedBarang?.id || ""}
                onValueChange={(v) => {
                  const b = barangs.find((x) => x.id === v) || null
                  setSelectedBarang(b)
                  setHargaBaru(b ? String(b.harga_beli ?? "") : "")
                }}
                placeholder="Cari barang..."
                searchPlaceholder="Cari barang..."
              />
            </div>

            {selectedBarang && (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Beli Saat Ini</span>
                    <span className="font-semibold tabular-nums">{formatRp(selectedBarang.harga_beli)}</span>
                  </div>
                  {selectedBarang.kategori && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kategori</span>
                      <span>{selectedBarang.kategori.nama}</span>
                    </div>
                  )}
                  {selectedBarang.unit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Satuan</span>
                      <span>{selectedBarang.unit.singkatan}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harga_baru">Harga Beli Baru</Label>
                  <div className="relative">
                    <BanknoteIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="harga_baru"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={hargaBaru ? `Rp ${parseInt(hargaBaru.replace(/\D/g, ""), 10).toLocaleString("id-ID")}` : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "")
                        setHargaBaru(raw)
                      }}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>

                <Button onClick={handleSingleSubmit} disabled={submittingSingle || !hargaBaru}>
                  {submittingSingle ? <LoaderIcon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
                  Simpan
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="massal" className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
                className="h-8 w-full pl-8"
              />
            </div>
            <Button onClick={handleMassalSubmit} disabled={submittingMassal || Object.keys(editedPrices).length === 0}>
              {submittingMassal ? <LoaderIcon className="size-4 animate-spin" /> : <SaveIcon className="size-4" />}
              Simpan ({Object.keys(editedPrices).length} perubahan)
            </Button>
          </div>

          {result && (
            <div className={cn("rounded-lg border p-3 text-sm flex items-center gap-2", result.errors.length > 0 ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950" : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950")}>
              {result.errors.length > 0 ? <XCircleIcon className="size-4 text-yellow-600" /> : <CheckCircle2Icon className="size-4 text-emerald-600" />}
              <span>{result.message}</span>
              {result.errors.length > 0 && (
                <span className="text-muted-foreground"> — {result.errors.length} error</span>
              )}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Harga Lama</TableHead>
                  <TableHead className="text-right">Harga Baru</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Tidak ada barang</TableCell></TableRow>
                ) : (
                  data.map((barang) => {
                    const edited = editedPrices[barang.id]
                    const editedValue = edited ? parseInt(edited.replace(/\D/g, ""), 10) : null
                    const hasChange = editedValue !== null && editedValue !== (barang.harga_beli ?? 0)
                    return (
                      <TableRow key={barang.id} className={cn(hasChange && "bg-amber-50 dark:bg-amber-950")}>
                        <TableCell className="text-xs">{barang.kode}</TableCell>
                        <TableCell className="font-medium">{barang.nama}</TableCell>
                        <TableCell>{barang.kategori?.nama || "-"}</TableCell>
                        <TableCell>{barang.unit?.singkatan || "-"}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatRp(barang.harga_beli)}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={formatRp(barang.harga_beli)}
                            value={edited || ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "")
                              setEditedPrices((prev) => {
                                const next = { ...prev }
                                if (raw) next[barang.id] = raw
                                else delete next[barang.id]
                                return next
                              })
                            }}
                            className={cn("h-8 w-32 text-right tabular-nums ml-auto", hasChange && "border-amber-400")}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4">
            <div className="text-sm text-muted-foreground">{total} total barang</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Rows</Label>
                <Select
                  value={`${pagination.pageSize}`}
                  onValueChange={(value) => setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))}
                >
                  <SelectTrigger size="sm" className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[10, 20, 50, 100].map((ps) => (
                        <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm">
                Page {pagination.pageIndex + 1} of {pageCount || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-8" disabled={pagination.pageIndex === 0} onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}>
                  Prev
                </Button>
                <Button variant="outline" size="icon" className="size-8" disabled={pagination.pageIndex + 1 >= pageCount} onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
