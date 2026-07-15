"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProject, updateProject, fetchProject } from "@/lib/project-api"
import { fetchClients, type Client } from "@/lib/client-api"
import { fetchUnits, type Unit } from "@/lib/unit-api"
import { ArrowLeftIcon, LoaderIcon, SaveIcon } from "lucide-react"

interface Props {
  projectId?: string
}

export function ProjectForm({ projectId }: Props) {
  const router = useRouter()
  const isEdit = !!projectId
  const [loading, setLoading] = useState(isEdit)
  const [clients, setClients] = useState<Client[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [clientId, setClientId] = useState("")
  const [unitId, setUnitId] = useState("")
  const [deskripsi, setDeskripsi] = useState("")
  const [nilaiKontrak, setNilaiKontrak] = useState("")
  const [tanggalMulai, setTanggalMulai] = useState("")
  const [tanggalSelesai, setTanggalSelesai] = useState("")
  const [status, setStatus] = useState("aktif")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
      setKode(project.kode)
      setNama(project.nama)
      setClientId(project.client_id)
      setUnitId(project.unit_id)
      setDeskripsi(project.deskripsi || "")
      setNilaiKontrak(project.nilai_kontrak != null ? String(project.nilai_kontrak) : "")
      setTanggalMulai(project.tanggal_mulai || "")
      setTanggalSelesai(project.tanggal_selesai || "")
      setStatus(project.status)
      setAktif(project.aktif)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kode || !nama || !clientId || !unitId) {
      toast.error("Please fill all required fields")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        kode: kode.trim(),
        nama: nama.trim(),
        client_id: clientId,
        unit_id: unitId,
        deskripsi: deskripsi.trim() || undefined,
        nilai_kontrak: nilaiKontrak ? parseFloat(nilaiKontrak) : undefined,
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_selesai: tanggalSelesai || undefined,
        status,
        aktif,
      }
      if (isEdit && projectId) {
        await updateProject(projectId, payload)
        toast.success("Project updated")
      } else {
        await createProject(payload)
        toast.success("Project created")
      }
      router.push("/project")
    } catch {
      toast.error(isEdit ? "Failed to update project" : "Failed to create project")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/project")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Project" : "Add Project"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update project information" : "Create a new project"}</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Project Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
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
                  <FieldLabel htmlFor="client_id">Client *</FieldLabel>
                  <FieldContent>
                    <Select value={clientId} onValueChange={(v) => v && setClientId(v)} required>
                      <SelectTrigger id="client_id">
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.kode} - {c.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="unit_id">Unit *</FieldLabel>
                  <FieldContent>
                    <Select value={unitId} onValueChange={(v) => v && setUnitId(v)} required>
                      <SelectTrigger id="unit_id">
                        <SelectValue placeholder="Select unit..." />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <FieldContent>
                    <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                        <SelectItem value="ditunda">Ditunda</SelectItem>
                        <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="nilai_kontrak">Nilai Kontrak</FieldLabel>
                  <FieldContent>
                    <Input id="nilai_kontrak" type="number" step="1" value={nilaiKontrak} onChange={(e) => setNilaiKontrak(e.target.value)} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="tanggal_mulai">Tanggal Mulai</FieldLabel>
                  <FieldContent>
                    <Input id="tanggal_mulai" type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="tanggal_selesai">Tanggal Selesai</FieldLabel>
                  <FieldContent>
                    <Input id="tanggal_selesai" type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
                  </FieldContent>
                </Field>
              </div>
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/project")}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                <SaveIcon /> {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
