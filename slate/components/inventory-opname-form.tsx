"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { createOpname } from "@/lib/inventory-api"
import { fetchBarangs, type Barang } from "@/lib/barang-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircleIcon, CheckCircle2Icon, SaveIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function InventoryOpnameForm() {
  const { can } = useAuth()

  const [barangs, setBarangs] = useState<Barang[]>([])
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null)
  const [stokBaru, setStokBaru] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [barangsLoading, setBarangsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)
  const [success, setSuccess] = useState(false)

  const loadBarangs = useCallback(() => {
    setBarangsLoading(true)
    fetchBarangs({ per_page: 200, sort_field: "nama", sort_dir: "asc" })
      .then((res) => setBarangs(res.data))
      .catch(() => toast.error("Gagal memuat barang"))
      .finally(() => setBarangsLoading(false))
  }, [])

  useEffect(() => { loadBarangs() }, [loadBarangs])

  function handleBarangSelect(value: string) {
    const b = barangs.find((x) => x.id === value) || null
    setSelectedBarang(b)
    setStokBaru(b ? String(b.stok) : "")
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (!selectedBarang || !stokBaru) {
      submitRef.current = false
      setSubmitting(false)
      return
    }

    const stokBaruNum = Number(stokBaru)
    if (stokBaruNum < 0 || !Number.isInteger(stokBaruNum)) {
      toast.error("Stok baru harus angka bulat ≥ 0")
      submitRef.current = false
      setSubmitting(false)
      return
    }

    try {
      await createOpname({
        barang_id: selectedBarang.id,
        stok_baru: stokBaruNum,
        keterangan: keterangan || undefined,
      })
      toast.success(`Stok ${selectedBarang.nama} berhasil dinormalisasi`)
      setSuccess(true)
      loadBarangs()
    } catch {
      toast.error("Gagal melakukan opname")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  const diff = selectedBarang && stokBaru !== ""
    ? Number(stokBaru) - selectedBarang.stok
    : 0

  if (!can("inventory.opname")) {
    return <p className="text-sm text-muted-foreground">Anda tidak memiliki izin untuk melakukan opname stok.</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Normalisasi Stok (Opname)</CardTitle>
          <CardDescription>Pilih barang dan masukkan stok aktual hasil opname fisik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barang">Barang *</Label>
              <Combobox
                options={barangs.map((b) => ({ value: b.id, label: `${b.kode} — ${b.nama}` }))}
                value={selectedBarang?.id || ""}
                onValueChange={(v) => handleBarangSelect(v)}
                placeholder="Pilih barang..."
                searchPlaceholder="Cari barang..."
              />
            </div>

            {selectedBarang && (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stok Saat Ini</span>
                    <span className="font-bold tabular-nums">{selectedBarang.stok}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stok Minimum</span>
                    <span className="tabular-nums">{selectedBarang.stok_minimum}</span>
                  </div>
                  {selectedBarang.stok_minimum > 0 && selectedBarang.stok <= selectedBarang.stok_minimum && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircleIcon className="size-3.5" />
                      Stok di bawah atau sama dengan minimum
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stok_baru">Stok Baru (hasil opname) *</Label>
                  <Input
                    id="stok_baru"
                    type="number"
                    min={0}
                    value={stokBaru}
                    onChange={(e) => setStokBaru(e.target.value)}
                    className="tabular-nums"
                    required
                  />
                  {stokBaru !== "" && (
                    <p className={cn("text-xs", diff === 0 ? "text-muted-foreground" : diff > 0 ? "text-emerald-600" : "text-red-600")}>
                      {diff === 0
                        ? "Tidak ada perubahan"
                        : `${diff > 0 ? "+" : ""}${diff} dari stok saat ini`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keterangan_opname">Keterangan</Label>
                  <Textarea
                    id="keterangan_opname"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Alasan opname (opsional)"
                    rows={2}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan Opname"}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      {success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2Icon className="size-5" />
              Berhasil
            </CardTitle>
            <CardDescription>
              Stok <strong>{selectedBarang?.nama}</strong> telah dinormalisasi menjadi <strong>{stokBaru}</strong>.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
