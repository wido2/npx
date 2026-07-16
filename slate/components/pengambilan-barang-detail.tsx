"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
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
import {
  fetchPengambilanBarang,
  deletePengambilanBarang,
  type PengambilanBarang,
} from "@/lib/pengambilan-barang-api"
import { fetchMutasi, type MutasiStok } from "@/lib/inventory-api"
import {
  ArrowLeftIcon,
  FileTextIcon,
  HistoryIcon,
  LoaderIcon,
  Trash2Icon,
  PackageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tipeLabel: Record<string, string> = {
  masuk: "Masuk", keluar: "Keluar", opname: "Opname",
}

const tipeColor: Record<string, string> = {
  masuk: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  keluar: "text-red-600 bg-red-50 dark:text-red-600 dark:bg-red-950",
  opname: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
}

export function PengambilanBarangDetail({ pbId }: { pbId: string }) {
  const router = useRouter()
  const { can } = useAuth()
  const [pb, setPb] = useState<PengambilanBarang | null>(null)
  const [mutasi, setMutasi] = useState<MutasiStok[]>([])
  const [loading, setLoading] = useState(true)
  const [mutasiLoading, setMutasiLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPengambilanBarang(pbId)
      setPb(data)
    } catch {
      toast.error("Gagal memuat data PB")
      router.push("/pengambilan-barang")
    } finally {
      setLoading(false)
    }
  }, [pbId, router])

  const loadMutasi = useCallback(async () => {
    setMutasiLoading(true)
    try {
      const res = await fetchMutasi({ barang_id: undefined, per_page: 50 })
      const filtered = res.data.filter(
        (m) => m.referensi_type?.endsWith("\\PengambilanBarang") && m.referensi_id === pbId
      )
      setMutasi(filtered)
    } catch {
      // silent
    } finally {
      setMutasiLoading(false)
    }
  }, [pbId])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (pb) loadMutasi()
  }, [pb, loadMutasi])

  async function handleDelete() {
    setActionLoading(true)
    try {
      await deletePengambilanBarang(pbId)
      toast.success("PB berhasil dihapus")
      router.push("/pengambilan-barang")
    } catch {
      toast.error("Gagal menghapus PB")
    } finally {
      setActionLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(new Date(d))

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (!pb) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/pengambilan-barang")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pb.kode}</h1>
            <p className="text-muted-foreground">{formatDate(pb.tanggal_pengambilan)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/pengambilan-barang/${pb.id}/pdf`)}>
            <FileTextIcon /> PDF
          </Button>
          {can("pb.delete") && (
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon /> Hapus
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info"><PackageIcon className="size-4" /> Informasi</TabsTrigger>
          <TabsTrigger value="riwayat"><HistoryIcon className="size-4" /> Riwayat ({mutasi.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Informasi</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Kode</span><span>{pb.kode}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tanggal</span><span>{formatDate(pb.tanggal_pengambilan)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{pb.client?.nama || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Project</span><span>{pb.project?.nama || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Diambil Oleh</span><span>{pb.karyawan?.nama || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dibuat Oleh</span><span>{pb.dibuat_oleh_user?.name || pb.created_by}</span></div>
              </CardContent>
              {pb.keterangan && (
                <CardContent className="border-t pt-4">
                  <div className="text-sm"><span className="text-muted-foreground">Keterangan:</span><p className="mt-1">{pb.keterangan}</p></div>
                </CardContent>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Item</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!pb.items || pb.items.length === 0) ? (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Tidak ada item</TableCell></TableRow>
                  ) : (
                    pb.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.barang?.nama || "-"}</div>
                          <div className="text-xs text-muted-foreground">{item.barang?.kode}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.jumlah}</TableCell>
                        <TableCell>{item.keterangan || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riwayat" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Riwayat Mutasi Stok</CardTitle></CardHeader>
            <CardContent className="p-0">
              {mutasiLoading ? (
                <div className="flex items-center justify-center py-10"><LoaderIcon className="size-5 animate-spin text-muted-foreground" /></div>
              ) : mutasi.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">Belum ada riwayat mutasi</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Barang</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Stok Sebelum</TableHead>
                      <TableHead className="text-right">Stok Sesudah</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mutasi.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs">
                          {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(m.created_at))}
                        </TableCell>
                        <TableCell>{m.barang?.nama || "-"}</TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tipeColor[m.tipe] || "")}>
                            {tipeLabel[m.tipe] || m.tipe}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{m.jumlah}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.stok_sebelum}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.stok_sesudah}</TableCell>
                        <TableCell className="text-sm">{m.keterangan || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus PB?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading} onClick={handleDelete}>
              {actionLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
