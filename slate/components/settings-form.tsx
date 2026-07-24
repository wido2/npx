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
import { fetchSetting, updateSetting } from "@/lib/settings-api"
import { SettingsAddressSheet, type AlamatKirim } from "@/components/settings-address-sheet"
import { SettingsLogoUpload } from "@/components/settings-logo-upload"
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

interface PBData {
  format_kode: string
  urutan_terakhir: number
  tahun_bulan_terakhir: string
  reset_periode: string
}

interface POPDFData {
  margin_top: number
  margin_right: number
  margin_bottom: number
  margin_left: number
  warna_primary: string
  warna_secondary: string
  warna_tabel_header: string
  warna_ttd: string
  warna_footer_text: string
  font_family: string
  font_size_judul: number
  font_size_tabel_header: number
  font_size_tabel_body: number
  font_size_info: number
  font_size_ttd: number
  font_size_footer: number
  logo_max_height: number
  tampilkan_logo: boolean
  tampilkan_kode_barang: boolean
  tampilkan_ttd: boolean
  tampilkan_footer: boolean
  rahasiakan_client: boolean
  judul_laporan: string
}

interface PBPDFData {
  margin_top: number
  margin_right: number
  margin_bottom: number
  margin_left: number
  warna_primary: string
  warna_secondary: string
  warna_tabel_header: string
  warna_ttd: string
  warna_footer_text: string
  font_family: string
  font_size_judul: number
  font_size_tabel_header: number
  font_size_tabel_body: number
  font_size_info: number
  font_size_ttd: number
  font_size_footer: number
  logo_max_height: number
  tampilkan_logo: boolean
  tampilkan_kode_barang: boolean
  tampilkan_ttd: boolean
  tampilkan_footer: boolean
  rahasiakan_client: boolean
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
  const [pb, setPB] = useState<PBData>({
    format_kode: "", urutan_terakhir: 0, tahun_bulan_terakhir: "", reset_periode: "bulanan",
  })
  const [poPdf, setPoPdf] = useState<POPDFData>({
    margin_top: 15, margin_right: 12, margin_bottom: 15, margin_left: 12,
    warna_primary: "#7c7bad", warna_secondary: "#2c3e50", warna_tabel_header: "#7c7bad", warna_ttd: "#7c7bad", warna_footer_text: "#bbbbbb",
    font_family: "Segoe UI", font_size_judul: 16, font_size_tabel_header: 7, font_size_tabel_body: 8, font_size_info: 7.5, font_size_ttd: 7, font_size_footer: 6.5,
    logo_max_height: 125,
    tampilkan_logo: true, tampilkan_kode_barang: true, tampilkan_ttd: true, tampilkan_footer: true, rahasiakan_client: false,
    judul_laporan: "PURCHASE ORDER",
  })
  const [pbPdf, setPbPdf] = useState<PBPDFData>({
    margin_top: 15, margin_right: 12, margin_bottom: 15, margin_left: 12,
    warna_primary: "#7c7bad", warna_secondary: "#2c3e50", warna_tabel_header: "#7c7bad", warna_ttd: "#7c7bad", warna_footer_text: "#bbbbbb",
    font_family: "Segoe UI", font_size_judul: 16, font_size_tabel_header: 7, font_size_tabel_body: 8, font_size_info: 7.5, font_size_ttd: 7, font_size_footer: 6.5,
    logo_max_height: 125,
    tampilkan_logo: true, tampilkan_kode_barang: true, tampilkan_ttd: true, tampilkan_footer: true, rahasiakan_client: false,
  })

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const [generalRes, poRes, pbRes, poPdfRes, pbPdfRes] = await Promise.all([
        fetchSetting("general"),
        fetchSetting("purchase_order"),
        fetchSetting("pengambilan_barang"),
        fetchSetting("po_pdf").catch(() => fetchSetting("pdf_report")),
        fetchSetting("pb_pdf").catch(() => fetchSetting("pdf_report")),
      ])
      const g = generalRes.data as Record<string, unknown>
      const p = poRes.data as Record<string, unknown>
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
      const pbData = pbRes.data as Record<string, unknown>
      setPB({
        format_kode: (pbData.format_kode as string) ?? "",
        urutan_terakhir: (pbData.urutan_terakhir as number) ?? 0,
        tahun_bulan_terakhir: (pbData.tahun_bulan_terakhir as string) ?? "",
        reset_periode: (pbData.reset_periode as string) ?? "bulanan",
      })
      const poPdfData = poPdfRes.data as Record<string, unknown>
      setPoPdf({
        margin_top: (poPdfData.margin_top as number) ?? 15,
        margin_right: (poPdfData.margin_right as number) ?? 12,
        margin_bottom: (poPdfData.margin_bottom as number) ?? 15,
        margin_left: (poPdfData.margin_left as number) ?? 12,
        warna_primary: (poPdfData.warna_primary as string) ?? "#7c7bad",
        warna_secondary: (poPdfData.warna_secondary as string) ?? "#2c3e50",
        warna_tabel_header: (poPdfData.warna_tabel_header as string) ?? "#7c7bad",
        warna_ttd: (poPdfData.warna_ttd as string) ?? "#7c7bad",
        warna_footer_text: (poPdfData.warna_footer_text as string) ?? "#bbbbbb",
        font_family: (poPdfData.font_family as string) ?? "Segoe UI",
        font_size_judul: (poPdfData.font_size_judul as number) ?? 16,
        font_size_tabel_header: (poPdfData.font_size_tabel_header as number) ?? 7,
        font_size_tabel_body: (poPdfData.font_size_tabel_body as number) ?? 8,
        font_size_info: (poPdfData.font_size_info as number) ?? 7.5,
        font_size_ttd: (poPdfData.font_size_ttd as number) ?? 7,
        font_size_footer: (poPdfData.font_size_footer as number) ?? 6.5,
        logo_max_height: (poPdfData.logo_max_height as number) ?? 125,
        tampilkan_logo: (poPdfData.tampilkan_logo as boolean) ?? true,
        tampilkan_kode_barang: (poPdfData.tampilkan_kode_barang as boolean) ?? true,
        tampilkan_ttd: (poPdfData.tampilkan_ttd as boolean) ?? true,
        tampilkan_footer: (poPdfData.tampilkan_footer as boolean) ?? true,
        rahasiakan_client: (poPdfData.rahasiakan_client as boolean) ?? false,
        judul_laporan: (poPdfData.judul_laporan as string) ?? "PURCHASE ORDER",
      })
      const pbPdfData = pbPdfRes.data as Record<string, unknown>
      setPbPdf({
        margin_top: (pbPdfData.margin_top as number) ?? 15,
        margin_right: (pbPdfData.margin_right as number) ?? 12,
        margin_bottom: (pbPdfData.margin_bottom as number) ?? 15,
        margin_left: (pbPdfData.margin_left as number) ?? 12,
        warna_primary: (pbPdfData.warna_primary as string) ?? "#7c7bad",
        warna_secondary: (pbPdfData.warna_secondary as string) ?? "#2c3e50",
        warna_tabel_header: (pbPdfData.warna_tabel_header as string) ?? "#7c7bad",
        warna_ttd: (pbPdfData.warna_ttd as string) ?? "#7c7bad",
        warna_footer_text: (pbPdfData.warna_footer_text as string) ?? "#bbbbbb",
        font_family: (pbPdfData.font_family as string) ?? "Segoe UI",
        font_size_judul: (pbPdfData.font_size_judul as number) ?? 16,
        font_size_tabel_header: (pbPdfData.font_size_tabel_header as number) ?? 7,
        font_size_tabel_body: (pbPdfData.font_size_tabel_body as number) ?? 8,
        font_size_info: (pbPdfData.font_size_info as number) ?? 7.5,
        font_size_ttd: (pbPdfData.font_size_ttd as number) ?? 7,
        font_size_footer: (pbPdfData.font_size_footer as number) ?? 6.5,
        logo_max_height: (pbPdfData.logo_max_height as number) ?? 125,
        tampilkan_logo: (pbPdfData.tampilkan_logo as boolean) ?? true,
        tampilkan_kode_barang: (pbPdfData.tampilkan_kode_barang as boolean) ?? true,
        tampilkan_ttd: (pbPdfData.tampilkan_ttd as boolean) ?? true,
        tampilkan_footer: (pbPdfData.tampilkan_footer as boolean) ?? true,
        rahasiakan_client: (pbPdfData.rahasiakan_client as boolean) ?? false,
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

  async function handleSavePB(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("pengambilan_barang", pb as unknown as Record<string, unknown>)
      toast.success("PB settings saved")
    } catch {
      toast.error("Failed to save PB settings")
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePOPdf(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("po_pdf", poPdf as unknown as Record<string, unknown>)
      toast.success("PO PDF settings saved")
    } catch {
      toast.error("Failed to save PO PDF settings")
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePBPdf(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSetting("pb_pdf", pbPdf as unknown as Record<string, unknown>)
      toast.success("PB PDF settings saved")
    } catch {
      toast.error("Failed to save PB PDF settings")
    } finally {
      setSaving(false)
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
        <TabsTrigger value="pengambilan_barang">PB - Pengambilan Barang</TabsTrigger>
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
                    <SettingsLogoUpload
                      logoPath={general.logo}
                      onLogoChange={(path) => setGeneral((prev) => ({ ...prev, logo: path }))}
                    />
                    <FieldDescription>Upload logo perusahaan (format: JPG, PNG, GIF, WEBP, SVG. Maks: 3MB)</FieldDescription>
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

      <TabsContent value="pengambilan_barang" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>PB - Pengambilan Barang Settings</CardTitle>
            <CardDescription>PB code format and numbering</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePB} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="pb_format_kode">Format Kode</FieldLabel>
                  <FieldContent>
                    <Input id="pb_format_kode" value={pb.format_kode} onChange={(e) => setPB((p) => ({ ...p, format_kode: e.target.value }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="pb_urutan_terakhir">Urutan Terakhir</FieldLabel>
                  <FieldContent>
                    <Input id="pb_urutan_terakhir" type="number" value={pb.urutan_terakhir} onChange={(e) => setPB((p) => ({ ...p, urutan_terakhir: parseInt(e.target.value) || 0 }))} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="pb_reset_periode">Reset nomor pada bulan</FieldLabel>
                  <FieldContent>
                    <Select value={pb.reset_periode} onValueChange={(v) => setPB((p) => ({ ...p, reset_periode: v ?? "bulanan" }))}>
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
                  {saving ? "Saving..." : "Save PB Settings"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export_pdf" className="mt-6">
        <Tabs defaultValue="po_pdf" className="w-full">
          <TabsList>
            <TabsTrigger value="po_pdf">PO PDF</TabsTrigger>
            <TabsTrigger value="pb_pdf">PB PDF</TabsTrigger>
          </TabsList>

          <TabsContent value="po_pdf" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>PO PDF Settings</CardTitle>
                <CardDescription>Purchase order PDF layout and styling</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePOPdf} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Margin (mm)</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Field>
                        <FieldLabel htmlFor="po_margin_top">Atas</FieldLabel>
                        <FieldContent>
                          <Input id="po_margin_top" type="number" min={0} value={poPdf.margin_top} onChange={(e) => setPoPdf((p) => ({ ...p, margin_top: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_margin_right">Kanan</FieldLabel>
                        <FieldContent>
                          <Input id="po_margin_right" type="number" min={0} value={poPdf.margin_right} onChange={(e) => setPoPdf((p) => ({ ...p, margin_right: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_margin_bottom">Bawah</FieldLabel>
                        <FieldContent>
                          <Input id="po_margin_bottom" type="number" min={0} value={poPdf.margin_bottom} onChange={(e) => setPoPdf((p) => ({ ...p, margin_bottom: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_margin_left">Kiri</FieldLabel>
                        <FieldContent>
                          <Input id="po_margin_left" type="number" min={0} value={poPdf.margin_left} onChange={(e) => setPoPdf((p) => ({ ...p, margin_left: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Warna</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Primary</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={poPdf.warna_primary} onChange={(v) => setPoPdf((p) => ({ ...p, warna_primary: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Secondary</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={poPdf.warna_secondary} onChange={(v) => setPoPdf((p) => ({ ...p, warna_secondary: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Tabel Header</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={poPdf.warna_tabel_header} onChange={(v) => setPoPdf((p) => ({ ...p, warna_tabel_header: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Box TTD</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={poPdf.warna_ttd} onChange={(v) => setPoPdf((p) => ({ ...p, warna_ttd: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Footer Text</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={poPdf.warna_footer_text} onChange={(v) => setPoPdf((p) => ({ ...p, warna_footer_text: v }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Font</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Font</FieldLabel>
                        <FieldContent>
                          <Select value={poPdf.font_family} onValueChange={(v) => setPoPdf((p) => ({ ...p, font_family: v ?? "Segoe UI" }))}>
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
                        <FieldLabel htmlFor="po_font_size_judul">Ukuran Judul (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_judul" type="number" min={8} max={24} value={poPdf.font_size_judul} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_judul: parseInt(e.target.value) || 16 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_font_size_tabel_header">Ukuran Tabel Header (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_tabel_header" type="number" min={5} max={14} value={poPdf.font_size_tabel_header} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_tabel_header: parseInt(e.target.value) || 7 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_font_size_tabel_body">Ukuran Tabel Body (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_tabel_body" type="number" min={5} max={14} value={poPdf.font_size_tabel_body} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_tabel_body: parseInt(e.target.value) || 8 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_font_size_info">Ukuran Info (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_info" type="number" min={5} max={14} value={poPdf.font_size_info} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_info: parseFloat(e.target.value) || 7.5 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_font_size_ttd">Ukuran TTD (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_ttd" type="number" min={5} max={14} value={poPdf.font_size_ttd} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_ttd: parseInt(e.target.value) || 7 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="po_font_size_footer">Ukuran Footer (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="po_font_size_footer" type="number" min={5} max={14} value={poPdf.font_size_footer} onChange={(e) => setPoPdf((p) => ({ ...p, font_size_footer: parseFloat(e.target.value) || 6.5 }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Logo</h3>
                    <Field>
                      <FieldLabel htmlFor="po_logo_max_height">Max Height Logo (px)</FieldLabel>
                      <FieldContent>
                        <Input id="po_logo_max_height" type="number" min={0} max={300} value={poPdf.logo_max_height} onChange={(e) => setPoPdf((p) => ({ ...p, logo_max_height: parseInt(e.target.value) || 125 }))} />
                      </FieldContent>
                    </Field>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Konten</h3>
                    <Field>
                      <FieldLabel htmlFor="po_judul_laporan">Judul Laporan</FieldLabel>
                      <FieldContent>
                        <Input id="po_judul_laporan" value={poPdf.judul_laporan} onChange={(e) => setPoPdf((p) => ({ ...p, judul_laporan: e.target.value }))} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan logo</label>
                      <Switch checked={poPdf.tampilkan_logo} onCheckedChange={(v) => setPoPdf((p) => ({ ...p, tampilkan_logo: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan kode barang</label>
                      <Switch checked={poPdf.tampilkan_kode_barang} onCheckedChange={(v) => setPoPdf((p) => ({ ...p, tampilkan_kode_barang: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan tanda tangan</label>
                      <Switch checked={poPdf.tampilkan_ttd} onCheckedChange={(v) => setPoPdf((p) => ({ ...p, tampilkan_ttd: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan footer</label>
                      <Switch checked={poPdf.tampilkan_footer} onCheckedChange={(v) => setPoPdf((p) => ({ ...p, tampilkan_footer: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Gunakan kode client di PDF</label>
                      <Switch checked={poPdf.rahasiakan_client} onCheckedChange={(v) => setPoPdf((p) => ({ ...p, rahasiakan_client: v }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <SaveIcon />
                      {saving ? "Saving..." : "Save PO PDF Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pb_pdf" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>PB PDF Settings</CardTitle>
                <CardDescription>Pengambilan barang PDF layout and styling</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePBPdf} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Margin (mm)</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Field>
                        <FieldLabel htmlFor="pb_margin_top">Atas</FieldLabel>
                        <FieldContent>
                          <Input id="pb_margin_top" type="number" min={0} value={pbPdf.margin_top} onChange={(e) => setPbPdf((p) => ({ ...p, margin_top: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_margin_right">Kanan</FieldLabel>
                        <FieldContent>
                          <Input id="pb_margin_right" type="number" min={0} value={pbPdf.margin_right} onChange={(e) => setPbPdf((p) => ({ ...p, margin_right: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_margin_bottom">Bawah</FieldLabel>
                        <FieldContent>
                          <Input id="pb_margin_bottom" type="number" min={0} value={pbPdf.margin_bottom} onChange={(e) => setPbPdf((p) => ({ ...p, margin_bottom: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_margin_left">Kiri</FieldLabel>
                        <FieldContent>
                          <Input id="pb_margin_left" type="number" min={0} value={pbPdf.margin_left} onChange={(e) => setPbPdf((p) => ({ ...p, margin_left: parseInt(e.target.value) || 0 }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Warna</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Primary</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={pbPdf.warna_primary} onChange={(v) => setPbPdf((p) => ({ ...p, warna_primary: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Secondary</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={pbPdf.warna_secondary} onChange={(v) => setPbPdf((p) => ({ ...p, warna_secondary: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Tabel Header</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={pbPdf.warna_tabel_header} onChange={(v) => setPbPdf((p) => ({ ...p, warna_tabel_header: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Box TTD</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={pbPdf.warna_ttd} onChange={(v) => setPbPdf((p) => ({ ...p, warna_ttd: v }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Footer Text</FieldLabel>
                        <FieldContent>
                          <ColorPicker value={pbPdf.warna_footer_text} onChange={(v) => setPbPdf((p) => ({ ...p, warna_footer_text: v }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Font</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Font</FieldLabel>
                        <FieldContent>
                          <Select value={pbPdf.font_family} onValueChange={(v) => setPbPdf((p) => ({ ...p, font_family: v ?? "Segoe UI" }))}>
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
                        <FieldLabel htmlFor="pb_font_size_judul">Ukuran Judul (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_judul" type="number" min={8} max={24} value={pbPdf.font_size_judul} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_judul: parseInt(e.target.value) || 16 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_font_size_tabel_header">Ukuran Tabel Header (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_tabel_header" type="number" min={5} max={14} value={pbPdf.font_size_tabel_header} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_tabel_header: parseInt(e.target.value) || 7 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_font_size_tabel_body">Ukuran Tabel Body (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_tabel_body" type="number" min={5} max={14} value={pbPdf.font_size_tabel_body} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_tabel_body: parseInt(e.target.value) || 8 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_font_size_info">Ukuran Info (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_info" type="number" min={5} max={14} value={pbPdf.font_size_info} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_info: parseFloat(e.target.value) || 7.5 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_font_size_ttd">Ukuran TTD (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_ttd" type="number" min={5} max={14} value={pbPdf.font_size_ttd} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_ttd: parseInt(e.target.value) || 7 }))} />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="pb_font_size_footer">Ukuran Footer (pt)</FieldLabel>
                        <FieldContent>
                          <Input id="pb_font_size_footer" type="number" min={5} max={14} value={pbPdf.font_size_footer} onChange={(e) => setPbPdf((p) => ({ ...p, font_size_footer: parseFloat(e.target.value) || 6.5 }))} />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Logo</h3>
                    <Field>
                      <FieldLabel htmlFor="pb_logo_max_height">Max Height Logo (px)</FieldLabel>
                      <FieldContent>
                        <Input id="pb_logo_max_height" type="number" min={0} max={300} value={pbPdf.logo_max_height} onChange={(e) => setPbPdf((p) => ({ ...p, logo_max_height: parseInt(e.target.value) || 125 }))} />
                      </FieldContent>
                    </Field>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan logo</label>
                      <Switch checked={pbPdf.tampilkan_logo} onCheckedChange={(v) => setPbPdf((p) => ({ ...p, tampilkan_logo: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan kode barang</label>
                      <Switch checked={pbPdf.tampilkan_kode_barang} onCheckedChange={(v) => setPbPdf((p) => ({ ...p, tampilkan_kode_barang: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan tanda tangan</label>
                      <Switch checked={pbPdf.tampilkan_ttd} onCheckedChange={(v) => setPbPdf((p) => ({ ...p, tampilkan_ttd: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Tampilkan footer</label>
                      <Switch checked={pbPdf.tampilkan_footer} onCheckedChange={(v) => setPbPdf((p) => ({ ...p, tampilkan_footer: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Gunakan kode client di PDF</label>
                      <Switch checked={pbPdf.rahasiakan_client} onCheckedChange={(v) => setPbPdf((p) => ({ ...p, rahasiakan_client: v }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <SaveIcon />
                      {saving ? "Saving..." : "Save PB PDF Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}
