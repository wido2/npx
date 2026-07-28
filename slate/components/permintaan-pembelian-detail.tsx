"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPP, deletePP, kirimPP, verifikasiPP, tolakPP, batalkanPP, type PermintaanPembelian, type PermintaanPembelianItem } from "@/lib/permintaan-pembelian-api"
import {
  ArrowLeftIcon,
  LoaderIcon,
  SendIcon,
  FileCheckIcon,
  XIcon,
  Trash2Icon,
  FileTextIcon,
  PencilIcon,
  PackageIcon,
  HistoryIcon,
  DownloadIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ShoppingCartIcon,
  CheckIcon,
} from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  menunggu: "default",
  diverifikasi: "default",
  ditolak: "destructive",
  dibatalkan: "destructive",
}

const statusClasses: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  menunggu: "bg-blue-100 text-blue-700 border-blue-200",
  diverifikasi: "bg-green-100 text-green-700 border-green-200",
  ditolak: "bg-red-100 text-red-700 border-red-200",
  dibatalkan: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  menunggu: "Menunggu Persetujuan",
  diverifikasi: "Diverifikasi",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
}

function ChangeRow({ change }: { change: { type: string; label: string; oldValue?: string; newValue?: string } }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-medium">{change.label}</span>
      {change.oldValue && change.newValue && (
        <>
          <span className="text-red-600 line-through">{change.oldValue}</span>
          <span className="text-muted-foreground"> → </span>
          <span className="text-green-600">{change.newValue}</span>
        </>
      )}
    </div>
  )
}

interface Props {
  ppId: string
}

export function PermintaanPembelianDetail({ ppId }: Props) {
  const router = useRouter()
  const { can } = useAuth()
  const [pp, setPP] = useState<PermintaanPembelian | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kirimDialogOpen, setKirimDialogOpen] = useState(false)
  const [verifikasiDialogOpen, setVerifikasiDialogOpen] = useState(false)
  const [tolakDialogOpen, setTolakDialogOpen] = useState(false)
  const [batalkanDialogOpen, setBatalkanDialogOpen] = useState(false)
  const [verificationItems, setVerificationItems] = useState<{ id: string; jumlah_disetujui: number; catatan_logistik: string }[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const ppData = await fetchPP(ppId)
      setPP(ppData)
    } catch {
      toast.error("Failed to load PP")
      router.push("/permintaan-pembelian")
    } finally {
      setLoading(false)
    }
  }, [ppId, router])

  useEffect(() => { loadData() }, [loadData])

  async function handleKirim() {
    setActionLoading(true)
    try {
      await kirimPP(ppId)
      toast.success("PP submitted")
      setKirimDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to submit PP")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleVerifikasi() {
    setActionLoading(true)
    try {
      await verifikasiPP(ppId, verificationItems)
      toast.success("PP verified")
      setVerifikasiDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to verify PP")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTolak() {
    setActionLoading(true)
    try {
      await tolakPP(ppId)
      toast.success("PP rejected")
      setTolakDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to reject PP")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBatalkan() {
    setActionLoading(true)
    try {
      await batalkanPP(ppId)
      toast.success("PP cancelled")
      setBatalkanDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to cancel PP")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await deletePP(ppId)
      toast.success("PP deleted")
      router.push("/permintaan-pembelian")
    } catch {
      toast.error("Failed to delete PP")
    } finally {
      setActionLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const currency = (val: number) =>
    `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(new Date(d))

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (!pp) return null

  const canKirim = pp.status === "draft" && can("pp.submit")
  const canVerifikasi = pp.status === "menunggu" && can("pp.verify")
  const canTolak = pp.status === "menunggu" && can("pp.verify")
  const canBatalkan = pp.status !== "dibatalkan" && can("pp.cancel")
  const canDelete = pp.status === "draft" && can("pp.delete")
  const canEdit = pp.status === "draft" && can("pp.edit")
  const hasItemsWithPO = (pp.items || []).some((item) => item.purchase_order_item?.purchase_order)
  const hasItemsWithoutPO = (pp.items || []).some((item) => !item.purchase_order_item?.purchase_order)
  const canBuatPO = pp.status === "diverifikasi" && can("pp.create_po") && hasItemsWithoutPO
  const canLihatPO = pp.status === "diverifikasi" && hasItemsWithPO

  const reviewItems = (pp.items || []).filter((item) => item.jumlah_disetujui !== null)
  const canReviewAll = reviewItems.length === (pp.items || []).filter((item) => item.jumlah_disetujui === null).length === false && reviewItems.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/permintaan-pembelian")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pp.kode || "Draft"}</h1>
              <Badge variant={statusColors[pp.status]} className={statusClasses[pp.status]}>{statusLabels[pp.status]}</Badge>
            </div>
            <p className="text-muted-foreground">{formatDate(pp.tanggal_diminta)} • PP #{pp.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canKirim && (
            <Button onClick={() => setKirimDialogOpen(true)}><SendIcon /> Kirim</Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => router.push(`/permintaan-pembelian/${ppId}/edit`)}>
              <PencilIcon /> Edit
            </Button>
          )}
          {canVerifikasi && (
            <Button onClick={() => setVerifikasiDialogOpen(true)}>
              <FileCheckIcon /> Verify
            </Button>
          )}
          {canTolak && (
            <Button variant="destructive" onClick={() => setTolakDialogOpen(true)}>
              <XIcon /> Tolak
            </Button>
          )}
          {canBatalkan && (
            <Button variant="outline" onClick={() => setBatalkanDialogOpen(true)}>
              <XIcon /> Batalkan
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon /> Delete
            </Button>
          )}
          {canLihatPO && (
            <Button onClick={() => router.push('/purchase-order/' + (pp.items?.find((item) => item.purchase_order_item?.purchase_order)?.purchase_order_item?.purchase_order?.id || ''))}>
              <ShoppingCartIcon /> Lihat PO
            </Button>
          )}
          {canBuatPO && (
            <Button onClick={() => router.push('/purchase-order/create?pp_id=' + ppId)}>
              <ShoppingCartIcon /> Buat PO
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>PP Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Dibuat Oleh</span><span>{pp.dibuat_oleh_user?.name || pp.dibuat_oleh}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{pp.client?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Project</span><span>{pp.project?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Diminta</span><span>{formatDate(pp.tanggal_diminta)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal Diperlukan</span><span>{pp.tanggal_diperlukan ? formatDate(pp.tanggal_diperlukan) : "-"}</span></div>
            {pp.diverifikasi_oleh && <div className="flex justify-between"><span className="text-muted-foreground">Diverifikasi Oleh</span><span>{pp.diverifikasi_oleh_user?.name || pp.diverifikasi_oleh}</span></div>}
            {pp.catatan && <div className="flex justify-between"><span className="text-muted-foreground">Catatan</span><span>{pp.catatan}</span></div>}
            {pp.alasan_ditolak && <div className="flex justify-between"><span className="text-muted-foreground">Alasan Ditolak</span><span className="text-destructive">{pp.alasan_ditolak}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Items Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Items</span><span>{(pp.items || []).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Disetujui</span><span>{reviewItems.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span>{(pp.items || []).filter((i) => i.jumlah_disetujui === null).length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ditolak (pakai stok)</span><span>{(pp.items || []).filter((i) => i.jumlah_disetujui === 0).length}</span></div>
            </div>
          </CardContent>
        </Card>
        {pp.purchase_orders && pp.purchase_orders.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Purchase Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pp.purchase_orders.map((po) => {
                  const poStatusColors: Record<string, string> = {
                    draft: "secondary", dikirim: "default", disetujui: "default",
                    diterima_sebagian: "default", diterima: "default", dibatalkan: "destructive",
                  }
                  const poStatusClasses: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-700 border-gray-200",
                    dikirim: "bg-blue-100 text-blue-700 border-blue-200",
                    disetujui: "bg-green-100 text-green-700 border-green-200",
                    diterima_sebagian: "bg-amber-100 text-amber-700 border-amber-200",
                    diterima: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    dibatalkan: "bg-red-100 text-red-700 border-red-200",
                  }
                  const poStatusLabels: Record<string, string> = {
                    draft: "Pengajuan", dikirim: "Dikirim", disetujui: "Disetujui",
                    diterima_sebagian: "Diterima Sebagian", diterima: "Diterima", dibatalkan: "Dibatalkan",
                  }
                  return (
                    <div key={po.id} className="flex items-center justify-between text-sm">
                      <a href={`/purchase-order/${po.id}`} className="font-medium underline underline-offset-2 hover:text-primary">
                        {po.kode || "Draft"}
                      </a>
                      <Badge variant={(poStatusColors[po.status] || "outline") as "default" | "secondary" | "outline" | "destructive"} className={poStatusClasses[po.status]}>
                        {poStatusLabels[po.status] || po.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items"><PackageIcon /> Items</TabsTrigger>
          <TabsTrigger value="history"><HistoryIcon /> Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Diminta</TableHead>
                    <TableHead className="text-right">Disetujui</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!pp.items || pp.items.length === 0) ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No items</TableCell></TableRow>
                  ) : (
                    pp.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.barang?.nama || "-"}</div>
                          <div className="text-xs text-muted-foreground">{item.barang?.kode}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.jumlah_diminta}</TableCell>
                        <TableCell className="text-right">
                          {item.jumlah_disetujui === null ? <span className="text-muted-foreground">Pending</span> : item.jumlah_disetujui === 0 ? <span className="text-muted-foreground">Pakai stok</span> : <span className="font-medium">{item.jumlah_disetujui}</span>}
                        </TableCell>
                        <TableCell>{item.catatan_logistik || item.catatan || "-"}</TableCell>
                        <TableCell>
                          {item.jumlah_disetujui === null ? (
                            <Badge variant="secondary">Pending</Badge>
                          ) : item.jumlah_disetujui === 0 ? (
                            <Badge variant="outline">Pakai Stok</Badge>
                          ) : item.jumlah_disetujui! < item.jumlah_diminta ? (
                            <Badge variant="default">Sebagian</Badge>
                          ) : (
                            <Badge variant="outline">Disetujui</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const po = item.purchase_order_item?.purchase_order
                            if (!po) return <span className="text-muted-foreground text-sm">-</span>
                            return (
                              <span
                                className="font-medium underline underline-offset-2 hover:text-primary text-sm whitespace-nowrap cursor-pointer"
                                onClick={() => {
                                  if (can("po.view_all")) {
                                    router.push(`/purchase-order/${po.id}`)
                                  } else {
                                    toast.error("Aduh, kamu belum punya izin untuk melihat detail PO. Minta akses ke admin dulu ya!")
                                  }
                                }}
                              >
                                {po.kode || "Draft"}
                              </span>
                            )
                          })()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Revision History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No revisions yet</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AlertDialog open={kirimDialogOpen} onOpenChange={setKirimDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><SendIcon className="text-primary" /></AlertDialogMedia>
            <AlertDialogTitle>Submit PP?</AlertDialogTitle>
            <AlertDialogDescription>This will send PP to logistics for review.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handleKirim}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer showSwipeHandle open={verifikasiDialogOpen} onOpenChange={setVerifikasiDialogOpen}>
        <DrawerContent className="max-h-[85dvh]">
          <DrawerHeader>
            <DrawerTitle>Verify PP Items</DrawerTitle>
            <DrawerDescription>Set quantity approved for each item. Set 0 to use existing stock.</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Diminta</TableHead>
                  <TableHead className="text-right">Disetujui</TableHead>
                  <TableHead>Catatan Logistik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(pp.items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.barang?.nama || "-"}</div>
                      <div className="text-xs text-muted-foreground">{item.barang?.kode}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.jumlah_diminta}</TableCell>
                    <TableCell className="text-right">
                      <Input type="number" min={0} value={verificationItems.find((vi) => vi.id === item.id)?.jumlah_disetujui ?? ""} onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setVerificationItems((prev) => {
                          const exists = prev.find((vi) => vi.id === item.id)
                          if (exists) {
                            return prev.map((vi) => vi.id === item.id ? { ...vi, jumlah_disetujui: val } : vi)
                          }
                          return [...prev, { id: item.id, jumlah_disetujui: val, catatan_logistik: "" }]
                        })
                      }} className="w-24 text-right" />
                    </TableCell>
                    <TableCell>
                      <Input value={verificationItems.find((vi) => vi.id === item.id)?.catatan_logistik || ""} onChange={(e) => {
                        setVerificationItems((prev) => {
                          const exists = prev.find((vi) => vi.id === item.id)
                          if (exists) {
                            return prev.map((vi) => vi.id === item.id ? { ...vi, catatan_logistik: e.target.value } : vi)
                          }
                          return [...prev, { id: item.id, jumlah_disetujui: 0, catatan_logistik: e.target.value }]
                        })
                      }} placeholder="Catatan..." className="h-8" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setVerifikasiDialogOpen(false)}>Cancel</Button>
            <Button disabled={actionLoading} onClick={handleVerifikasi}>Verify</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={tolakDialogOpen} onOpenChange={setTolakDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><XIcon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Reject PP?</AlertDialogTitle>
            <AlertDialogDescription>This PP will be marked as rejected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading} onClick={handleTolak}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batalkanDialogOpen} onOpenChange={setBatalkanDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><XIcon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Cancel PP?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading || !pp} onClick={handleBatalkan}>
              {actionLoading ? "Cancelling..." : "Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Delete PP?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading || !pp} onClick={handleDelete}>
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  )
}