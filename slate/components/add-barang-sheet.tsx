"use client"

import { useEffect, useMemo, useState } from "react"
import { PlusIcon, SearchIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldGroup, FieldContent, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  fetchCategories,
  createCategory,
  fetchUnits,
  createUnit,
  createBarang,
  updateBarang,
  type Kategori,
  type Unit,
  type Barang,
} from "@/lib/barang-api"

interface AddBarangSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: Barang | null
}

export function AddBarangSheet({ open, onOpenChange, onSuccess, editItem }: AddBarangSheetProps) {
  const isEdit = !!editItem
  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [kategoriId, setKategoriId] = useState("")
  const [unitId, setUnitId] = useState("")
  const [hargaBeli, setHargaBeli] = useState("")
  const [stok, setStok] = useState("")
  const [stokMinimum, setStokMinimum] = useState("")
  const [gambar, setGambar] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [categories, setCategories] = useState<Kategori[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [kategoriPopoverOpen, setKategoriPopoverOpen] = useState(false)
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false)
  const [kategoriSearch, setKategoriSearch] = useState("")
  const [unitSearch, setUnitSearch] = useState("")
  const [kategoriCreateOpen, setKategoriCreateOpen] = useState(false)
  const [unitCreateOpen, setUnitCreateOpen] = useState(false)
  const [newKategoriNama, setNewKategoriNama] = useState("")
  const [newUnitNama, setNewUnitNama] = useState("")
  const [newUnitSingkatan, setNewUnitSingkatan] = useState("")

  useEffect(() => {
    if (open) {
      fetchCategories().then(setCategories).catch(() => toast.error("Failed to load categories"))
      fetchUnits().then(setUnits).catch(() => toast.error("Failed to load units"))
    }
  }, [open])

  useEffect(() => {
    if (editItem) {
      setKode(editItem.kode)
      setNama(editItem.nama)
      setDeskripsi(editItem.deskripsi || "")
      setKategoriId(editItem.kategori_id ?? "")
      setUnitId(editItem.unit_id ?? "")
      setHargaBeli(String(editItem.harga_beli))
      setStok(String(editItem.stok))
      setStokMinimum(String(editItem.stok_minimum))
      setGambar(editItem.gambar || "")
      setAktif(editItem.aktif)
    } else {
      resetForm()
    }
  }, [editItem, open])

  function resetForm() {
    setKode("")
    setNama("")
    setDeskripsi("")
    setKategoriId("")
    setUnitId("")
    setHargaBeli("")
    setStok("")
    setStokMinimum("")
    setGambar("")
    setAktif(true)
    setKategoriSearch("")
    setUnitSearch("")
  }

  const selectedKategori = useMemo(
    () => categories.find((k) => k.id === kategoriId),
    [categories, kategoriId],
  )
  const selectedUnit = useMemo(
    () => units.find((u) => u.id === unitId),
    [units, unitId],
  )

  const filteredKategori = useMemo(() => {
    if (!kategoriSearch) return categories
    return categories.filter((k) =>
      k.nama.toLowerCase().includes(kategoriSearch.toLowerCase()),
    )
  }, [categories, kategoriSearch])

  const filteredUnit = useMemo(() => {
    if (!unitSearch) return units
    return units.filter((u) =>
      u.nama.toLowerCase().includes(unitSearch.toLowerCase()),
    )
  }, [units, unitSearch])

  async function handleCreateKategori() {
    if (!newKategoriNama.trim()) return
    try {
      const kategori = await createCategory(newKategoriNama.trim())
      setCategories((prev) => [...prev, kategori])
      setKategoriId(kategori.id)
      setKategoriCreateOpen(false)
      setNewKategoriNama("")
      setKategoriSearch("")
      toast.success(`Category "${kategori.nama}" created`)
    } catch {
      toast.error("Failed to create category")
    }
  }

  async function handleCreateUnit() {
    if (!newUnitNama.trim() || !newUnitSingkatan.trim()) return
    try {
      const unit = await createUnit(newUnitNama.trim(), newUnitSingkatan.trim())
      setUnits((prev) => [...prev, unit])
      setUnitId(unit.id)
      setUnitCreateOpen(false)
      setNewUnitNama("")
      setNewUnitSingkatan("")
      setUnitSearch("")
      toast.success(`Unit "${unit.nama}" created`)
    } catch {
      toast.error("Failed to create unit")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kode || !nama || !kategoriId || !unitId || !hargaBeli || !stok) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        kode: kode.trim(),
        nama: nama.trim(),
        deskripsi: deskripsi.trim() || undefined,
        kategori_id: kategoriId,
        unit_id: unitId,
        harga_beli: Number(hargaBeli),
        stok: Number(stok),
        stok_minimum: stokMinimum ? Number(stokMinimum) : undefined,
        gambar: gambar.trim() || undefined,
        aktif,
      }
      if (isEdit && editItem) {
        await updateBarang(editItem.id, payload)
        toast.success("Barang updated")
      } else {
        await createBarang(payload)
        toast.success("Barang created")
      }
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? "Failed to update barang" : "Failed to create barang")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{isEdit ? "Edit Barang" : "Add Barang"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-0">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="kode">Kode *</FieldLabel>
                <FieldContent>
                  <Input id="kode" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Kode unik barang" required />
                </FieldContent>
                <FieldDescription>Kode identifikasi untuk barang</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="nama">Nama *</FieldLabel>
                <FieldContent>
                  <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama barang" required />
                </FieldContent>
                <FieldDescription>Nama lengkap barang</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
                <FieldContent>
                  <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi barang" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Kategori *</FieldLabel>
                <FieldContent>
                  <Popover
                    open={kategoriPopoverOpen}
                    onOpenChange={setKategoriPopoverOpen}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedKategori?.nama || "Select category..."}
                          <SearchIcon className="ml-2 size-3.5 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent align="start" className="w-[--anchor-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search category..."
                          value={kategoriSearch}
                          onValueChange={setKategoriSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {kategoriSearch ? "No category found" : "Type to search"}
                          </CommandEmpty>
                          {filteredKategori.length > 0 && (
                            <CommandGroup>
                              {filteredKategori.map((k) => (
                                <CommandItem
                                  key={k.id}
                                  value={k.nama}
                                  onSelect={() => {
                                    setKategoriId(k.id)
                                    setKategoriPopoverOpen(false)
                                    setKategoriSearch("")
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "size-3.5",
                                      k.id === kategoriId ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {k.nama}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {kategoriSearch && (
                            <>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setNewKategoriNama(kategoriSearch)
                                    setKategoriCreateOpen(true)
                                  }}
                                >
                                  <PlusIcon className="size-3.5" />
                                  Add &quot;{kategoriSearch}&quot;
                                </CommandItem>
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Unit *</FieldLabel>
                <FieldContent>
                  <Popover
                    open={unitPopoverOpen}
                    onOpenChange={setUnitPopoverOpen}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedUnit
                            ? `${selectedUnit.nama} (${selectedUnit.singkatan})`
                            : "Select unit..."}
                          <SearchIcon className="ml-2 size-3.5 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent align="start" className="w-[--anchor-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search unit..."
                          value={unitSearch}
                          onValueChange={setUnitSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {unitSearch ? "No unit found" : "Type to search"}
                          </CommandEmpty>
                          {filteredUnit.length > 0 && (
                            <CommandGroup>
                              {filteredUnit.map((u) => (
                                <CommandItem
                                  key={u.id}
                                  value={u.nama}
                                  onSelect={() => {
                                    setUnitId(u.id)
                                    setUnitPopoverOpen(false)
                                    setUnitSearch("")
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "size-3.5",
                                      u.id === unitId ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {u.nama} ({u.singkatan})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {unitSearch && (
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setNewUnitNama(unitSearch)
                                  setUnitCreateOpen(true)
                                }}
                              >
                                <PlusIcon className="size-3.5" />
                                Add &quot;{unitSearch}&quot;
                              </CommandItem>
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="harga_beli">Harga Beli *</FieldLabel>
                <FieldContent>
                  <Input
                    id="harga_beli"
                    type="number"
                    min="0"
                    value={hargaBeli}
                    onChange={(e) => setHargaBeli(e.target.value)}
                    placeholder="0"
                    required
                  />
                </FieldContent>
                <FieldDescription>Harga beli barang per unit</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="stok">Stok *</FieldLabel>
                <FieldContent>
                  <Input
                    id="stok"
                    type="number"
                    min="0"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="0"
                    required
                  />
                </FieldContent>
                <FieldDescription>Jumlah stok awal barang</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="stok_minimum">Stok Minimum</FieldLabel>
                <FieldContent>
                  <Input
                    id="stok_minimum"
                    type="number"
                    min="0"
                    value={stokMinimum}
                    onChange={(e) => setStokMinimum(e.target.value)}
                    placeholder="0"
                  />
                </FieldContent>
                <FieldDescription>Peringatan stok minimum (opsional)</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="gambar">Gambar URL</FieldLabel>
                <FieldContent>
                  <Input id="gambar" value={gambar} onChange={(e) => setGambar(e.target.value)} placeholder="https://contoh.com/gambar.jpg" />
                </FieldContent>
              </Field>
              <Field>
                <FieldContent>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={aktif} onCheckedChange={(v) => setAktif(!!v)} />
                    <span className="text-xs">Active</span>
                  </label>
                </FieldContent>
                <FieldDescription>Nonaktifkan untuk menyembunyikan barang</FieldDescription>
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

      <Dialog open={kategoriCreateOpen} onOpenChange={setKategoriCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Enter the name of the new category.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-kategori-nama">Category Name</FieldLabel>
              <FieldContent>
                <Input
                  id="new-kategori-nama"
                  value={newKategoriNama}
                  onChange={(e) => setNewKategoriNama(e.target.value)}
                  placeholder="Electronics"
                  autoFocus
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKategoriCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKategori}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unitCreateOpen} onOpenChange={setUnitCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
            <DialogDescription>Enter the name and abbreviation of the new unit.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-unit-nama">Unit Name</FieldLabel>
              <FieldContent>
                <Input
                  id="new-unit-nama"
                  value={newUnitNama}
                  onChange={(e) => setNewUnitNama(e.target.value)}
                  placeholder="Piece"
                  autoFocus
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="new-unit-singkatan">Abbreviation</FieldLabel>
              <FieldContent>
                <Input
                  id="new-unit-singkatan"
                  value={newUnitSingkatan}
                  onChange={(e) => setNewUnitSingkatan(e.target.value)}
                  placeholder="pcs"
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUnit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
