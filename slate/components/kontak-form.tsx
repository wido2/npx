"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createKontak,
  updateKontak,
  fetchKontak,
} from "@/lib/kontak-api"
import { fetchVendors, type Vendor } from "@/lib/vendor-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { ArrowLeftIcon, LoaderIcon, SaveIcon } from "lucide-react"

interface Props {
  kontakId?: string
}

const entityTypes = [
  { value: "vendor", label: "Vendor" },
  { value: "client", label: "Client" },
]

export function KontakForm({ kontakId }: Props) {
  const router = useRouter()
  const isEdit = !!kontakId
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const [nama, setNama] = useState("")
  const [jabatan, setJabatan] = useState("")
  const [telepon, setTelepon] = useState("")
  const [hp, setHp] = useState("")
  const [email, setEmail] = useState("")
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
    if (!kontakId) return
    setLoading(true)
    try {
      const res = await fetchKontak({ page: 1, per_page: 1 })
      const item = res.data.find((k) => k.id === kontakId)
      if (!item) throw new Error("Not found")

      setNama(item.nama)
      setJabatan(item.jabatan || "")
      setTelepon(item.telepon || "")
      setHp(item.hp || "")
      setEmail(item.email || "")
      setUtama(item.utama)
      setAktif(item.aktif)

      const modelMap: Record<string, string> = {
        "App\\Models\\Vendor": "vendor",
        "App\\Models\\Client": "client",
      }
      setEntityType(modelMap[item.contactable_type] || "")
      setEntityId(item.contactable_id)
    } catch {
      toast.error("Failed to load kontak")
      router.push("/kontak")
    } finally {
      setLoading(false)
    }
  }, [kontakId, router])

  useEffect(() => {
    loadEntityData()
    if (isEdit) loadData()
  }, [isEdit, loadData, loadEntityData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama || !entityType || !entityId) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        nama: nama.trim(),
        jabatan: jabatan.trim() || undefined,
        telepon: telepon.trim() || undefined,
        hp: hp.trim() || undefined,
        email: email.trim() || undefined,
        utama,
        aktif,
        contactable_type: entityType,
        contactable_id: entityId,
      }
      if (isEdit && kontakId) {
        await updateKontak(kontakId, payload)
        toast.success("Kontak updated")
      } else {
        await createKontak(payload)
        toast.success("Kontak created")
      }
      router.push("/kontak")
    } catch {
      toast.error(isEdit ? "Failed to update kontak" : "Failed to create kontak")
    } finally {
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
        <Button variant="ghost" size="icon" onClick={() => router.push("/kontak")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Kontak" : "Tambah Kontak"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update contact information" : "Create a new contact"}</p>
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
                <FieldDescription>Pilih apakah kontak ini milik Vendor atau Client</FieldDescription>
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
                <FieldDescription>Pilih entity spesifik yang akan dikaitkan dengan kontak ini</FieldDescription>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informasi Kontak</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="nama">Nama *</FieldLabel>
                <FieldContent>
                  <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap kontak" required />
                </FieldContent>
                <FieldDescription>Nama orang yang akan dihubungi</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="jabatan">Jabatan</FieldLabel>
                <FieldContent>
                  <Input id="jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)} placeholder="Posisi/jabatan" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="telepon">Telepon</FieldLabel>
                <FieldContent>
                  <Input id="telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="Nomor telepon kantor" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="hp">HP</FieldLabel>
                <FieldContent>
                  <Input id="hp" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="Nomor handphone" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" />
                </FieldContent>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pengaturan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={utama} onCheckedChange={(v) => setUtama(!!v)} />
                  Kontak utama
                </label>
              </FieldContent>
              <FieldDescription>Kontak utama untuk entity ini</FieldDescription>
            </Field>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                  Aktif
                </label>
              </FieldContent>
              <FieldDescription>Nonaktifkan untuk menyembunyikan kontak ini</FieldDescription>
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-6 py-4">
          <p className="text-sm text-muted-foreground">Pastikan semua data telah diisi dengan benar</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/kontak")}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
