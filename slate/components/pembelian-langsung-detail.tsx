"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
  ArrowLeftIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react"
import {
  fetchPembelianLangsung,
  deletePembelianLangsung,
  type PembelianLangsung,
} from "@/lib/pembelian-langsung-api"

interface Props {
  id: string
}

export function PembelianLangsungDetail({ id }: Props) {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<PembelianLangsung | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchPembelianLangsung(id)
      .then(setData)
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletePembelianLangsung(id)
      toast.success("Pembelian langsung dihapus")
      router.push("/pembelian-langsung")
    } catch {
      toast.error("Gagal menghapus")
    } finally {
      setDeleting(false)
      setDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Data tidak ditemukan</p>
  }

  const totalHarga = (data.items || []).reduce((sum, i) => sum + i.jumlah * Number(i.harga_satuan), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/pembelian-langsung")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-lg font-semibold">{data.kode}</h1>
          <Badge variant="outline" className="text-xs">Pembelian Langsung</Badge>
        </div>
        <div className="flex items-center gap-2">
          {can("pl.edit") && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/pembelian-langsung/${id}/edit`)}>
              <EditIcon /> Edit
            </Button>
          )}
          {can("pl.delete") && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialog(true)}>
              <Trash2Icon /> Hapus
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Vendor</p>
            <p className="font-medium">{data.vendor?.nama || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tanggal</p>
            <p className="font-medium">{new Date(data.tanggal).toLocaleDateString("id-ID")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dibeli Oleh</p>
            <p className="font-medium">{data.karyawan?.nama || "-"}</p>
          </div>
          {data.catatan && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Catatan</p>
              <p className="font-medium">{data.catatan}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Dibuat oleh</p>
            <p className="font-medium">{data.dibuat_oleh_user?.name || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dibuat pada</p>
            <p className="font-medium">{new Date(data.created_at).toLocaleString("id-ID")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barang</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.items || []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs">{item.barang?.kode} - {item.barang?.nama}</TableCell>
                  <TableCell>{item.jumlah}</TableCell>
                  <TableCell>{new Intl.NumberFormat("id-ID").format(Number(item.harga_satuan))}</TableCell>
                  <TableCell>{new Intl.NumberFormat("id-ID").format(item.jumlah * Number(item.harga_satuan))}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.keterangan || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-3" />
          <div className="flex justify-end text-sm font-medium">
            Total: {new Intl.NumberFormat("id-ID").format(totalHarga)}
          </div>
        </CardContent>
      </Card>

      {(data.attachments || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachment ({data.attachments?.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {(data.attachments || []).map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-md border overflow-hidden"
                >
                  <img src={att.url} alt={att.nama_file} className="size-full object-cover" />
                  <p className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-1 pb-1 pt-4 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {att.nama_file}
                  </p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Hapus {data.kode}?</AlertDialogTitle>
            <AlertDialogDescription>Stok dan harga barang akan dikembalikan ke posisi sebelum pembelian ini.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
