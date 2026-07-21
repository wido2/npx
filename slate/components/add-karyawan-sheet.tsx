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
import { Field, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createKaryawan, updateKaryawan, type Karyawan } from "@/lib/karyawan-api"

interface AddKaryawanSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Karyawan | null
}

export function AddKaryawanSheet({ open, onOpenChange, onSuccess, editItem }: AddKaryawanSheetProps) {
  const isEdit = !!editItem
  const [nip, setNip] = useState("")
  const [nama, setNama] = useState("")
  const [jabatan, setJabatan] = useState("")
  const [telepon, setTelepon] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setNip(editItem.nip || "")
      setNama(editItem.nama)
      setJabatan(editItem.jabatan || "")
      setTelepon(editItem.telepon || "")
      setAktif(editItem.aktif)
    } else {
      setNip("")
      setNama("")
      setJabatan("")
      setTelepon("")
      setAktif(true)
    }
  }, [editItem, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama.trim()) return toast.error("Nama harus diisi")

    setSubmitting(true)
    try {
      if (isEdit && editItem) {
        await updateKaryawan(editItem.id, { nip: nip || undefined, nama: nama.trim(), jabatan: jabatan || undefined, telepon: telepon || undefined, aktif })
        toast.success("Karyawan updated")
      } else {
        await createKaryawan({ nip: nip || undefined, nama: nama.trim(), jabatan: jabatan || undefined, telepon: telepon || undefined, aktif })
        toast.success("Karyawan created")
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update karyawan" : "Failed to create karyawan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Karyawan" : "Tambah Karyawan"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <Field>
            <FieldLabel htmlFor="nip">NIP</FieldLabel>
            <FieldContent>
              <Input id="nip" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Nomor Induk Pegawai" />
            </FieldContent>
            <FieldDescription>Nomor identitas pegawai (opsional)</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="nama">Nama *</FieldLabel>
            <FieldContent>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap karyawan" required />
            </FieldContent>
            <FieldDescription>Nama lengkap karyawan</FieldDescription>
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
              <Input id="telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="Nomor telepon" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                Aktif
              </label>
            </FieldContent>
            <FieldDescription>Nonaktifkan untuk menonaktifkan karyawan</FieldDescription>
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
