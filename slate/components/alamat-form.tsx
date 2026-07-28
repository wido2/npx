"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createAlamat,
  updateAlamat,
  fetchAlamat,
} from "@/lib/alamat-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { ArrowLeftIcon, LoaderIcon, SaveIcon } from "lucide-react"

interface Props {
  alamatId?: string
}

const entityTypes = [
  { value: "vendor", label: "Vendor" },
  { value: "client", label: "Client" },
]

export function AlamatForm({ alamatId }: Props) {
  const router = useRouter()
  const isEdit = !!alamatId
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)

  const [label, setLabel] = useState("")
  const [alamat, setAlamat] = useState("")
  const [provinsi, setProvinsi] = useState("")
  const [kota, setKota] = useState("")
  const [kecamatan, setKecamatan] = useState("")
  const [kelurahan, setKelurahan] = useState("")
  const [kodePos, setKodePos] = useState("")
  const [utama, setUtama] = useState(false)
  const [aktif, setAktif] = useState(true)

  const [entityType, setEntityType] = useState("")
  const [entityId, setEntityId] = useState("")

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const loadEntityData = useCallback(async () => {
    try {
      const [v, c] = await Promise.all([
        fetchVendors({ per_page: 200 }),
        fetchClients({ per_page: 200 }),
      ])
      setVendors(v.data)
      setClients(c.data)
    } catch {
      toast.error("Failed to load entity data")
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!alamatId) return
    setLoading(true)
    try {
      const res = await fetchAlamat({ page: 1, per_page: 1 })
      const item = res.data.find((a) => a.id === alamatId)
      if (!item) throw new Error("Not found")

      setLabel(item.label)
      setAlamat(item.alamat)
      setProvinsi(item.provinsi)
      setKota(item.kota)
      setKecamatan(item.kecamatan || "")
      setKelurahan(item.kelurahan || "")
      setKodePos(item.kode_pos || "")
      setUtama(item.utama)
      setAktif(item.aktif)

      const modelMap: Record<string, string> = {
        "App\\Models\\Vendor": "vendor",
        "App\\Models\\Client": "client",
      }
      setEntityType(modelMap[item.addressable_type] || "")
      setEntityId(item.addressable_id)
    } catch {
      toast.error("Failed to load alamat")
      router.push("/alamat")
    } finally {
      setLoading(false)
    }
  }, [alamatId, router])

  useEffect(() => {
    loadEntityData()
    if (isEdit) loadData()
  }, [isEdit, loadData, loadEntityData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (!label || !alamat || !provinsi || !kota || !entityType || !entityId) {
      toast.error("Please fill all required fields")
      submitRef.current = false
      setSubmitting(false)
      return
    }
    try {
      const payload = {
        label: label.trim(),
        alamat: alamat.trim(),
        provinsi: provinsi.trim(),
        kota: kota.trim(),
        kecamatan: kecamatan.trim() || undefined,
        kelurahan: kelurahan.trim() || undefined,
        kode_pos: kodePos.trim() || undefined,
        utama,
        aktif,
        addressable_type: entityType,
        addressable_id: entityId,
      }
      if (isEdit && alamatId) {
        await updateAlamat(alamatId, payload)
        toast.success("Alamat updated")
      } else {
        await createAlamat(payload)
        toast.success("Alamat created")
      }
      router.push("/alamat")
    } catch {
      toast.error(isEdit ? "Failed to update alamat" : "Failed to create alamat")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  const entityOptions =
    entityType === "vendor"
      ? vendors.map((v) => ({ value: v.id, label: `${v.kode} - ${v.nama}` }))
      : entityType === "client"
        ? clients.map((c) => ({ value: c.id, label: `${c.kode} - ${c.nama}` }))
        : []

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/alamat")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Alamat" : "Add Alamat"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update address information" : "Create a new address"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Entity Relasi</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="entity_type">Tipe Entity *</FieldLabel>
                <FieldContent>
                  <Combobox
                    options={entityTypes}
                    value={entityType}
                    onValueChange={(v) => { setEntityType(v); setEntityId("") }}
                    placeholder="Pilih tipe entity..."
                    searchPlaceholder="Cari tipe entity..."
                  />
                </FieldContent>
                <FieldDescription>Pilih apakah alamat ini milik Vendor atau Client</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="entity_id">Entity *</FieldLabel>
                <FieldContent>
                  <Combobox
                    options={entityOptions}
                    value={entityId}
                    onValueChange={(v) => setEntityId(v)}
                    placeholder={entityType ? "Pilih entity..." : "Pilih tipe terlebih dahulu"}
                    searchPlaceholder="Cari entity..."
                    disabled={!entityType}
                  />
                </FieldContent>
                <FieldDescription>Pilih entity spesifik yang akan dikaitkan dengan alamat ini</FieldDescription>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detail Alamat</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="label">Label *</FieldLabel>
                <FieldContent>
                  <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Contoh: Kantor Pusat, Gudang, Cabang" required />
                </FieldContent>
                <FieldDescription>Nama atau identitas untuk alamat ini</FieldDescription>
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="alamat">Alamat *</FieldLabel>
                <FieldContent>
                  <Textarea id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Jalan, gedung, nomor, RT/RW, dsb." required />
                </FieldContent>
                <FieldDescription>Alamat lengkap lokasi</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="provinsi">Provinsi *</FieldLabel>
                <FieldContent>
                  <Input id="provinsi" value={provinsi} onChange={(e) => setProvinsi(e.target.value)} placeholder="Contoh: Jawa Barat" required />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="kota">Kota *</FieldLabel>
                <FieldContent>
                  <Input id="kota" value={kota} onChange={(e) => setKota(e.target.value)} placeholder="Contoh: Bandung" required />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                <FieldContent>
                  <Input id="kecamatan" value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} placeholder="Contoh: Cicendo" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="kelurahan">Kelurahan</FieldLabel>
                <FieldContent>
                  <Input id="kelurahan" value={kelurahan} onChange={(e) => setKelurahan(e.target.value)} placeholder="Contoh: Pasir Kaliki" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="kode_pos">Kode Pos</FieldLabel>
                <FieldContent>
                  <Input id="kode_pos" value={kodePos} onChange={(e) => setKodePos(e.target.value)} placeholder="Contoh: 40171" />
                </FieldContent>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pengaturan</CardTitle></CardHeader>
          <CardContent>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={utama} onCheckedChange={(v) => setUtama(!!v)} />
                  Alamat utama
                </label>
              </FieldContent>
              <FieldDescription>Tandai sebagai alamat utama entity ini</FieldDescription>
            </Field>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                  Aktif
                </label>
              </FieldContent>
              <FieldDescription>Nonaktifkan untuk menyembunyikan alamat ini</FieldDescription>
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-6 py-4">
          <p className="text-sm text-muted-foreground">Pastikan semua data telah diisi dengan benar</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/alamat")}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
