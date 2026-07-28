"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createProject, updateProject, fetchProject } from "@/lib/project-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { fetchUnits, type Unit } from "@/lib/unit-api"
import { ArrowLeftIcon, LoaderIcon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"

interface ProjectRow {
  tempId: string
  kode: string
  nama: string
  unitId: string
  jumlah: string
  nilaiKontrak: string
}

let tempIdCounter = 0

function makeRow(): ProjectRow {
  return {
    tempId: `new-${++tempIdCounter}`,
    kode: "",
    nama: "",
    unitId: "",
    jumlah: "",
    nilaiKontrak: "",
  }
}

interface Props {
  projectId?: string
}

export function ProjectForm({ projectId }: Props) {
  const router = useRouter()
  const isEdit = !!projectId
  const [loading, setLoading] = useState(isEdit)
  const [clients, setClients] = useState<Client[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [submitting, setSubmitting] = useState(false)
  const submitRef = useRef(false)

  const [clientId, setClientId] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalSelesai, setTanggalSelesai] = useState("")
  const [status, setStatus] = useState("aktif")

  const [rows, setRows] = useState<ProjectRow[]>([makeRow()])

  const loadRefs = useCallback(async () => {
    try {
      const [clientsRes, unitsRes] = await Promise.all([
        fetchClients({ per_page: 100 }),
        fetchUnits(),
      ])
      setClients(clientsRes.data)
      setUnits(unitsRes)
    } catch {
      toast.error("Failed to load references")
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const project = await fetchProject(projectId)
      setClientId(project.client_id)
      setDeskripsi(project.deskripsi || "")
      setTanggalMulai(project.tanggal_mulai || "")
      setTanggalSelesai(project.tanggal_selesai || "")
      setStatus(project.status)
      setRows([{
        tempId: `existing-${project.id}`,
        kode: project.kode,
        nama: project.nama,
        unitId: project.unit_id,
        jumlah: project.jumlah != null ? String(project.jumlah) : "",
        nilaiKontrak: project.nilai_kontrak != null ? String(project.nilai_kontrak) : "",
      }])
    } catch {
      toast.error("Failed to load project")
      router.push("/project")
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    loadRefs()
    if (isEdit) loadData()
  }, [isEdit, loadData, loadRefs])

  function addRow() {
    setRows((prev) => [...prev, makeRow()])
  }

  function removeRow(tempId: string) {
    setRows((prev) => prev.filter((r) => r.tempId !== tempId))
  }

  function updateRow(tempId: string, field: keyof ProjectRow, value: string) {
    setRows((prev) => prev.map((r) => r.tempId === tempId ? { ...r, [field]: value } : r))
  }

  const duplicateKodes = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of rows) {
      const k = r.kode.trim().toUpperCase()
      if (k) counts.set(k, (counts.get(k) || 0) + 1)
    }
    return new Set(
      [...counts.entries()]
        .filter(([, c]) => c > 1)
        .map(([k]) => k)
    )
  }, [rows])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (submitRef.current) return
    submitRef.current = true
    setSubmitting(true)

    if (!clientId) {
      toast.error("Pilih client terlebih dahulu")
      submitRef.current = false
      setSubmitting(false)
      return
    }

    for (const row of rows) {
      if (!row.kode.trim() || !row.nama.trim()) {
        toast.error("Semua baris harus memiliki Kode dan Nama project")
        submitRef.current = false
        setSubmitting(false)
        return
      }
    }

    if (duplicateKodes.size > 0) {
      toast.error(`Kode project duplikat: ${[...duplicateKodes].join(", ")}`)
      submitRef.current = false
      setSubmitting(false)
      return
    }
    try {
      if (isEdit && projectId) {
        const row = rows[0]
        await updateProject(projectId, {
          kode: row.kode.trim(),
          nama: row.nama.trim(),
          client_id: clientId,
          unit_id: row.unitId,
          deskripsi: deskripsi.trim() || undefined,
          nilai_kontrak: row.nilaiKontrak ? parseFloat(row.nilaiKontrak) : undefined,
          jumlah: row.jumlah ? parseInt(row.jumlah, 10) : undefined,
          tanggal_mulai: tanggalMulai || undefined,
          tanggal_selesai: tanggalSelesai || undefined,
          status,
        })
        toast.success("Project updated")
      } else {
        let created = 0
        const errors: string[] = []
        for (const row of rows) {
          try {
            await createProject({
              kode: row.kode.trim(),
              nama: row.nama.trim(),
              client_id: clientId,
              unit_id: row.unitId,
              deskripsi: deskripsi.trim() || undefined,
              nilai_kontrak: row.nilaiKontrak ? parseFloat(row.nilaiKontrak) : undefined,
              jumlah: row.jumlah ? parseInt(row.jumlah, 10) : undefined,
              tanggal_mulai: tanggalMulai || undefined,
              tanggal_selesai: tanggalSelesai || undefined,
              status,
            })
            created++
          } catch {
            errors.push(row.kode)
          }
        }
        if (errors.length > 0) {
          toast.error(`Gagal membuat: ${errors.join(", ")}`)
          if (created > 0) toast.success(`${created} project berhasil dibuat`)
        } else {
          toast.success(`${created} project berhasil dibuat`)
        }
      }
      router.push("/project")
    } catch {
      toast.error(isEdit ? "Failed to update project" : "Failed to create projects")
    } finally {
      submitRef.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  const unitLabel = (id: string) => units.find((u) => u.id === id)?.nama || "-"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/project")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Project" : "Add Project"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update project information" : "Buat satu atau lebih project sekaligus"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informasi Project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Field className="min-w-[200px] flex-1">
                <FieldLabel htmlFor="client_id">Client *</FieldLabel>
                <FieldContent>
                  <Combobox
                    options={clients.map((c) => ({ value: c.id, label: `${c.kode} - ${c.nama}` }))}
                    value={clientId}
                    onValueChange={(v) => setClientId(v)}
                    placeholder="Pilih client..."
                    searchPlaceholder="Cari client..."
                  />
                </FieldContent>
                <FieldDescription>Client untuk semua project</FieldDescription>
              </Field>
              <Field className="min-w-[150px] flex-1">
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <FieldContent>
                  <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                    <SelectTrigger id="status"><SelectValue placeholder="Pilih status..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="ditunda">Ditunda</SelectItem>
                      <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
                <FieldDescription>Status untuk semua project</FieldDescription>
              </Field>
              <Field className="min-w-[160px] flex-1">
                <FieldLabel htmlFor="tanggal_mulai">Tanggal Mulai</FieldLabel>
                <FieldContent>
                  <Input id="tanggal_mulai" type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
                </FieldContent>
                <FieldDescription>Berlaku untuk semua project</FieldDescription>
              </Field>
              <Field className="min-w-[160px] flex-1">
                <FieldLabel htmlFor="tanggal_selesai">Tanggal Selesai</FieldLabel>
                <FieldContent>
                  <Input id="tanggal_selesai" type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
                </FieldContent>
                <FieldDescription>Berlaku untuk semua project</FieldDescription>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="deskripsi">Deskripsi</FieldLabel>
              <FieldContent>
                <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi dan ruang lingkup project" />
              </FieldContent>
              <FieldDescription>Berlaku untuk semua project</FieldDescription>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Project</CardTitle>
              <p className="text-sm text-muted-foreground">Kode project harus unik</p>
            </div>
            {!isEdit && (
              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <PlusIcon className="size-4" /> Tambah Baris
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead className="w-[150px]">Kode *</TableHead>
                    <TableHead className="w-[400px]">Nama Project *</TableHead>
                    <TableHead className="w-[80px]">Jumlah</TableHead>
                    <TableHead className="w-[150px]">Unit</TableHead>
                    <TableHead className="w-[200px]">Nilai Kontrak</TableHead>
                    {!isEdit && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={row.tempId}>
                      <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={row.kode}
                          onChange={(e) => updateRow(row.tempId, "kode", e.target.value)}
                          placeholder="PRJ-001"
                          className={duplicateKodes.has(row.kode.trim().toUpperCase()) ? "border-destructive" : ""}
                        />
                        {duplicateKodes.has(row.kode.trim().toUpperCase()) && (
                          <p className="text-xs text-destructive mt-1">Duplikat</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.nama}
                          onChange={(e) => updateRow(row.tempId, "nama", e.target.value)}
                          placeholder="Nama project"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={row.jumlah}
                          onChange={(e) => updateRow(row.tempId, "jumlah", e.target.value)}
                          placeholder="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Combobox
                          options={units.map((u) => ({ value: u.id, label: u.nama }))}
                          value={row.unitId}
                          onValueChange={(v) => updateRow(row.tempId, "unitId", v)}
                          placeholder="Pilih unit..."
                          searchPlaceholder="Cari unit..."
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          value={row.nilaiKontrak}
                          onChange={(e) => updateRow(row.tempId, "nilaiKontrak", e.target.value)}
                          placeholder="0"
                        />
                      </TableCell>
                      {!isEdit && (
                        <TableCell>
                          {rows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive"
                              onClick={() => removeRow(row.tempId)}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Pastikan data telah benar" : `${rows.length} project akan dibuat`}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/project")}>Batal</Button>
            <Button type="submit" disabled={submitting}>
              <SaveIcon /> {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
