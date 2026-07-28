"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

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
import { createPengambilanBarang } from "@/lib/pengambilan-barang-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { fetchProjects, type Project } from "@/lib/project-api"
import { fetchBarangs, type Barang } from "@/lib/barang-api"
import { fetchKaryawans, type Karyawan } from "@/lib/karyawan-api"
import { AddKaryawanSheet } from "@/components/add-karyawan-sheet"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"

interface LineItem {
  barang_id: string
  barang_nama: string
  barang_kode: string
  barang_unit: string
  stok_tersedia: number
  jumlah: number
  keterangan: string
  tempId: string
}

const steps = ["Header", "Items", "Review"]

export function PengambilanBarangWizard() {
  const router = useRouter()
  const { user, can } = useAuth()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)

  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [barangs, setBarangs] = useState<Barang[]>([])
  const [karyawans, setKaryawans] = useState<Karyawan[]>([])

  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0])
  const [clientId, setClientId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [karyawanId, setKaryawanId] = useState("")
  const [keterangan, setKeterangan] = useState("")

  const [items, setItems] = useState<LineItem[]>([])
  const [itemBarangId, setItemBarangId] = useState("")
  const [itemJumlah, setItemJumlah] = useState("1")
  const [itemKeterangan, setItemKeterangan] = useState("")
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const [karyawanSheetOpen, setKaryawanSheetOpen] = useState(false)

  useEffect(() => {
    if (user && !can("pb.create")) {
      toast.error("Anda tidak memiliki izin membuat PB")
      router.push("/pengambilan-barang")
    }
  }, [user, can, router])

  const loadRefs = useCallback(async () => {
    try {
      const [c, p, b, k] = await Promise.all([
        fetchClients({ per_page: 100 }),
        fetchProjects({ per_page: 100 }),
        fetchBarangs({ per_page: 100 }),
        fetchKaryawans({ per_page: 100 }),
      ])
      setClients(c.data)
      setProjects(p.data)
      setBarangs(b.data)
      setKaryawans(k.data)
    } catch {
      toast.error("Gagal memuat data referensi")
    }
  }, [])

  useEffect(() => { loadRefs() }, [loadRefs])

  const selectedBarang = barangs.find((b) => b.id === itemBarangId)

  function addItem() {
    if (!itemBarangId || !itemJumlah) {
      toast.error("Pilih barang dan jumlah")
      return
    }
    const jumlah = parseInt(itemJumlah) || 0
    if (jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }
    if (selectedBarang && jumlah > selectedBarang.stok) {
      toast.error(`Stok tidak mencukupi. Tersedia: ${selectedBarang.stok}`)
      return
    }
    const newItem: LineItem = {
      barang_id: itemBarangId,
      barang_nama: selectedBarang?.nama || "",
      barang_kode: selectedBarang?.kode || "",
      barang_unit: selectedBarang?.unit?.singkatan || "",
      stok_tersedia: selectedBarang?.stok || 0,
      jumlah,
      keterangan: itemKeterangan,
      tempId: Math.random().toString(36).slice(2),
    }
    setItems((prev) => [...prev, newItem])
    setItemBarangId("")
    setItemJumlah("1")
    setItemKeterangan("")
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId))
    setDeleteItemId(null)
  }

  async function handleSubmit() {
    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (!tanggal) {
      toast.error("Pilih tanggal")
      setStep(0)
      submitRef.current = false
      setSubmitting(false)
      return
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu item")
      setStep(1)
      submitRef.current = false
      setSubmitting(false)
      return
    }
    try {
      const pb = await createPengambilanBarang({
        tanggal_pengambilan: tanggal,
        client_id: clientId || undefined,
        project_id: projectId || undefined,
        karyawan_id: karyawanId || undefined,
        keterangan: keterangan.trim() || undefined,
        items: items.map((it) => ({
          barang_id: it.barang_id,
          jumlah: it.jumlah,
          keterangan: it.keterangan || undefined,
        })),
      })
      toast.success("Pengambilan barang berhasil dibuat")
      router.push(`/pengambilan-barang/${pb.id}`)
    } catch {
      toast.error("Gagal membuat pengambilan barang")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/pengambilan-barang")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pengambilan Barang Baru</h1>
          <p className="text-muted-foreground">Catat pengeluaran barang dari gudang</p>
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
          <CardHeader><CardTitle>Header</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); setStep(1) }} className="space-y-4">
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="tanggal">Tanggal Pengambilan *</FieldLabel>
                    <FieldContent>
                      <Input id="tanggal" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="karyawan_id">Diambil Oleh</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={karyawans.filter((k) => k.aktif).map((k) => ({ value: k.id, label: `${k.nama}${k.jabatan ? ` (${k.jabatan})` : ""}` }))}
                        value={karyawanId}
                        onValueChange={(v) => setKaryawanId(v)}
                        placeholder="Pilih karyawan..."
                        searchPlaceholder="Cari karyawan..."
                        emptySlot={({ close }) => (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-primary hover:bg-accent rounded-sm"
                            onClick={() => { close(); setKaryawanSheetOpen(true) }}
                          >
                            <PlusIcon className="size-4" />
                            Tambah Karyawan
                          </button>
                        )}
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
                </div>
                <Field>
                  <FieldLabel htmlFor="keterangan">Keterangan</FieldLabel>
                  <FieldContent>
                    <Textarea id="keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                  </FieldContent>
                </Field>
              </FieldGroup>
              <div className="flex justify-end">
                <Button type="submit"><ArrowRightIcon /> Selanjutnya: Items</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tambah Item</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-10">
                  <Field className="md:col-span-4">
                    <FieldLabel htmlFor="barang_id">Barang</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={barangs.map((b) => ({ value: b.id, label: `${b.kode} - ${b.nama} (Min: ${b.stok_minimum} | Stok: ${b.stok})`, disabled: b.stok <= 0 }))}
                        value={itemBarangId}
                        onValueChange={(v) => setItemBarangId(v)}
                        placeholder="Pilih barang..."
                        searchPlaceholder="Cari barang..."
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="item_jumlah">Jumlah</FieldLabel>
                    <FieldContent>
                      <Input
                        id="item_jumlah"
                        type="number"
                        min="1"
                        max={selectedBarang?.stok || 0}
                        value={itemJumlah}
                        onChange={(e) => setItemJumlah(e.target.value)}
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-1">
                    <FieldLabel htmlFor="item_satuan">Satuan</FieldLabel>
                    <FieldContent>
                      <Input id="item_satuan" value={selectedBarang?.unit?.singkatan || ""} disabled />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-3">
                    <FieldLabel htmlFor="item_keterangan">Keterangan</FieldLabel>
                    <FieldContent>
                      <Input id="item_keterangan" value={itemKeterangan} onChange={(e) => setItemKeterangan(e.target.value)} />
                    </FieldContent>
                  </Field>
                </div>
                {selectedBarang && (
                  <p className="text-xs text-muted-foreground">
                    Stok tersedia: <span className="font-medium">{selectedBarang.stok}</span>
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={addItem} disabled={!itemBarangId}>
                  <PlusIcon /> Tambah Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Item ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-center">Satuan</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Belum ada item</TableCell></TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.tempId}>
                        <TableCell>
                          <div className="font-medium">{item.barang_nama}</div>
                          <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.stok_tersedia}</TableCell>
                        <TableCell className="text-right">{item.jumlah}</TableCell>
                        <TableCell className="text-center">{item.barang_unit || "-"}</TableCell>
                        <TableCell>{item.keterangan || "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteItemId(item.tempId)}>
                            <Trash2Icon className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeftIcon /> Kembali: Header</Button>
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
              <div className="grid gap-2 md:grid-cols-2">
                <div><span className="text-muted-foreground">Tanggal:</span> {tanggal}</div>
                <div><span className="text-muted-foreground">Diambil Oleh:</span> {karyawans.find((k) => k.id === karyawanId)?.nama || "-"}</div>
                <div><span className="text-muted-foreground">Client:</span> {clients.find((c) => c.id === clientId)?.nama || "-"}</div>
                <div><span className="text-muted-foreground">Project:</span> {projects.find((p) => p.id === projectId)?.nama || "-"}</div>
              </div>
              {keterangan && <div><span className="text-muted-foreground">Keterangan:</span> {keterangan}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Item ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-center">Satuan</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.jumlah}</TableCell>
                      <TableCell className="text-center">{item.barang_unit || "-"}</TableCell>
                      <TableCell>{item.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
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
              {submitting ? "Menyimpan..." : "Buat PB"}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteItemId} onOpenChange={(o) => { if (!o) setDeleteItemId(null) }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus item?</AlertDialogTitle>
            <AlertDialogDescription>Item akan dihapus dari daftar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteItemId && removeItem(deleteItemId)}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddKaryawanSheet
        open={karyawanSheetOpen}
        onOpenChange={setKaryawanSheetOpen}
        onSuccess={() => { loadRefs() }}
      />
    </div>
  )
}
