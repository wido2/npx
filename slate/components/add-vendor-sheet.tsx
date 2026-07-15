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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createVendor, updateVendor, type Vendor } from "@/lib/vendor-api"

interface AddVendorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Vendor | null
}

export function AddVendorSheet({ open, onOpenChange, onSuccess, editItem }: AddVendorSheetProps) {
  const isEdit = !!editItem
  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [npwp, setNpwp] = useState("")
  const [tipe, setTipe] = useState("supplier")
  const [keterangan, setKeterangan] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editItem) {
      setKode(editItem.kode)
      setNama(editItem.nama)
      setNpwp(editItem.npwp || "")
      setTipe(editItem.tipe)
      setKeterangan(editItem.keterangan || "")
      setAktif(editItem.aktif)
    } else {
      resetForm()
    }
  }, [editItem, open])

  function resetForm() {
    setKode("")
    setNama("")
    setNpwp("")
    setTipe("supplier")
    setKeterangan("")
    setAktif(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kode || !nama) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        kode: kode.trim(),
        nama: nama.trim(),
        npwp: npwp.trim() || undefined,
        tipe: tipe as "supplier" | "konsumen" | "keduanya",
        keterangan: keterangan.trim() || undefined,
        aktif,
      }
      if (isEdit && editItem) {
        await updateVendor(editItem.id, payload)
        toast.success("Vendor updated")
      } else {
        await createVendor(payload)
        toast.success("Vendor created")
      }
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update vendor" : "Failed to create vendor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Vendor" : "Add Vendor"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="kode">Kode *</FieldLabel>
              <FieldContent>
                <Input id="kode" value={kode} onChange={(e) => setKode(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="nama">Nama *</FieldLabel>
              <FieldContent>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="npwp">NPWP</FieldLabel>
              <FieldContent>
                <Input id="npwp" value={npwp} onChange={(e) => setNpwp(e.target.value)} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="tipe">Tipe *</FieldLabel>
              <FieldContent>
                <Select value={tipe} onValueChange={(v) => v && setTipe(v)} required>
                  <SelectTrigger id="tipe">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="konsumen">Konsumen</SelectItem>
                    <SelectItem value="keduanya">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="keterangan">Keterangan</FieldLabel>
              <FieldContent>
                <Textarea id="keterangan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
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
