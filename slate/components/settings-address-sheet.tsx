"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SaveIcon } from "lucide-react"

export interface AlamatKirim {
  id: string
  label: string
  alamat: string
  provinsi: string
  kota: string
  kecamatan: string
  kode_pos: string
}

export function SettingsAddressSheet({
  open,
  onOpenChange,
  editItem,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem: AlamatKirim | null
  onSave: (item: AlamatKirim) => void
}) {
  const [label, setLabel] = useState("")
  const [alamat, setAlamat] = useState("")
  const [provinsi, setProvinsi] = useState("")
  const [kota, setKota] = useState("")
  const [kecamatan, setKecamatan] = useState("")
  const [kodePos, setKodePos] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editItem) {
        setLabel(editItem.label)
        setAlamat(editItem.alamat)
        setProvinsi(editItem.provinsi)
        setKota(editItem.kota)
        setKecamatan(editItem.kecamatan)
        setKodePos(editItem.kode_pos)
      } else {
        setLabel("")
        setAlamat("")
        setProvinsi("")
        setKota("")
        setKecamatan("")
        setKodePos("")
      }
    }
  }, [open, editItem])

  async function handleSave() {
    if (!label.trim() || !alamat.trim() || !kota.trim()) {
      toast.error("Label, alamat, dan kota harus diisi")
      return
    }
    setSaving(true)
    onSave({
      id: editItem?.id || crypto.randomUUID(),
      label: label.trim(),
      alamat: alamat.trim(),
      provinsi: provinsi.trim(),
      kota: kota.trim(),
      kecamatan: kecamatan.trim(),
      kode_pos: kodePos.trim(),
    })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editItem ? "Edit Alamat" : "Tambah Alamat"}</SheetTitle>
          <SheetDescription>Simpan alamat kirim untuk digunakan saat membuat PO</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-6 py-4">
          <Field>
            <FieldLabel htmlFor="sas-label">Label *</FieldLabel>
            <FieldContent>
              <Input id="sas-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Kantor, Workshop, Gudang..." />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="sas-alamat">Alamat *</FieldLabel>
            <FieldContent>
              <Textarea id="sas-alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
            </FieldContent>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="sas-provinsi">Provinsi</FieldLabel>
              <FieldContent>
                <Input id="sas-provinsi" value={provinsi} onChange={(e) => setProvinsi(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="sas-kota">Kota *</FieldLabel>
              <FieldContent>
                <Input id="sas-kota" value={kota} onChange={(e) => setKota(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="sas-kecamatan">Kecamatan</FieldLabel>
              <FieldContent>
                <Input id="sas-kecamatan" value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="sas-kode_pos">Kode Pos</FieldLabel>
              <FieldContent>
                <Input id="sas-kode_pos" value={kodePos} onChange={(e) => setKodePos(e.target.value)} />
              </FieldContent>
            </Field>
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Batal</SheetClose>
          <Button onClick={handleSave} disabled={saving}>
            <SaveIcon />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
