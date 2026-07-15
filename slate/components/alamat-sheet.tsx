"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldLabel, FieldContent, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createAlamat,
  updateAlamat,
  type Alamat,
} from "@/lib/alamat-api"

interface AlamatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Alamat | null
}

export function AlamatSheet({ open, onOpenChange, onSuccess, editItem }: AlamatSheetProps) {
  const isEdit = !!editItem

  const [label, setLabel] = useState("")
  const [alamat, setAlamat] = useState("")
  const [provinsi, setProvinsi] = useState("")
  const [kota, setKota] = useState("")
  const [kecamatan, setKecamatan] = useState("")
  const [kelurahan, setKelurahan] = useState("")
  const [kodePos, setKodePos] = useState("")
  const [utama, setUtama] = useState(false)
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setLabel(editItem.label)
      setAlamat(editItem.alamat)
      setProvinsi(editItem.provinsi)
      setKota(editItem.kota)
      setKecamatan(editItem.kecamatan || "")
      setKelurahan(editItem.kelurahan || "")
      setKodePos(editItem.kode_pos || "")
      setUtama(editItem.utama)
      setAktif(editItem.aktif)
    } else {
      resetForm()
    }
  }, [editItem, open])

  function resetForm() {
    setLabel("")
    setAlamat("")
    setProvinsi("")
    setKota("")
    setKecamatan("")
    setKelurahan("")
    setKodePos("")
    setUtama(false)
    setAktif(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label || !alamat || !provinsi || !kota) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
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
      }
      if (isEdit && editItem) {
        await updateAlamat(editItem.id, payload)
        toast.success("Alamat updated")
      } else {
        await createAlamat(payload)
        toast.success("Alamat created")
      }
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update alamat" : "Failed to create alamat")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Alamat" : "Add Alamat"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="label">Label *</FieldLabel>
              <FieldContent>
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="alamat">Alamat *</FieldLabel>
              <FieldContent>
                <Input id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="provinsi">Provinsi *</FieldLabel>
              <FieldContent>
                <Input id="provinsi" value={provinsi} onChange={(e) => setProvinsi(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="kota">Kota *</FieldLabel>
              <FieldContent>
                <Input id="kota" value={kota} onChange={(e) => setKota(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
              <FieldContent>
                <Input id="kecamatan" value={kecamatan} onChange={(e) => setKecamatan(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="kelurahan">Kelurahan</FieldLabel>
              <FieldContent>
                <Input id="kelurahan" value={kelurahan} onChange={(e) => setKelurahan(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="kode_pos">Kode Pos</FieldLabel>
              <FieldContent>
                <Input id="kode_pos" value={kodePos} onChange={(e) => setKodePos(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2">
                  <Checkbox checked={utama} onCheckedChange={(v) => setUtama(!!v)} />
                  <span className="text-xs">Utama</span>
                </label>
              </FieldContent>
            </Field>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2">
                  <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                  <span className="text-xs">Active</span>
                </label>
              </FieldContent>
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
