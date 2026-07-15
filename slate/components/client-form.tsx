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
import { createClient, updateClient, fetchClient } from "@/lib/client-api"
import { ArrowLeftIcon, LoaderIcon, SaveIcon } from "lucide-react"

interface Props {
  clientId?: string
}

export function ClientForm({ clientId }: Props) {
  const router = useRouter()
  const isEdit = !!clientId
  const [loading, setLoading] = useState(isEdit)
  const [kode, setKode] = useState("")
  const [nama, setNama] = useState("")
  const [npwp, setNpwp] = useState("")
  const [tipe, setTipe] = useState("perusahaan")
  const [email, setEmail] = useState("")
  const [telepon, setTelepon] = useState("")
  const [website, setWebsite] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const client = await fetchClient(clientId)
      setKode(client.kode)
      setNama(client.nama)
      setNpwp(client.npwp || "")
      setTipe(client.tipe)
      setEmail(client.email || "")
      setTelepon(client.telepon || "")
      setWebsite(client.website || "")
      setKeterangan(client.keterangan || "")
      setAktif(client.aktif)
    } catch {
      toast.error("Failed to load client")
      router.push("/client")
    } finally {
      setLoading(false)
    }
  }, [clientId, router])

  useEffect(() => {
    if (isEdit) loadData()
  }, [isEdit, loadData])

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
        tipe: tipe as "perusahaan" | "perorangan",
        email: email.trim() || undefined,
        telepon: telepon.trim() || undefined,
        website: website.trim() || undefined,
        keterangan: keterangan.trim() || undefined,
        aktif,
      }
      if (isEdit && clientId) {
        await updateClient(clientId, payload)
        toast.success("Client updated")
      } else {
        await createClient(payload)
        toast.success("Client created")
      }
      router.push("/client")
    } catch {
      toast.error(isEdit ? "Failed to update client" : "Failed to create client")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/client")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Client" : "Add Client"}</h1>
          <p className="text-muted-foreground">{isEdit ? "Update client information" : "Create a new client"}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
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
                        <SelectItem value="perusahaan">Perusahaan</SelectItem>
                        <SelectItem value="perorangan">Perorangan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="telepon">Telepon</FieldLabel>
                  <FieldContent>
                    <Input id="telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="website">Website</FieldLabel>
                  <FieldContent>
                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </FieldContent>
                </Field>
              </div>
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/client")}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                <SaveIcon />
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
