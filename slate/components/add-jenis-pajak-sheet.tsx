"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Field, FieldContent, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createJenisPajak, updateJenisPajak, type JenisPajak } from "@/lib/jenis-pajak-api"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: JenisPajak | null
}

export function AddJenisPajakSheet({ open, onOpenChange, onSuccess, editItem }: Props) {
  const isEdit = !!editItem
  const [nama, setNama] = useState("")
  const [persentase, setPersentase] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setNama(editItem.nama)
      setPersentase(String(editItem.persentase))
      setDeskripsi(editItem.deskripsi || "")
      setAktif(editItem.aktif)
    } else {
      setNama(""); setPersentase(""); setDeskripsi(""); setAktif(true)
    }
  }, [editItem, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nama || !persentase) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        nama: nama.trim(),
        persentase: parseFloat(persentase),
        deskripsi: deskripsi.trim() || undefined,
        aktif,
      }
      if (isEdit && editItem) {
        await updateJenisPajak(editItem.id, payload)
        toast.success("Tax type updated")
      } else {
        await createJenisPajak(payload)
        toast.success("Tax type created")
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update" : "Failed to create")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Tax Type" : "Add Tax Type"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nama">Nama Pajak *</FieldLabel>
              <FieldContent>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="persentase">Persentase (%) *</FieldLabel>
              <FieldContent>
                <Input id="persentase" type="number" step="0.01" value={persentase} onChange={(e) => setPersentase(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
              <FieldContent>
                <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
