"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "@/components/ui/color-picker"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSetting, updateSetting, uploadLogo } from "@/lib/settings-api"
import { SettingsAddressSheet, type AlamatKirim } from "@/components/settings-address-sheet"
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
import { LoaderIcon, PencilIcon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"

interface GeneralData {
  nama_perusahaan: string
  npwp: string
  telepon: string
  email: string
  website: string
  logo: string
  alamat: string
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  kode_pos: string
}

interface POData {
  format_kode: string
  urutan_terakhir: number
  tahun_bulan_terakhir: string
  reset_periode: string
}

interface PDFData {
  warna_primary: string
  warna_secondary: string
  warna_tabel_header: string
  warna_ttd: string
  font_family: string
  font_size_base: number
  judul_laporan: string
  tampilkan_logo: boolean
  tampilkan_kode_barang: boolean
  tampilkan_ttd: boolean
  tampilkan_footer: boolean
  rahasiakan_client: boolean
}

function storageUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api$/, "")
  return `${base}/storage/${path.replace(/^\//, "")}`
}

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alamatList, setAlamatList] = useState<AlamatKirim[]>([])
  const [alamatSheetOpen, setAlamatSheetOpen] = useState(false)
  const [editAlamat, setEditAlamat] = useState<AlamatKirim | null>(null)
  const [deleteAlamatId, setDeleteAlamatId] = useState<string | null>(null)
  const [general, setGeneral] = useState<GeneralData>({
    nama_perusahaan: "", npwp: "", telepon: "", email: "", website: "",
    logo: "", alamat: "", provinsi: "", kota: "", kecamatan: "",
    kelurahan: "", kode_pos: "",
  })
  const [po, setPO] = useState<POData>({
    format_kode: "", urutan_terakhir: 0, tahun_bulan_terakhir: "", reset_periode: "bulanan",
  })
  const [pdf, setPdf] = useState<PDFData>({
    warna_primary: "#7c7bad",
    warna_secondary: "#2c3e50",
    warna_tabel_header: "#7c7bad",
    warna_ttd: "#7c7bad",
    font_family: "Segoe UI",
    font_size_base: 9,
    judul_laporan: "PURCHASE ORDER",
    tampilkan_logo: true,
    tampilkan_kode_barang: true,
    tampilkan_ttd: true,
    tampilkan_footer: true,
    rahasiakan_client: false,
  })

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const [generalRes, poRes, pdfRes] = await Promise.all([
        fetchSetting("general"),
        fetchSetting("purchase_order"),
        fetchSetting("pdf_report"),
      ])
      const g = generalRes.data as Record<string, unknown>
      const p = poRes.data as Record<string, unknown>
      const pdfData = pdfRes.data as Record<string, unknown>
      setAlamatList((g.alamat_kirim as AlamatKirim[]) || [])
      setGeneral({
        nama_perusahaan: (g.nama_perusahaan as string) ?? "",
        npwp: (g.npwp as string) ?? "",
        telepon: (g.telepon as string) ?? "",
        email: (g.email as string) ?? "",
        website: (g.website as string) ?? "",
        logo: (g.logo as string) ?? "",
        alamat: (g.alamat as string) ?? "",
        provinsi: (g.provinsi as string) ?? "",
        kota: (g.kota as string) ?? "",
        kecamatan: (g.kecamatan as string) ?? "",
        kelurahan: (g.kelurahan as string) ?? "",
        kode_pos: (g.kode_pos as string) ?? "",
      })
      setPO({
        format_kode: (p.format_kode as string) ?? "",
        urutan_terakhir: (p.urutan_terakhir as number) ?? 0,
        tahun_bulan_terakhir: (p.tahun_bulan_terakhir as string) ?? "",
        reset_periode: (p.reset_periode as string) ?? "bulanan",
      })
      setPdf({
        warna_primary: (pdfData.warna_primary as string) ?? "#7c7bad",
        warna_secondary: (pdfData.warna_secondary as string) ?? "#2c3e50",
        warna_tabel_header: (pdfData.warna_tabel_header as string) ?? "#7c7bad",
        warna_ttd: (pdfData.warna_ttd as string) ?? "#7c7bad",
        font_family: (pdfData.font_family as string) ?? "Segoe UI",
        font_size_base: (pdfData.font_size_base as number) ?? 9,
        judul_laporan: (pdfData.judul_laporan as string) ?? "PURCHASE ORDER",
        tampilkan_logo: (pdfData.tampilkan_logo as boolean) ?? true,
        tampilkan_kode_barang: (pdfData.tampilkan_kode_barang as boolean) ?? true,
        tampilkan_ttd: (pdfData.tampilkan_ttd as boolean) ?? true,
        tampilkan_footer: (pdfData.tampilkan_footer as boolean) ?? true,
        rahasiakan_client: (pdfData.rahasiakan_client as boolean) ?? false,
      })
    } catch {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  function handleSaveAlamat(item: AlamatKirim) {
    setAlamatList((prev) => {
      const idx = prev.findIndex((a) => a.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = item
        return next
      }
      return [...prev, item]
    })
  }

  function handleDeleteAlamat(id: string) {
    setAlamatList((prev) => prev.filter((a) => a.id !== id))
    setDeleteAlamatId(null)
  }

  async function handleSaveAlamatList() {
    setSaving(true)
    try {
      await updateSetting("general", { ...general, alamat_kirim: alamatList } as unknown as Record<string, unknown>)
      toast.success("Alamat kirim disimpan")
    } catch {
      toast.error("Gagal menyimpan alamat")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("general", general as unknown as Record<string, unknown>)
      toast.success("General settings saved")
    } catch {
      toast.error("Failed to save general settings")
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePO(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("purchase_order", po as unknown as Record<string, unknown>)
      toast.success("Purchase order settings saved")
    } catch {
      toast.error("Failed to save PO settings")
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePDF(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("pdf_report", pdf as unknown as Record<string, unknown>)
      toast.success("Export PDF settings saved")
    } catch {
      toast.error("Failed to save export PDF settings")
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadLogo(file)
      setGeneral((prev) => ({ ...prev, logo: result.path }))
      toast.success("Logo uploaded")
    } catch {
      toast.error("Failed to upload logo")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="alamat">Alamat</TabsTrigger>
        <TabsTrigger value="purchase_order">Purchase Order</TabsTrigger>
        <TabsTrigger value="export_pdf">Export PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Company information and logo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nama_perusahaan">Nama Perusahaan</FieldLabel>
                  <FieldContent>
                    <Input id="nama_perusahaan" value={general.nama_perusahaan} onChange={(e) => setGeneral((p) => ({ ...p, nama_perusahaan: e.target.value }))} />
                    <FieldDescription>Nama resmi perusahaan untuk ditampilkan di dokumen</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="npwp">NPWP</FieldLabel>
                  <FieldContent>
                    <Input id="npwp" value={general.npwp} onChange={(e) => setGeneral((p) => ({ ...p, npwp: e.target.value }))} />
                    <FieldDescription>Nomor Pokok Wajib Pajak perusahaan</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="telepon">Telepon</FieldLabel>
                  <FieldContent>
                    <Input id="telepon" value={general.telepon} onChange={(e) => setGeneral((p) => ({ ...p, telepon: e.target.value }))} />
                    <FieldDescription>Nomor telepon yang bisa dihubungi</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input id="email" type="email" value={general.email} onChange={(e) => setGeneral((p) => ({ ...p, email: e.target.value }))} />
                    <FieldDescription>Alamat email resmi perusahaan</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="website">Website</FieldLabel>
                  <FieldContent>
                    <Input id="website" value={general.website} onChange={(e) => setGeneral((p) => ({ ...p, website: e.target.value }))} />
                    <FieldDescription>Website perusahaan (opsional)</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="logo">Logo</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-3">
                      <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1" />
                      {general.logo && (
                        <img src={storageUrl(general.logo)} alt="Logo" className="h-10 w-10 rounded object-cover" />
                      )}
                    </div>
                    <FieldDescription>Upload logo perusahaan (format: JPG, PNG)</FieldDescription>
                  </FieldContent>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="alamat">Alamat</FieldLabel>
                <FieldContent>
                  <Textarea id="alamat" value={general.alamat} onChange={(e) => setGeneral((p) => ({ ...p, alamat: e.target.value }))} />
                  <FieldDescription>Alamat lengkap perusahaan</FieldDescription>
                </FieldContent>
              </Field>
              <div className="grid gap-4 md:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="provinsi">Provinsi</FieldLabel>
                  <FieldContent>
                    <Input id="provinsi" value={general.provinsi} onChange={(e) => setGeneral((p) => ({ ...p, provinsi: e.target.value }))} />
                    <FieldDescription>Provinsi</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="kota">Kota</FieldLabel>
                  <FieldContent>
                    <Input id="kota" value={general.kota} onChange={(e) => setGeneral((p) => ({ ...p, kota: e.target.value }))} />
                    <FieldDescription>Kota/Kabupaten</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                  <FieldContent>
                    <Input id="kecamatan" value={general.kecamatan} onChange={(e) => setGeneral((p) => ({ ...p, kecamatan: e.target.value }))} />
                    <FieldDescription>Kecamatan</FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="kode_pos">Kode Pos</FieldLabel>
                  <FieldContent>
                    <Input id="kode_pos" value={general.kode_pos} onChange={(e) => setGeneral((p) => ({ ...p, kode_pos: e.target.value }))} />
                    <FieldDescription>Kode pos</FieldDescription>
                  </FieldContent>
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <SaveIcon />
                  {saving ? "Saving..." : "Save General Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alamat" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alamat Kirim</CardTitle>
              <CardDescription>Kelola alamat untuk digunakan saat membuat PO</CardDescription>
            </div>
            <Button onClick={() => { setEditAlamat(null); setAlamatSheetOpen(true) }}>
              <PlusIcon /> Tambah Alamat
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Kota</TableHead>
                  <TableHead>Provinsi</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alamatList.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Belum ada alamat</TableCell></TableRow>
                ) : (
                  alamatList.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.label}</TableCell>
                      <TableCell className="max-w-xs truncate">{a.alamat}</TableCell>
                      <TableCell>{a.kota}</TableCell>
                      <TableCell>{a.provinsi}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditAlamat(a); setAlamatSheetOpen(true) }}>
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteAlamatId(a.id)}>
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          {alamatList.length > 0 && (
            <div className="flex justify-end border-t p-4">
              <Button onClick={handleSaveAlamatList} disabled={saving}>
                <SaveIcon /> {saving ? "Menyimpan..." : "Simpan Alamat"}
              </Button>
            </div>
          )}
        </Card>

        <SettingsAddressSheet
          open={alamatSheetOpen}
          onOpenChange={setAlamatSheetOpen}
          editItem={editAlamat}
          onSave={handleSaveAlamat}
        />

        <AlertDialog open={!!deleteAlamatId} onOpenChange={(o) => { if (!o) setDeleteAlamatId(null) }}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
              <AlertDialogTitle>Hapus alamat?</AlertDialogTitle>
              <AlertDialogDescription>Alamat ini akan dihapus dari daftar.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => deleteAlamatId && handleDeleteAlamat(deleteAlamatId)}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>

      <TabsContent value="purchase_order" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Settings</CardTitle>
            <CardDescription>PO code format and numbering</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePO} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="format_kode">Format Kode</FieldLabel>
                  <FieldContent>
                    <Input id="format_kode" value={po.format_kode} onChange={(e) => setPO((p) => ({ ...p, format_kode: e.target.value }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="urutan_terakhir">Urutan Terakhir</FieldLabel>
                  <FieldContent>
                    <Input id="urutan_terakhir" type="number" value={po.urutan_terakhir} onChange={(e) => setPO((p) => ({ ...p, urutan_terakhir: parseInt(e.target.value) || 0 }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="reset_periode">Reset nomor pada bulan</FieldLabel>
                  <FieldContent>
                    <Select value={po.reset_periode} onValueChange={(v) => setPO((p) => ({ ...p, reset_periode: v ?? "bulanan" }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tidak_pernah">Tidak pernah</SelectItem>
                        <SelectItem value="bulanan">Bulanan</SelectItem>
                        <SelectItem value="1">Januari</SelectItem>
                        <SelectItem value="2">Februari</SelectItem>
                        <SelectItem value="3">Maret</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">Mei</SelectItem>
                        <SelectItem value="6">Juni</SelectItem>
                        <SelectItem value="7">Juli</SelectItem>
                        <SelectItem value="8">Agustus</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">Oktober</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">Desember</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <SaveIcon />
                  {saving ? "Saving..." : "Save PO Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export_pdf" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Export PDF Settings</CardTitle>
            <CardDescription>Purchase order PDF layout and styling</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePDF} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Warna Primary</FieldLabel>
                  <FieldContent>
                    <ColorPicker value={pdf.warna_primary} onChange={(v) => setPdf((p) => ({ ...p, warna_primary: v }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Warna Secondary</FieldLabel>
                  <FieldContent>
                    <ColorPicker value={pdf.warna_secondary} onChange={(v) => setPdf((p) => ({ ...p, warna_secondary: v }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Warna Tabel Header</FieldLabel>
                  <FieldContent>
                    <ColorPicker value={pdf.warna_tabel_header} onChange={(v) => setPdf((p) => ({ ...p, warna_tabel_header: v }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Warna Box TTD</FieldLabel>
                  <FieldContent>
                    <ColorPicker value={pdf.warna_ttd} onChange={(v) => setPdf((p) => ({ ...p, warna_ttd: v }))} />
                  </FieldContent>
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Font</FieldLabel>
                  <FieldContent>
                    <Select value={pdf.font_family} onValueChange={(v) => setPdf((p) => ({ ...p, font_family: v ?? "Segoe UI" }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Segoe UI">Segoe UI</SelectItem>
                        <SelectItem value="DejaVu Sans">DejaVu Sans</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Courier">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="pdf_font_size_base">Ukuran Font (pt)</FieldLabel>
                  <FieldContent>
                    <Input id="pdf_font_size_base" type="number" min={6} max={14} value={pdf.font_size_base} onChange={(e) => setPdf((p) => ({ ...p, font_size_base: parseInt(e.target.value) || 9 }))} />
                  </FieldContent>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="judul_laporan">Judul Laporan</FieldLabel>
                <FieldContent>
                  <Input id="judul_laporan" value={pdf.judul_laporan} onChange={(e) => setPdf((p) => ({ ...p, judul_laporan: e.target.value }))} />
                </FieldContent>
              </Field>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Tampilkan logo</label>
                  <Switch checked={pdf.tampilkan_logo} onCheckedChange={(v) => setPdf((p) => ({ ...p, tampilkan_logo: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Tampilkan kode barang</label>
                  <Switch checked={pdf.tampilkan_kode_barang} onCheckedChange={(v) => setPdf((p) => ({ ...p, tampilkan_kode_barang: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Tampilkan tanda tangan</label>
                  <Switch checked={pdf.tampilkan_ttd} onCheckedChange={(v) => setPdf((p) => ({ ...p, tampilkan_ttd: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Tampilkan footer</label>
                  <Switch checked={pdf.tampilkan_footer} onCheckedChange={(v) => setPdf((p) => ({ ...p, tampilkan_footer: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Gunakan kode client di PDF</label>
                  <Switch checked={pdf.rahasiakan_client} onCheckedChange={(v) => setPdf((p) => ({ ...p, rahasiakan_client: v }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <SaveIcon />
                  {saving ? "Saving..." : "Save Export PDF Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
