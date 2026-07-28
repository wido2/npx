"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { fetchProject, type Project } from "@/lib/project-api"
import { ArrowLeftIcon, LoaderIcon, PencilIcon } from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  aktif: "default", selesai: "secondary", ditunda: "outline",   dibatalkan: "destructive",
}

const statusClasses: Record<string, string> = {
  aktif: "bg-green-100 text-green-700 border-green-200",
  selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ditunda: "bg-purple-100 text-purple-700 border-purple-200",
  dibatalkan: "bg-red-100 text-red-700 border-red-200",
}

interface Props {
  projectId: string
}

export function ProjectDetail({ projectId }: Props) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchProject(projectId)
      setProject(data)
    } catch {
      toast.error("Failed to load project")
      router.push("/project")
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/project")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.nama}</h1>
            <p className="text-muted-foreground">{project.kode}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/project/${projectId}/edit`)}>
          <PencilIcon /> Edit
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informasi Project</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Kode</span><span className="font-medium">{project.kode}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-medium">{project.nama}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium">{project.client?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusColors[project.status] || "outline"} className={cn(statusClasses[project.status], "capitalize")}>{project.status}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Detail Project</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span className="font-medium">{project.unit?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nilai Kontrak</span><span className="font-medium">{project.nilai_kontrak != null ? `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(project.nilai_kontrak))}` : "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Jumlah</span><span className="font-medium">{project.jumlah ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Mulai</span><span className="font-medium">{project.tanggal_mulai || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Selesai</span><span className="font-medium">{project.tanggal_selesai || "-"}</span></div>
            {project.deskripsi && (
              <div className="flex justify-between"><span className="text-muted-foreground">Deskripsi</span><span className="font-medium">{project.deskripsi}</span></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
