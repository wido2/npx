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
import { Field, FieldLabel, FieldContent, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createKontak,
  updateKontak,
  type Kontak,
} from "@/lib/kontak-api"

interface KontakSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Kontak | null
}

export function KontakSheet({ open, onOpenChange, onSuccess, editItem }: KontakSheetProps) {
  const isEdit = !!editItem

  const [nama, setNama] = useState("")
  const [jabatan, setJabatan] = useState("")
  const [telepon, setTelepon] = useState("")
  const [hp, setHp] = useState("")
  const [email, setEmail] = useState("")
  const [utama, setUtama] = useState(false)
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setNama(editItem.nama)
      setJabatan(editItem.jabatan || "")
      setTelepon(editItem.telepon || "")
      setHp(editItem.hp || "")
      setEmail(editItem.email || "")
      setUtama(editItem.utama)
      setAktif(editItem.aktif)
    } else {
      resetForm()
    }
  }, [editItem, open])

  function resetForm() {
    setNama("")
    setJabatan("")
    setTelepon("")
    setHp("")
    setEmail("")
    setUtama(false)
    setAktif(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama) {
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
      }
      if (isEdit && editItem) {
        await updateKontak(editItem.id, payload)
        toast.success("Kontak updated")
      } else {
        await createKontak(payload)
        toast.success("Kontak created")
      }
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update kontak" : "Failed to create kontak")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Kontak" : "Add Kontak"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
          <FieldGroup>
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
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2">
                  <Checkbox checked={utama} onCheckedChange={(v) => setUtama(!!v)} />
                  <span className="text-xs">Utama</span>
                </label>
              </FieldContent>
              <FieldDescription>Kontak utama untuk entity ini</FieldDescription>
            </Field>
            <Field>
              <FieldContent>
                <label className="flex items-center gap-2">
                  <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                  <span className="text-xs">Active</span>
                </label>
              </FieldContent>
              <FieldDescription>Nonaktifkan untuk menyembunyikan kontak</FieldDescription>
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
