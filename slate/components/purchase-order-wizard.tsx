"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
import { terbilang } from "@/lib/terbilang"
import { createPurchaseOrder, fetchPurchaseOrder, updatePurchaseOrder } from "@/lib/purchase-order-api"
import { createPOItem } from "@/lib/purchase-order-item-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { fetchProjects, type Project } from "@/lib/project-api"
import { fetchBarangs, fetchHargaSuppliers, type Barang, type HargaSupplier } from "@/lib/barang-api"
import { fetchJenisPajak, type JenisPajak } from "@/lib/jenis-pajak-api"
import { fetchSetting } from "@/lib/settings-api"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"

interface LineItem {
  id?: string
  barang_id: string
  barang_nama: string
  barang_kode: string
  jumlah: number
  harga_satuan: number
  diskon: number
  jenis_pajak_id: string
  jenis_pajak_nama: string
  jenis_pajak_persentase: number
  keterangan: string
  tempId: string
}

const steps = ["Header", "Items", "Review"]

export function PurchaseOrderWizard({ poId }: { poId?: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(!!poId)
  const isEdit = !!poId

  // References
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [pajaks, setPajaks] = useState<JenisPajak[]>([])
  const [vendorPrices, setVendorPrices] = useState<HargaSupplier[]>([])
  const [alamatList, setAlamatList] = useState<{ id: string; label: string; alamat: string; kota: string; provinsi: string }[]>([])

  // Step 1: Header
  const [vendorId, setVendorId] = useState("")
  const [clientId, setClientId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [tanggalPo, setTanggalPo] = useState(new Date().toISOString().split("T")[0])
  const [tanggalKirim, setTanggalKirim] = useState("")
  const [catatan, setCatatan] = useState("")
  const [syaratPembayaran, setSyaratPembayaran] = useState("")
  const [alamatKirim, setAlamatKirim] = useState("")

  // Step 2: Items
  const [items, setItems] = useState<LineItem[]>([])
  const [itemBarangId, setItemBarangId] = useState("")
  const [itemJumlah, setItemJumlah] = useState("1")
  const [itemHarga, setItemHarga] = useState("")
  const [itemDiskon, setItemDiskon] = useState("0")
  const [itemPajakId, setItemPajakId] = useState("")
  const [itemKeterangan, setItemKeterangan] = useState("")
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const loadRefs = useCallback(async () => {
    try {
      const [v, c, p, b, paj, settings] = await Promise.all([
        fetchVendors({ per_page: 100 }),
        fetchClients({ per_page: 100 }),
        fetchProjects({ per_page: 100 }),
        fetchBarangs({ per_page: 100 }),
        fetchJenisPajak({ per_page: 100 }),
        fetchSetting("general").catch(() => null),
      ])
      setVendors(v.data)
      setClients(c.data)
      setProjects(p.data)
      setBarangs(b.data)
      setPajaks(paj.data)
      setAlamatList((settings?.data?.alamat_kirim as { id: string; label: string; alamat: string; kota: string; provinsi: string }[]) || [])
    } catch {
      toast.error("Failed to load references")
    }
  }, [])

  // Load existing PO data for edit mode
  const loadPo = useCallback(async () => {
    if (!poId) return
    try {
      const po = await fetchPurchaseOrder(poId)
      setVendorId(po.vendor_id)
      if (po.vendor_id) {
        fetchHargaSuppliers({ vendor_id: po.vendor_id, per_page: 500 })
          .then((res) => setVendorPrices(res.data))
          .catch(() => {})
      }
      setClientId(po.client_id || "")
      setProjectId(po.project_id || "")
      setTanggalPo(po.tanggal_po.split("T")[0])
      setTanggalKirim(po.tanggal_kirim_expected?.split("T")[0] || "")
      setCatatan(po.catatan || "")
      setSyaratPembayaran(po.syarat_pembayaran || "")
      setAlamatKirim(po.alamat_kirim || "")
      if (po.items) {
        setItems(po.items.map((it) => ({
          id: it.id,
          barang_id: it.barang_id || "",
          barang_nama: it.barang?.nama || "",
          barang_kode: it.barang?.kode || "",
          jumlah: it.jumlah,
          harga_satuan: it.harga_satuan,
          diskon: it.diskon,
          jenis_pajak_id: it.jenis_pajak_id || "",
          jenis_pajak_nama: it.jenis_pajak?.nama || "",
          jenis_pajak_persentase: it.jenis_pajak?.persentase || 0,
          keterangan: it.keterangan || "",
          tempId: Math.random().toString(36).slice(2),
        })))
      }
    } catch {
      toast.error("Failed to load purchase order")
      router.push("/purchase-order")
    } finally {
      setLoading(false)
    }
  }, [poId, router])

  useEffect(() => { loadRefs() }, [loadRefs])
  useEffect(() => { if (poId) loadPo() }, [loadPo, poId])

  const selectedBarang = barangs.find((b) => b.id === itemBarangId)

  function addItem() {
    if (!itemBarangId || !itemJumlah || !itemHarga) {
      toast.error("Please select barang, quantity, and price")
      return
    }
    const pajak = pajaks.find((p) => p.id === itemPajakId)
    const newItem: LineItem = {
      barang_id: itemBarangId,
      barang_nama: selectedBarang?.nama || "",
      barang_kode: selectedBarang?.kode || "",
      jumlah: parseInt(itemJumlah) || 1,
      harga_satuan: parseFloat(itemHarga) || 0,
      diskon: parseFloat(itemDiskon) || 0,
      jenis_pajak_id: itemPajakId,
      jenis_pajak_nama: pajak?.nama || "",
      jenis_pajak_persentase: pajak?.persentase || 0,
      keterangan: itemKeterangan,
      tempId: Math.random().toString(36).slice(2),
    }
    setItems((prev) => [...prev, newItem])
    setItemBarangId("")
    setItemJumlah("1")
    setItemHarga("")
    setItemDiskon("0")
    setItemPajakId("")
    setItemKeterangan("")
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId))
    setDeleteItemId(null)
  }

  const subtotalKomputer = useMemo(() => {
    return items.reduce((sum, item) => {
      const sub = (item.jumlah * item.harga_satuan) - item.diskon
      return sum + sub
    }, 0)
  }, [items])

  const totalPajak = useMemo(() => {
    return items.reduce((sum, item) => {
      const sub = (item.jumlah * item.harga_satuan) - item.diskon
      const pajak = sub * item.jenis_pajak_persentase / 100
      return sum + pajak
    }, 0)
  }, [items])

  const grandTotal = subtotalKomputer + totalPajak

  const currency = (val: number) =>
    `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

  async function handleSubmit() {
    if (!vendorId) {
      toast.error("Please select vendor")
      setStep(0)
      return
    }
    if (items.length === 0) {
      toast.error("Please add at least one item")
      setStep(1)
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        vendor_id: vendorId,
        client_id: clientId || undefined,
        project_id: projectId || undefined,
        tanggal_po: tanggalPo,
        tanggal_kirim_expected: tanggalKirim || undefined,
        catatan: catatan.trim() || undefined,
        syarat_pembayaran: syaratPembayaran.trim() || undefined,
        alamat_kirim: alamatKirim.trim() || undefined,
        items: items.map((it) => ({
          ...(it.id ? { id: it.id } : {}),
          barang_id: it.barang_id,
          jumlah: it.jumlah,
          harga_satuan: it.harga_satuan,
          diskon: it.diskon,
          jenis_pajak_id: it.jenis_pajak_id || undefined,
          keterangan: it.keterangan || undefined,
        })),
      }

      if (isEdit && poId) {
        await updatePurchaseOrder(poId, payload)
        toast.success("Purchase order updated")
        router.push(`/purchase-order/${poId}`)
      } else {
        const po = await createPurchaseOrder({
          vendor_id: vendorId,
          client_id: clientId || undefined,
          project_id: projectId || undefined,
          tanggal_po: tanggalPo,
          tanggal_kirim_expected: tanggalKirim || undefined,
          catatan: catatan.trim() || undefined,
          syarat_pembayaran: syaratPembayaran.trim() || undefined,
          alamat_kirim: alamatKirim.trim() || undefined,
        })

        for (const item of items) {
          await createPOItem(po.id, {
            barang_id: item.barang_id,
            jumlah: item.jumlah,
            harga_satuan: item.harga_satuan,
            diskon: item.diskon,
            jenis_pajak_id: item.jenis_pajak_id || undefined,
            keterangan: item.keterangan || undefined,
          })
        }

        toast.success("Purchase order created")
        router.push(`/purchase-order/${po.id}`)
      }
    } catch {
      toast.error(isEdit ? "Failed to update purchase order" : "Failed to create purchase order")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Loading...</span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(isEdit ? `/purchase-order/${poId}` : "/purchase-order")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Purchase Order" : "New Purchase Order"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update purchase order details" : "Create a new purchase order"}</p>
        </div>
      </div>

      {/* Stepper */}
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

      {/* Step 1: Header */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>PO Header</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); setStep(1) }} className="space-y-4">
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="vendor_id">Vendor *</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={vendors.map((v) => ({ value: v.id, label: `${v.kode} - ${v.nama}` }))}
                        value={vendorId}
                        onValueChange={async (v) => {
                          setVendorId(v)
                          if (v) {
                            try {
                              const res = await fetchHargaSuppliers({ vendor_id: v, per_page: 500 })
                              setVendorPrices(res.data)
                            } catch {
                              setVendorPrices([])
                            }
                          } else {
                            setVendorPrices([])
                          }
                        }}
                        placeholder="Pilih vendor..."
                        searchPlaceholder="Cari vendor..."
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="client_id">Client</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={clients.map((c) => ({ value: c.id, label: `${c.kode} - ${c.nama}` }))}
                        value={clientId}
                        onValueChange={(v) => { setClientId(v); setProjectId("") }}
                        placeholder="Opsional..."
                        searchPlaceholder="Cari client..."
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="project_id">Project</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={projects.filter((p) => !clientId || p.client_id === clientId).map((p) => ({ value: p.id, label: `${p.kode} - ${p.nama}` }))}
                        value={projectId}
                        onValueChange={(v) => setProjectId(v)}
                        placeholder="Opsional..."
                        searchPlaceholder="Cari project..."
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tanggal_po">Tanggal PO *</FieldLabel>
                    <FieldContent>
                      <Input id="tanggal_po" type="date" value={tanggalPo} onChange={(e) => setTanggalPo(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="tanggal_kirim">Expected Delivery</FieldLabel>
                    <FieldContent>
                      <Input id="tanggal_kirim" type="date" value={tanggalKirim} onChange={(e) => setTanggalKirim(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="syarat_pembayaran">Syarat Pembayaran</FieldLabel>
                    <FieldContent>
                      <Input id="syarat_pembayaran" value={syaratPembayaran} onChange={(e) => setSyaratPembayaran(e.target.value)} placeholder="e.g. 30 days" />
                    </FieldContent>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="alamat_kirim">Alamat Kirim</FieldLabel>
                  <FieldContent>
                    <Combobox
                      options={[
                        { value: "_custom", label: "Tulis manual..." },
                        ...alamatList.map((a) => ({ value: a.id, label: `${a.label}: ${a.alamat}, ${a.kota}` })),
                      ]}
                      value={alamatList.some((a) => a.id === alamatKirim) ? alamatKirim : "_custom"}
                      onValueChange={(v) => {
                        if (v === "_custom") {
                          setAlamatKirim("")
                        } else {
                          const a = alamatList.find((al) => al.id === v)
                          setAlamatKirim(a ? `${a.alamat}, ${a.kota}, ${a.provinsi}`.replace(/(^, |, $)/g, "") : "")
                        }
                      }}
                      placeholder="Pilih alamat..."
                      searchPlaceholder="Cari alamat..."
                    />
                    {!alamatList.some((a) => a.id === alamatKirim) && (
                      <Textarea
                        className="mt-2"
                        value={alamatKirim}
                        onChange={(e) => setAlamatKirim(e.target.value)}
                        placeholder="Atau tulis alamat manual..."
                      />
                    )}
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="catatan">Catatan</FieldLabel>
                  <FieldContent>
                    <Textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <div className="flex justify-end">
                <Button type="submit"><ArrowRightIcon /> Next: Items</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Items */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Item</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-10">
                  <Field className="md:col-span-4">
                    <FieldLabel htmlFor="barang_id">Barang</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={barangs.map((b) => ({ value: b.id, label: `${b.kode} - ${b.nama} (Stok: ${b.stok} ${b.unit?.singkatan || ''})` }))}
                        value={itemBarangId}
                        onValueChange={(v) => {
                          setItemBarangId(v)
                          const b = barangs.find((bar) => bar.id === v)
                          const hp = vendorPrices.find((p) => p.barang_id === v)
                          const harga = hp?.harga_beli ?? b?.harga_beli
                          if (harga) setItemHarga(Math.round(Number(harga)).toString())
                        }}
                        placeholder="Pilih barang..."
                        searchPlaceholder="Cari barang..."
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-1">
                    <FieldLabel htmlFor="item_jumlah">Jumlah</FieldLabel>
                    <FieldContent>
                      <Input id="item_jumlah" type="number" min="1" value={itemJumlah} onChange={(e) => setItemJumlah(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="item_harga">Harga Satuan</FieldLabel>
                    <FieldContent>
                      <Input id="item_harga" type="number" step="1" value={itemHarga} onChange={(e) => setItemHarga(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-1">
                    <FieldLabel htmlFor="item_diskon">Diskon</FieldLabel>
                    <FieldContent>
                      <Input id="item_diskon" type="number" step="1" value={itemDiskon} onChange={(e) => setItemDiskon(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="item_pajak">Jenis Pajak</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={pajaks.map((p) => ({ value: p.id, label: `${p.nama} (${p.persentase}%)` }))}
                        value={itemPajakId}
                        onValueChange={(v) => setItemPajakId(v)}
                        placeholder="Tidak ada pajak"
                        searchPlaceholder="Cari pajak..."
                      />
                    </FieldContent>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="item_keterangan">Keterangan</FieldLabel>
                  <FieldContent>
                    <Input id="item_keterangan" value={itemKeterangan} onChange={(e) => setItemKeterangan(e.target.value)} />
                  </FieldContent>
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={addItem} disabled={!itemBarangId}>
                  <PlusIcon /> Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Diskon</TableHead>
                    <TableHead className="text-right">Pajak</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No items yet</TableCell></TableRow>
                  ) : (
                    items.map((item) => {
                      const sub = (item.jumlah * item.harga_satuan) - item.diskon
                      const pajak = sub * item.jenis_pajak_persentase / 100
                      return (
                        <TableRow key={item.tempId}>
                          <TableCell>
                            <div className="font-medium">{item.barang_nama}</div>
                            <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.jumlah}</TableCell>
                          <TableCell className="text-right">{currency(item.harga_satuan)}</TableCell>
                          <TableCell className="text-right">{item.diskon > 0 ? currency(item.diskon) : "-"}</TableCell>
                          <TableCell className="text-right">{pajak > 0 ? currency(pajak) : "-"}</TableCell>
                          <TableCell className="text-right font-medium">{currency(sub + pajak)}</TableCell>
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
            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeftIcon /> Back: Header</Button>
            <Button onClick={() => setStep(2)} disabled={items.length === 0}>
              <ArrowRightIcon /> Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Review PO</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <div><span className="text-muted-foreground">Vendor:</span> {vendors.find((v) => v.id === vendorId)?.nama || "-"}</div>
                <div><span className="text-muted-foreground">Tanggal PO:</span> {tanggalPo}</div>
                <div><span className="text-muted-foreground">Client:</span> {clients.find((c) => c.id === clientId)?.nama || "-"}</div>
                <div><span className="text-muted-foreground">Project:</span> {projects.find((p) => p.id === projectId)?.nama || "-"}</div>
                {tanggalKirim && <div><span className="text-muted-foreground">Expected Delivery:</span> {tanggalKirim}</div>}
                {syaratPembayaran && <div><span className="text-muted-foreground">Syarat Pembayaran:</span> {syaratPembayaran}</div>}
              </div>
              {alamatKirim && <div><span className="text-muted-foreground">Alamat Kirim:</span> {alamatKirim}</div>}
              {catatan && <div><span className="text-muted-foreground">Catatan:</span> {catatan}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Diskon</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Pajak</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const sub = (item.jumlah * item.harga_satuan) - item.diskon
                    const pajak = sub * item.jenis_pajak_persentase / 100
                    return (
                      <TableRow key={item.tempId}>
                        <TableCell>
                          <div className="font-medium">{item.barang_nama}</div>
                          <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.jumlah}</TableCell>
                        <TableCell className="text-right">{currency(item.harga_satuan)}</TableCell>
                        <TableCell className="text-right">{item.diskon > 0 ? currency(item.diskon) : "-"}</TableCell>
                        <TableCell className="text-right">{currency(sub)}</TableCell>
                        <TableCell className="text-right">{pajak > 0 ? currency(pajak) : "-"}</TableCell>
                        <TableCell className="text-right font-medium">{currency(sub + pajak)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1 text-sm">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{currency(subtotalKomputer)}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Total Pajak:</span>
                <span className="font-medium">{currency(totalPajak)}</span>
              </div>
              <div className="flex gap-4 text-base">
                <span className="font-semibold">Grand Total:</span>
                <span className="font-bold">{currency(grandTotal)}</span>
                <span className="font-bold">- {terbilang(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
              <ArrowLeftIcon /> Back: Items
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <SaveIcon />
              {submitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update PO" : "Create PO")}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteItemId} onOpenChange={(o) => { if (!o) setDeleteItemId(null) }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Remove item?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the item from the PO.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteItemId && removeItem(deleteItemId)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
