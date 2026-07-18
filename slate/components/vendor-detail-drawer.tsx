"use client"

import { useCallback, useEffect, useState } from "react"
import {
  MapPinIcon, PhoneIcon, MailIcon, UserIcon, StarIcon,
  PencilIcon, Trash2Icon, PlusIcon, PackageIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldLabel, FieldContent, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  fetchVendorAddresses,
  createVendorAddress,
  updateVendorAddress,
  deleteVendorAddress,
  type VendorAddress,
} from "@/lib/vendor-address-api"
import {
  fetchVendorContacts,
  createVendorContact,
  updateVendorContact,
  deleteVendorContact,
  type VendorContact,
} from "@/lib/vendor-contact-api"
import { type Vendor } from "@/lib/vendor-api"
import { fetchHargaSuppliers, type HargaSupplier } from "@/lib/barang-api"
import { formatCurrency } from "@/lib/utils"

interface VendorDetailDrawerProps {
  vendor: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddressCard({
  address, index, onEdit, onDelete,
}: {
  address: VendorAddress
  index: number
  onEdit: (address: VendorAddress) => void
  onDelete: (address: VendorAddress) => void
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards rounded-lg border p-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">{address.label}</Badge>
        {address.utama && (
          <Badge variant="default" className="text-xs gap-1">
            <StarIcon className="size-2.5" />
            Utama
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PencilIcon className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(address)}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2Icon className="size-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-foreground">{address.alamat}</p>
      <p className="text-xs text-muted-foreground">
        {address.kelurahan && `${address.kelurahan}, `}
        {address.kecamatan && `${address.kecamatan}, `}
        {address.kota}, {address.provinsi}
        {address.kode_pos && ` ${address.kode_pos}`}
      </p>
    </div>
  )
}

function ContactCard({
  contact, index, onEdit, onDelete,
}: {
  contact: VendorContact
  index: number
  onEdit: (contact: VendorContact) => void
  onDelete: (contact: VendorContact) => void
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards rounded-lg border p-3"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xs font-medium">{contact.nama}</span>
        {contact.utama && (
          <Badge variant="default" className="text-xs gap-1">
            <StarIcon className="size-2.5" />
            Utama
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(contact)}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PencilIcon className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(contact)}
            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2Icon className="size-3" />
          </button>
        </div>
      </div>
      {contact.jabatan && (
        <p className="text-xs text-muted-foreground">{contact.jabatan}</p>
      )}
      <div className="mt-1.5 flex flex-col gap-1">
        {contact.telepon && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PhoneIcon className="size-3" />
            {contact.telepon}
          </div>
        )}
        {contact.hp && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PhoneIcon className="size-3" />
            {contact.hp}
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MailIcon className="size-3" />
            {contact.email}
          </div>
        )}
      </div>
    </div>
  )
}

export function VendorDetailDrawer({ vendor, open, onOpenChange }: VendorDetailDrawerProps) {
  const isMobile = useIsMobile()
  const [addresses, setAddresses] = useState<VendorAddress[]>([])
  const [contacts, setContacts] = useState<VendorContact[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<VendorAddress | null>(null)
  const [addrLabel, setAddrLabel] = useState("")
  const [addrAlamat, setAddrAlamat] = useState("")
  const [addrProvinsi, setAddrProvinsi] = useState("")
  const [addrKota, setAddrKota] = useState("")
  const [addrKecamatan, setAddrKecamatan] = useState("")
  const [addrKelurahan, setAddrKelurahan] = useState("")
  const [addrKodePos, setAddrKodePos] = useState("")
  const [addrUtama, setAddrUtama] = useState(false)
  const [addrAktif, setAddrAktif] = useState(true)
  const [submittingAddress, setSubmittingAddress] = useState(false)

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null)
  const [ctNama, setCtNama] = useState("")
  const [ctJabatan, setCtJabatan] = useState("")
  const [ctTelepon, setCtTelepon] = useState("")
  const [ctHp, setCtHp] = useState("")
  const [ctEmail, setCtEmail] = useState("")
  const [ctUtama, setCtUtama] = useState(false)
  const [ctAktif, setCtAktif] = useState(true)
  const [submittingContact, setSubmittingContact] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: "address" | "contact"; id: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadAddresses = useCallback(async () => {
    if (!vendor) return
    setLoadingAddresses(true)
    try {
      const data = await fetchVendorAddresses(vendor.id)
      setAddresses(data)
    } catch {
      toast.error("Failed to load addresses")
    } finally {
      setLoadingAddresses(false)
    }
  }, [vendor])

  const loadContacts = useCallback(async () => {
    if (!vendor) return
    setLoadingContacts(true)
    try {
      const data = await fetchVendorContacts(vendor.id)
      setContacts(data)
    } catch {
      toast.error("Failed to load contacts")
    } finally {
      setLoadingContacts(false)
    }
  }, [vendor])

  function resetAddressForm() {
    setAddrLabel("")
    setAddrAlamat("")
    setAddrProvinsi("")
    setAddrKota("")
    setAddrKecamatan("")
    setAddrKelurahan("")
    setAddrKodePos("")
    setAddrUtama(false)
    setAddrAktif(true)
    setEditingAddress(null)
    setShowAddressForm(false)
  }

  function resetContactForm() {
    setCtNama("")
    setCtJabatan("")
    setCtTelepon("")
    setCtHp("")
    setCtEmail("")
    setCtUtama(false)
    setCtAktif(true)
    setEditingContact(null)
    setShowContactForm(false)
  }

  function openNewAddressForm() {
    resetAddressForm()
    setShowAddressForm(true)
  }

  function openEditAddress(address: VendorAddress) {
    setAddrLabel(address.label)
    setAddrAlamat(address.alamat)
    setAddrProvinsi(address.provinsi)
    setAddrKota(address.kota)
    setAddrKecamatan(address.kecamatan || "")
    setAddrKelurahan(address.kelurahan || "")
    setAddrKodePos(address.kode_pos || "")
    setAddrUtama(address.utama)
    setAddrAktif(address.aktif)
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendor) return
    if (!addrLabel || !addrAlamat || !addrProvinsi || !addrKota) {
      toast.error("Harap isi semua field wajib")
      return
    }
    setSubmittingAddress(true)
    try {
      const payload = {
        label: addrLabel.trim(),
        alamat: addrAlamat.trim(),
        provinsi: addrProvinsi.trim(),
        kota: addrKota.trim(),
        kecamatan: addrKecamatan.trim() || undefined,
        kelurahan: addrKelurahan.trim() || undefined,
        kode_pos: addrKodePos.trim() || undefined,
        utama: addrUtama,
        aktif: addrAktif,
      }
      if (editingAddress) {
        await updateVendorAddress(editingAddress.id, payload)
        toast.success("Alamat berhasil diperbarui")
      } else {
        await createVendorAddress(vendor.id, payload)
        toast.success("Alamat berhasil ditambahkan")
      }
      resetAddressForm()
      loadAddresses()
    } catch {
      toast.error(editingAddress ? "Gagal memperbarui alamat" : "Gagal menambah alamat")
    } finally {
      setSubmittingAddress(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === "address") {
        await deleteVendorAddress(deleteTarget.id)
        toast.success("Alamat berhasil dihapus")
        loadAddresses()
      } else {
        await deleteVendorContact(deleteTarget.id)
        toast.success("Kontak berhasil dihapus")
        loadContacts()
      }
    } catch {
      toast.error("Gagal menghapus")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  function openNewContactForm() {
    resetContactForm()
    setShowContactForm(true)
  }

  function openEditContact(contact: VendorContact) {
    setCtNama(contact.nama)
    setCtJabatan(contact.jabatan || "")
    setCtTelepon(contact.telepon || "")
    setCtHp(contact.hp || "")
    setCtEmail(contact.email || "")
    setCtUtama(contact.utama)
    setCtAktif(contact.aktif)
    setEditingContact(contact)
    setShowContactForm(true)
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vendor) return
    if (!ctNama) {
      toast.error("Nama kontak wajib diisi")
      return
    }
    setSubmittingContact(true)
    try {
      const payload = {
        nama: ctNama.trim(),
        jabatan: ctJabatan.trim() || undefined,
        telepon: ctTelepon.trim() || undefined,
        hp: ctHp.trim() || undefined,
        email: ctEmail.trim() || undefined,
        utama: ctUtama,
        aktif: ctAktif,
      }
      if (editingContact) {
        await updateVendorContact(editingContact.id, payload)
        toast.success("Kontak berhasil diperbarui")
      } else {
        await createVendorContact(vendor.id, payload)
        toast.success("Kontak berhasil ditambahkan")
      }
      resetContactForm()
      loadContacts()
    } catch {
      toast.error(editingContact ? "Gagal memperbarui kontak" : "Gagal menambah kontak")
    } finally {
      setSubmittingContact(false)
    }
  }

  // Barang list
  const [hargaSuppliers, setHargaSuppliers] = useState<HargaSupplier[]>([])
  const [loadingBarang, setLoadingBarang] = useState(false)

  const loadHargaSuppliers = useCallback(async () => {
    if (!vendor) return
    setLoadingBarang(true)
    try {
      const res = await fetchHargaSuppliers({ vendor_id: vendor.id, per_page: 200 })
      setHargaSuppliers(res.data)
    } catch {
      toast.error("Gagal memuat daftar barang")
    } finally {
      setLoadingBarang(false)
    }
  }, [vendor])

  useEffect(() => {
    if (open && vendor) {
      loadAddresses()
      loadContacts()
      loadHargaSuppliers()
      resetAddressForm()
      resetContactForm()
    }
  }, [open, vendor, loadAddresses, loadContacts, loadHargaSuppliers])

  if (!vendor) return null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <div className="flex items-center gap-2">
            <DrawerTitle>{vendor.nama}</DrawerTitle>
            <Badge variant="outline" className="capitalize text-xs">
              {vendor.tipe}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{vendor.kode}</span>
            {vendor.npwp && (
              <>
                <Separator orientation="vertical" className="h-3" />
                <span>NPWP: {vendor.npwp}</span>
              </>
            )}
          </div>
          {vendor.keterangan && (
            <p className="text-xs text-muted-foreground">{vendor.keterangan}</p>
          )}
        </DrawerHeader>

        <Tabs defaultValue="alamat" className="flex flex-1 flex-col px-4">
          <TabsList className="w-full">
            <TabsTrigger value="barang" className="flex-1 gap-1.5">
              <PackageIcon className="size-3.5" />
              Barang
            </TabsTrigger>
            <TabsTrigger value="alamat" className="flex-1 gap-1.5">
              <MapPinIcon className="size-3.5" />
              Alamat
            </TabsTrigger>
            <TabsTrigger value="kontak" className="flex-1 gap-1.5">
              <UserIcon className="size-3.5" />
              Kontak
            </TabsTrigger>
          </TabsList>

          <TabsContent value="barang" className="flex-1 overflow-y-auto pb-4 pt-2">
            {loadingBarang ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading...</p>
            ) : hargaSuppliers.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Tidak ada barang untuk vendor ini.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {hargaSuppliers.map((hs) => (
                  <div key={hs.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{hs.barang?.nama || "-"}</p>
                        <p className="text-xs text-muted-foreground">{hs.barang?.kode || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium tabular-nums">{formatCurrency(hs.harga_beli)}</p>
                        {hs.keterangan && (
                          <p className="text-xs text-muted-foreground">{hs.keterangan}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alamat" className="flex-1 overflow-y-auto pb-4 pt-2">
            {showAddressForm ? (
              <form onSubmit={handleAddressSubmit} className="mb-4 rounded-lg border p-3">
                <p className="mb-3 text-xs font-medium">
                  {editingAddress ? "Edit Alamat" : "Tambah Alamat"}
                </p>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="addrLabel">Label *</FieldLabel>
                    <FieldContent>
                      <Input id="addrLabel" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrAlamat">Alamat *</FieldLabel>
                    <FieldContent>
                      <Input id="addrAlamat" value={addrAlamat} onChange={(e) => setAddrAlamat(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrProvinsi">Provinsi *</FieldLabel>
                    <FieldContent>
                      <Input id="addrProvinsi" value={addrProvinsi} onChange={(e) => setAddrProvinsi(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrKota">Kota *</FieldLabel>
                    <FieldContent>
                      <Input id="addrKota" value={addrKota} onChange={(e) => setAddrKota(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrKecamatan">Kecamatan</FieldLabel>
                    <FieldContent>
                      <Input id="addrKecamatan" value={addrKecamatan} onChange={(e) => setAddrKecamatan(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrKelurahan">Kelurahan</FieldLabel>
                    <FieldContent>
                      <Input id="addrKelurahan" value={addrKelurahan} onChange={(e) => setAddrKelurahan(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="addrKodePos">Kode Pos</FieldLabel>
                    <FieldContent>
                      <Input id="addrKodePos" value={addrKodePos} onChange={(e) => setAddrKodePos(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={addrUtama} onCheckedChange={(v) => setAddrUtama(!!v)} />
                        <span className="text-xs">Utama</span>
                      </label>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={addrAktif} onCheckedChange={(v) => setAddrAktif(!!v)} />
                        <span className="text-xs">Active</span>
                      </label>
                    </FieldContent>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={resetAddressForm}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" disabled={submittingAddress}>
                    {submittingAddress ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant="outline" size="sm" className="mb-3 h-7 w-full" onClick={openNewAddressForm}>
                <PlusIcon className="size-3.5" />
                Tambah Alamat
              </Button>
            )}

            {loadingAddresses ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading...</p>
            ) : addresses.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Tidak ada alamat.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {addresses.map((address, i) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    index={i}
                    onEdit={openEditAddress}
                    onDelete={(a) => setDeleteTarget({ type: "address", id: a.id })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kontak" className="flex-1 overflow-y-auto pb-4 pt-2">
            {showContactForm ? (
              <form onSubmit={handleContactSubmit} className="mb-4 rounded-lg border p-3">
                <p className="mb-3 text-xs font-medium">
                  {editingContact ? "Edit Kontak" : "Tambah Kontak"}
                </p>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="ctNama">Nama *</FieldLabel>
                    <FieldContent>
                      <Input id="ctNama" value={ctNama} onChange={(e) => setCtNama(e.target.value)} required />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ctJabatan">Jabatan</FieldLabel>
                    <FieldContent>
                      <Input id="ctJabatan" value={ctJabatan} onChange={(e) => setCtJabatan(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ctTelepon">Telepon</FieldLabel>
                    <FieldContent>
                      <Input id="ctTelepon" value={ctTelepon} onChange={(e) => setCtTelepon(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ctHp">HP</FieldLabel>
                    <FieldContent>
                      <Input id="ctHp" value={ctHp} onChange={(e) => setCtHp(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ctEmail">Email</FieldLabel>
                    <FieldContent>
                      <Input id="ctEmail" type="email" value={ctEmail} onChange={(e) => setCtEmail(e.target.value)} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={ctUtama} onCheckedChange={(v) => setCtUtama(!!v)} />
                        <span className="text-xs">Utama</span>
                      </label>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldContent>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={ctAktif} onCheckedChange={(v) => setCtAktif(!!v)} />
                        <span className="text-xs">Active</span>
                      </label>
                    </FieldContent>
                  </Field>
                </FieldGroup>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={resetContactForm}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" disabled={submittingContact}>
                    {submittingContact ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant="outline" size="sm" className="mb-3 h-7 w-full" onClick={openNewContactForm}>
                <PlusIcon className="size-3.5" />
                Tambah Kontak
              </Button>
            )}

            {loadingContacts ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Loading...</p>
            ) : contacts.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Tidak ada kontak.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {contacts.map((contact, i) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    index={i}
                    onEdit={openEditContact}
                    onDelete={(c) => setDeleteTarget({ type: "contact", id: c.id })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteTarget} onOpenChange={() => !deleting && setDeleteTarget(null)}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <Trash2Icon className="text-destructive" />
              </AlertDialogMedia>
              <AlertDialogTitle>
                Hapus {deleteTarget?.type === "address" ? "alamat" : "kontak"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DrawerContent>
    </Drawer>
  )
}
