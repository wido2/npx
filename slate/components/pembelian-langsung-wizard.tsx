"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Combobox } from "@/components/ui/combobox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { createPembelianLangsung, updatePembelianLangsung, type PembelianLangsung } from "@/lib/pembelian-langsung-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { fetchBarangs, type Barang } from "@/lib/barang-api"
import { fetchKaryawans, type Karyawan } from "@/lib/karyawan-api"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"

interface LineItem {
  barang_id: string
  barang_nama: string
  barang_kode: string
  barang_satuan: string
  jumlah: number
  harga_satuan: number
  keterangan: string
  tempId: string
}

const steps = ["Header", "Items", "Upload", "Review"]
const MAX_ATTACHMENTS = 5
const MAX_FILE_SIZE = 3 * 1024 * 1024

interface Props {
  editData?: PembelianLangsung | null
}

let tempIdCounter = 0

export function PembelianLangsungWizard({ editData }: Props) {
  const router = useRouter()
  const { user, can } = useAuth()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [karyawans, setKaryawans] = useState<Karyawan[]>([])

  const [vendorId, setVendorId] = useState("")
  const [karyawanId, setKaryawanId] = useState("")
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0])
  const [catatan, setCatatan] = useState("")

  const [items, setItems] = useState<LineItem[]>([])
  const [itemBarangId, setItemBarangId] = useState("")
  const [itemJumlah, setItemJumlah] = useState("1")
  const [itemHarga, setItemHarga] = useState("")
  const [itemKeterangan, setItemKeterangan] = useState("")

  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<{ id: string; nama_file: string; url: string }[]>([])
  const [deleteAttachmentIds, setDeleteAttachmentIds] = useState<string[]>([])

  useEffect(() => {
    if (editData) {
      setVendorId(editData.vendor_id)
      setKaryawanId(editData.karyawan_id ?? "")
      setTanggal(editData.tanggal.split("T")[0])
      setCatatan(editData.catatan ?? "")
      setItems(
        (editData.items || []).map((i) => ({
          barang_id: i.barang_id,
          barang_nama: i.barang?.nama ?? "",
          barang_kode: i.barang?.kode ?? "",
          barang_satuan: (i as any).barang?.unit?.singkatan ?? (i as any).barang?.unit?.nama ?? "",
          jumlah: i.jumlah,
          harga_satuan: Number(i.harga_satuan),
          keterangan: i.keterangan ?? "",
          tempId: `existing-${i.id}`,
        })),
      )
      setExistingAttachments(
        (editData.attachments || []).map((a) => ({
          id: a.id,
          nama_file: a.nama_file,
          url: a.url,
        })),
      )
    }
  }, [editData])

  useEffect(() => {
    if (user && !can("pl.create") && !editData) {
      toast.error("Anda tidak memiliki izin")
      router.push("/pembelian-langsung")
    }
    if (user && !can("pl.edit") && editData) {
      toast.error("Anda tidak memiliki izin")
      router.push("/pembelian-langsung")
    }
  }, [user, can, router, editData])

  const loadRefs = useCallback(async () => {
    try {
      const [v, b, k] = await Promise.all([
        fetchVendors({ per_page: 100 }),
        fetchBarangs({ per_page: 100 }),
        fetchKaryawans({ per_page: 100 }),
      ])
      setVendors(v.data)
      setBarangs(b.data)
      setKaryawans(k.data)
      if (!editData && b.data.length > 0) {
        const first = b.data[0]
        setItemBarangId(first.id)
      }
    } catch {
      toast.error("Gagal memuat data referensi")
    }
  }, [editData])

  useEffect(() => { loadRefs() }, [loadRefs])

  function addItem() {
    if (!itemBarangId) { toast.warning("Pilih barang"); return }
    const qty = parseInt(itemJumlah)
    if (!qty || qty < 1) { toast.warning("Jumlah harus ≥ 1"); return }
    const harga = parseFloat(itemHarga)
    if (isNaN(harga) || harga < 0) { toast.warning("Harga satuan tidak valid"); return }

    const barang = barangs.find((b) => b.id === itemBarangId)
    if (!barang) return

    tempIdCounter++
    setItems((prev) => [
      ...prev,
      {
        barang_id: itemBarangId,
        barang_nama: barang.nama,
        barang_kode: barang.kode,
        barang_satuan: barang.unit?.singkatan ?? barang.unit?.nama ?? "",
        jumlah: qty,
        harga_satuan: harga,
        keterangan: itemKeterangan,
        tempId: `new-${tempIdCounter}`,
      },
    ])
    setItemJumlah("1")
    setItemHarga("")
    setItemKeterangan("")
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId))
  }

  function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const totalNew = attachments.length + (editData ? existingAttachments.length - deleteAttachmentIds.length : 0) + files.length
    if (totalNew > MAX_ATTACHMENTS) {
      toast.warning(`Maksimal ${MAX_ATTACHMENTS} attachment`)
      return
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        toast.warning(`File ${f.name} melebihi 3MB`)
        continue
      }
      if (!f.type.startsWith("image/")) {
        toast.warning(`${f.name} bukan gambar`)
        continue
      }
      setAttachments((prev) => [...prev, f])
    }
    e.target.value = ""
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  function removeExistingAttachment(id: string) {
    setDeleteAttachmentIds((prev) => [...prev, id])
  }

  function restoreExistingAttachment(id: string) {
    setDeleteAttachmentIds((prev) => prev.filter((i) => i !== id))
  }

  function canGoNext(): boolean {
    if (step === 0) return vendorId !== "" && tanggal !== ""
    if (step === 1) return items.length > 0
    return true
  }

  function renderAttachmentPreview(file: File) {
    return URL.createObjectURL(file)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payloadItems = items.map((i) => ({
        barang_id: i.barang_id,
        jumlah: i.jumlah,
        harga_satuan: i.harga_satuan,
        keterangan: i.keterangan || undefined,
      }))

      if (editData) {
        await updatePembelianLangsung(editData.id, {
          vendor_id: vendorId,
          karyawan_id: karyawanId || null,
          tanggal,
          catatan: catatan || null,
          items: payloadItems,
          attachments: attachments.length > 0 ? attachments : undefined,
        })
        toast.success("Pembelian langsung diupdate")
      } else {
        await createPembelianLangsung({
          vendor_id: vendorId,
          karyawan_id: karyawanId || undefined,
          tanggal,
          catatan: catatan || undefined,
          items: payloadItems,
          attachments: attachments.length > 0 ? attachments : undefined,
        })
        toast.success("Pembelian langsung berhasil dibuat")
      }
      router.push("/pembelian-langsung")
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan")
    } finally {
      setSubmitting(false)
    }
  }

  const existingAttachmentsCount = existingAttachments.length - deleteAttachmentIds.length

  return (
    <div className="w-full space-y-6">
      <Progress value={((step + 1) / steps.length) * 100} className="h-1" />

      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled
            className={`text-xs font-medium transition-colors ${
              i === step ? "text-foreground" : i < step ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Header */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembelian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Vendor <span className="text-destructive">*</span></FieldLabel>
              <FieldContent>
                <Combobox
                  placeholder="Cari vendor..."
                  value={vendorId}
                  onValueChange={setVendorId}
                  options={vendors.map((v) => ({ value: v.id, label: `${v.kode} - ${v.nama}` }))}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Dibeli Oleh</FieldLabel>
              <FieldContent>
                <Combobox
                  placeholder="Cari karyawan..."
                  value={karyawanId}
                  onValueChange={setKaryawanId}
                  options={karyawans.map((k) => ({ value: k.id, label: k.nama }))}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Tanggal <span className="text-destructive">*</span></FieldLabel>
              <FieldContent>
                <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Catatan</FieldLabel>
              <FieldContent>
                <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Items */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Item Barang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <Field>
                  <FieldLabel>Barang</FieldLabel>
                  <FieldContent>
                    <Combobox
                      placeholder="Cari barang..."
                      value={itemBarangId}
                      onValueChange={(val) => {
                        setItemBarangId(val)
                        const barang = barangs.find((b) => b.id === val)
                        if (barang && !itemHarga) {
                          setItemHarga(String(barang.harga_beli || ""))
                        }
                      }}
                      options={barangs.map((b) => ({ value: b.id, label: `${b.kode} - ${b.nama}` }))}
                    />
                  </FieldContent>
                </Field>
              </div>
              <div className="w-24">
                <Field>
                  <FieldLabel>Jumlah</FieldLabel>
                  <FieldContent>
                    <Input type="number" min="1" value={itemJumlah} onChange={(e) => setItemJumlah(e.target.value)} />
                  </FieldContent>
                </Field>
              </div>
              <div className="w-32">
                <Field>
                  <FieldLabel>Harga Satuan</FieldLabel>
                  <FieldContent>
                    <Input type="number" min="0" step="100" value={itemHarga} onChange={(e) => setItemHarga(e.target.value)} placeholder="0" />
                  </FieldContent>
                </Field>
              </div>
              <div className="w-40">
                <Field>
                  <FieldLabel>Keterangan</FieldLabel>
                  <FieldContent>
                    <Input value={itemKeterangan} onChange={(e) => setItemKeterangan(e.target.value)} placeholder="(opsional)" />
                  </FieldContent>
                </Field>
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={addItem}>
                <PlusIcon /> Tambah
              </Button>
            </div>

            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Harga Satuan</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Ket</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell className="text-xs">{item.barang_kode} - {item.barang_nama}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.barang_satuan || "-"}</TableCell>
                      <TableCell>{new Intl.NumberFormat("id-ID").format(item.harga_satuan)}</TableCell>
                      <TableCell>{new Intl.NumberFormat("id-ID").format(item.jumlah * item.harga_satuan)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.keterangan || "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => removeItem(item.tempId)}>
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada item. Tambahkan barang di atas.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Bukti Pembelian (maks. {MAX_ATTACHMENTS} gambar @{MAX_FILE_SIZE / 1024 / 1024}MB)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="relative" disabled={(attachments.length + existingAttachmentsCount) >= MAX_ATTACHMENTS}>
                <UploadIcon /> Pilih Gambar
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleAttachmentUpload}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {attachments.length + existingAttachmentsCount} / {MAX_ATTACHMENTS} file
              </span>
            </div>

            {existingAttachments.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {existingAttachments
                  .filter((a) => !deleteAttachmentIds.includes(a.id))
                  .map((a) => (
                    <div key={a.id} className="group relative aspect-square rounded-md border overflow-hidden">
                      <img src={a.url} alt={a.nama_file} className="size-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeExistingAttachment(a.id)}
                      >
                        <XIcon className="size-3" />
                      </button>
                      <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-4 text-[10px] text-white">
                        {a.nama_file}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {deleteAttachmentIds.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Akan dihapus:</p>
                <div className="grid grid-cols-5 gap-2">
                  {existingAttachments
                    .filter((a) => deleteAttachmentIds.includes(a.id))
                    .map((a) => (
                      <div key={a.id} className="group relative aspect-square rounded-md border overflow-hidden opacity-50">
                        <img src={a.url} alt={a.nama_file} className="size-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-green-500 text-white"
                          onClick={() => restoreExistingAttachment(a.id)}
                        >
                          <CheckIcon className="size-3" />
                        </button>
                        <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-4 text-[10px] text-white">
                          {a.nama_file}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {attachments.map((f, i) => (
                  <div key={i} className="group relative aspect-square rounded-md border overflow-hidden">
                    <img src={renderAttachmentPreview(f)} alt={f.name} className="size-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removeAttachment(i)}
                    >
                      <XIcon className="size-3" />
                    </button>
                    <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-4 text-[10px] text-white">
                      {f.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <p><span className="font-medium">Vendor:</span> {vendors.find((v) => v.id === vendorId)?.nama || "-"}</p>
              <p><span className="font-medium">Dibeli Oleh:</span> {karyawans.find((k) => k.id === karyawanId)?.nama || "-"}</p>
              <p><span className="font-medium">Tanggal:</span> {new Date(tanggal).toLocaleDateString("id-ID")}</p>
              {catatan && <p><span className="font-medium">Catatan:</span> {catatan}</p>}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Harga Satuan</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.tempId}>
                    <TableCell className="text-xs">{item.barang_kode} - {item.barang_nama}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>{new Intl.NumberFormat("id-ID").format(item.harga_satuan)}</TableCell>
                    <TableCell>{new Intl.NumberFormat("id-ID").format(item.jumlah * item.harga_satuan)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end font-medium text-sm">
              Total: {new Intl.NumberFormat("id-ID").format(items.reduce((sum, i) => sum + i.jumlah * i.harga_satuan, 0))}
            </div>

            {(attachments.length > 0 || existingAttachmentsCount > 0) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attachment ({attachments.length + existingAttachmentsCount})</p>
                <div className="flex flex-wrap gap-2">
                  {existingAttachments.filter((a) => !deleteAttachmentIds.includes(a.id)).map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                      <CheckIcon className="size-3 text-green-500" />
                      {a.nama_file}
                    </div>
                  ))}
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                      <CheckIcon className="size-3 text-green-500" />
                      {f.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeftIcon /> Sebelumnya
        </Button>
        {step < steps.length - 1 ? (
          <Button size="sm" disabled={!canGoNext()} onClick={() => setStep((s) => s + 1)}>
            Selanjutnya <ArrowRightIcon />
          </Button>
        ) : (
          <Button size="sm" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Menyimpan..." : <><SaveIcon /> {editData ? "Update" : "Simpan"}</>}
          </Button>
        )}
      </div>
    </div>
  )
}
