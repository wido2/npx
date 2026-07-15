"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchClient, type Client } from "@/lib/client-api"
import { ArrowLeftIcon, LoaderIcon, PencilIcon } from "lucide-react"

interface Props {
  clientId: string
}

export function ClientDetail({ clientId }: Props) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchClient(clientId)
      setClient(data)
    } catch {
      toast.error("Failed to load client")
      router.push("/client")
    } finally {
      setLoading(false)
    }
  }, [clientId, router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (!client) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/client")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.nama}</h1>
            <p className="text-muted-foreground">{client.kode}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/client/${clientId}/edit`)}>
          <PencilIcon /> Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Client Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Kode</span><span>{client.kode}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span>{client.nama}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">NPWP</span><span>{client.npwp || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipe</span><Badge variant="outline" className="capitalize">{client.tipe}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{client.email || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Telepon</span><span>{client.telepon || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Website</span><span>{client.website || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Aktif</span><Badge variant={client.aktif ? "default" : "secondary"}>{client.aktif ? "Ya" : "Tidak"}</Badge></div>
            {client.keterangan && (
              <div className="flex justify-between"><span className="text-muted-foreground">Keterangan</span><span>{client.keterangan}</span></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
