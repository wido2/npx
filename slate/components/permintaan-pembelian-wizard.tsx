"use client"

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import { fetchBarangs, type Barang } from "@/lib/barang-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { fetchProjects, type Project } from "@/lib/project-api"
import { createPP, updatePP, fetchPP, type PermintaanPembelian, createPPItem, deletePPItem, fetchPPItems, type PermintaanPembelianItem } from "@/lib/permintaan-pembelian-api"
import { fetchSetting } from "@/lib/settings-api"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"

interface LineItem {
  id?: string
  barang_id: string
  barang_kode: string
  barang_nama: string
  barang_stok: number
  barang_unit_nama: string
  jumlah_diminta: number
  catatan: string
  tempId: string
}

const steps = ["Header", "Items", "Review"]

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

export function PermintaanPembelianWizard({ ppId }: { ppId?: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)
  const [loading, setLoading] = useState(!!ppId)
  const isEdit = !!ppId

  const [barangs, setBarangs] = useState<Barang[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [projectId, setProjectId] = useState("")
  const [clientId, setClientId] = useState("")
  const [tanggalDiminta, setTanggalDiminta] = useState("")
  const [tanggalDiperlukan, setTanggalDiperlukan] = useState("")
  const [catatan, setCatatan] = useState("")

  const [items, setItems] = useState<LineItem[]>([])

  const [itemBarangId, setItemBarangId] = useState("")
  const [itemJumlah, setItemJumlah] = useState("1")
  const [itemCatatan, setItemCatatan] = useState("")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItemIdx, setDeletingItemIdx] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [barangsData, clientsData, projectsData, itemsData] = await Promise.all([
        fetchBarangs({ per_page: 500 }),
        fetchClients({ per_page: 100 }),
        fetchProjects({ per_page: 100 }),
        ppId ? fetchPPItems(ppId) : Promise.resolve([]),
      ])
      setBarangs(barangsData.data || [])
      setClients(clientsData.data || [])
      setProjects((projectsData.data || []).filter((p: Project) => p.aktif !== false))

      if (ppId) {
        const pp = await fetchPP(ppId)
        setProjectId(pp.project_id || "")
        setClientId(pp.client_id || "")
        setTanggalDiminta(pp.tanggal_diminta)
        setTanggalDiperlukan(pp.tanggal_diperlukan || "")
        setCatatan(pp.catatan || "")
        setItems(
          (itemsData as PermintaanPembelianItem[]).map((item) => {
            const barang = barangsData.data?.find((b: Barang) => b.id === item.barang_id)
            return {
              id: item.id,
              barang_id: item.barang_id,
              barang_kode: item.barang?.kode || barang?.kode || "",
              barang_nama: item.barang?.nama || barang?.nama || "",
              barang_stok: barang?.stok ?? 0,
              barang_unit_nama: barang?.unit?.nama || "",
              jumlah_diminta: item.jumlah_diminta,
              catatan: item.catatan || "",
              tempId: `existing-${item.id}`,
            }
          })
        )
      }
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [ppId])

  useEffect(() => { loadData() }, [loadData])

  const progress = useMemo(() => (step / (steps.length - 1)) * 100, [step])

  async function handleSubmit() {
    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (items.length === 0) {
      toast.error("Minimal satu item")
      submitRef.current = false
      setSubmitting(false)
      return
    }
    try {
      let pp: PermintaanPembelian

      if (isEdit) {
        pp = await updatePP(ppId!, {
          project_id: projectId || undefined,
          client_id: clientId || undefined,
          tanggal_diminta: tanggalDiminta,
          tanggal_diperlukan: tanggalDiperlukan || undefined,
          catatan: catatan || undefined,
        })

        const existingItems = await fetchPPItems(ppId!)
        for (const item of existingItems) {
          await deletePPItem(ppId!, item.id)
        }
      } else {
        pp = await createPP({
          project_id: projectId || undefined,
          client_id: clientId || undefined,
          tanggal_diminta: tanggalDiminta,
          tanggal_diperlukan: tanggalDiperlukan || undefined,
          catatan: catatan || undefined,
        })
      }

      for (const item of items) {
        await createPPItem(pp.id, {
          barang_id: item.barang_id,
          jumlah_diminta: item.jumlah_diminta,
          catatan: item.catatan || undefined,
        })
      }

      toast.success(isEdit ? "PP updated" : "PP created")
      router.push(`/permintaan-pembelian/${pp.id}`)
    } catch {
      toast.error("Failed to save PP")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  function addItem() {
    if (!itemBarangId) {
      toast.error("Pilih barang terlebih dahulu")
      return
    }

    const barang = barangs.find((b) => b.id === itemBarangId)
    if (!barang) return

    const jumlah = parseInt(itemJumlah) || 0
    if (jumlah < 1) {
      toast.error("Jumlah minimal 1")
      return
    }

    setItems((prev) => [
      ...prev,
      {
        barang_id: barang.id,
        barang_kode: barang.kode,
        barang_nama: barang.nama,
        barang_stok: barang.stok,
        barang_unit_nama: barang.unit?.nama || "",
        jumlah_diminta: jumlah,
        catatan: itemCatatan,
        tempId: `temp-${Date.now()}`,
      },
    ])

    setItemBarangId("")
    setItemJumlah("1")
    setItemCatatan("")
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const selectedBarang = barangs.find((b) => b.id === itemBarangId)

  if (loading) {
    return <div className="flex items-center justify-center py-20">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-1" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {steps.map((s, i) => (
          <Fragment key={s}>
            {i > 0 && <div className="flex-1 h-px bg-muted" />}
            <span className={i <= step ? "text-foreground font-medium" : ""}>{s}</span>
          </Fragment>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Header</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Client</FieldLabel>
                <FieldContent>
                  <Combobox
                    placeholder="Pilih client..."
                    options={clients.map((c: Client) => ({ value: c.id, label: c.nama }))}
                    value={clientId}
                    onValueChange={(v) => { setClientId(v); setProjectId("") }}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Project</FieldLabel>
                <FieldContent>
                  <Combobox
                    placeholder={clientId ? "Pilih project..." : "Pilih client terlebih dahulu"}
                    options={projects.filter((p) => !clientId || p.client_id === clientId).map((p: Project) => ({ value: p.id, label: p.nama }))}
                    value={projectId}
                    onValueChange={(v) => setProjectId(v)}
                    disabled={!clientId}
                  />
                </FieldContent>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Tanggal Diminta *</FieldLabel>
                <FieldContent>
                  <Input type="date" value={tanggalDiminta} onChange={(e) => setTanggalDiminta(e.target.value)} required />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Tanggal Diperlukan</FieldLabel>
                <FieldContent>
                  <Input type="date" value={tanggalDiperlukan} onChange={(e) => setTanggalDiperlukan(e.target.value)} />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel>Catatan</FieldLabel>
              <FieldContent>
                <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional" rows={3} />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tambah Item</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-12">
                  <Field className="md:col-span-5">
                    <FieldLabel>Barang *</FieldLabel>
                    <FieldContent>
                      <Combobox
                        options={barangs.map((b: Barang) => ({
                          value: b.id,
                          label: `${b.kode} - ${b.nama}${b.unit?.nama ? ` (${b.unit.nama})` : ""} | Stok: ${b.stok}`,
                        }))}
                        value={itemBarangId}
                        onValueChange={setItemBarangId}
                        placeholder="Pilih barang..."
                        searchPlaceholder="Cari barang..."
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Stok</FieldLabel>
                    <FieldContent>
                      <Input
                        value={selectedBarang ? `${selectedBarang.stok} ${selectedBarang.unit?.nama || ""}` : "-"}
                        disabled
                        className="bg-muted"
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-1">
                    <FieldLabel>Jumlah *</FieldLabel>
                    <FieldContent>
                      <Input type="number" min={1} value={itemJumlah} onChange={(e) => setItemJumlah(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Satuan</FieldLabel>
                    <FieldContent>
                      <Input
                        value={selectedBarang?.unit?.nama || "-"}
                        disabled
                        className="bg-muted"
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Catatan</FieldLabel>
                    <FieldContent>
                      <Input value={itemCatatan} onChange={(e) => setItemCatatan(e.target.value)} placeholder="Opsional" />
                    </FieldContent>
                  </Field>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={addItem} disabled={!itemBarangId}>
                  <PlusIcon /> Tambah Item
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
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Belum ada item. Tambahkan item di atas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, idx) => (
                      <TableRow key={item.tempId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.barang_nama}</div>
                          <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{item.barang_stok}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium">{item.jumlah_diminta}</TableCell>
                        <TableCell>{item.barang_unit_nama || "-"}</TableCell>
                        <TableCell>{item.catatan || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => { setDeletingItemIdx(idx); setDeleteDialogOpen(true) }}
                          >
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
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Ringkasan</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div><span className="text-muted-foreground">Project:</span> <span>{projects.find((p: Project) => p.id === projectId)?.nama || "-"}</span></div>
                <div><span className="text-muted-foreground">Client:</span> <span>{clients.find((c: Client) => c.id === clientId)?.nama || "-"}</span></div>
                <div><span className="text-muted-foreground">Tanggal Diminta:</span> <span>{tanggalDiminta}</span></div>
                <div><span className="text-muted-foreground">Tanggal Diperlukan:</span> <span>{tanggalDiperlukan || "-"}</span></div>
                {catatan && <div className="sm:col-span-2"><span className="text-muted-foreground">Catatan:</span> <span>{catatan}</span></div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items ({items.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.tempId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{item.jumlah_diminta}</TableCell>
                      <TableCell>{item.barang_unit_nama || "-"}</TableCell>
                      <TableCell>{item.catatan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeftIcon /> Sebelumnya
          </Button>
        ) : (
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon /> Batal
          </Button>
        )}
        <div className="flex gap-2">
          {step < steps.length - 1 ? (
            <Button onClick={() => {
              if (step === 0 && !tanggalDiminta) {
                toast.error("Tanggal diminta wajib diisi")
                return
              }
              if (step === 1 && items.length === 0) {
                toast.error("Minimal satu item")
                return
              }
              setStep((s) => s + 1)
            }}>
              Selanjutnya <ArrowRightIcon />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Menyimpan..." : <><SaveIcon /> {isEdit ? "Update" : "Buat PP"}</>}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus item?</AlertDialogTitle>
            <AlertDialogDescription>Item akan dihapus dari daftar.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => {
              if (deletingItemIdx !== null) removeItem(deletingItemIdx)
              setDeleteDialogOpen(false)
              setDeletingItemIdx(null)
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}