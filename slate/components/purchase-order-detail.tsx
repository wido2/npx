"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchPurchaseOrder,
  kirimPurchaseOrder,
  setujuiPurchaseOrder,
  terimaPurchaseOrder,
  batalkanPurchaseOrder,
  deletePurchaseOrder,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "@/lib/purchase-order-api"
import { fetchPOReceipts, type POReceipt } from "@/lib/purchase-order-receipt-api"
import { fetchPORevisions, type PORevision, type RevisionChange } from "@/lib/purchase-order-revision-api"
import {
  ArrowLeftIcon,
  LoaderIcon,
  SendIcon,
  ThumbsUpIcon,
  XIcon,
  Trash2Icon,
  FileTextIcon,
  PencilIcon,
  PackageIcon,
  HistoryIcon,
  ReceiptIcon,
  PlusIcon,
  GripVerticalIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "lucide-react"

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary", dikirim: "default", disetujui: "default",
  diterima_sebagian: "default", diterima: "default", dibatalkan: "destructive",
}

const statusClasses: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  dikirim: "bg-blue-100 text-blue-700 border-blue-200",
  disetujui: "bg-green-100 text-green-700 border-green-200",
  diterima_sebagian: "bg-amber-100 text-amber-700 border-amber-200",
  diterima: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dibatalkan: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  draft: "Pengajuan", dikirim: "Dikirim", disetujui: "Disetujui",
  diterima_sebagian: "Diterima Sebagian", diterima: "Diterima", dibatalkan: "Dibatalkan",
}

function ChangeRow({ change }: { change: RevisionChange }) {
  const iconMap = {
    header: <PencilIcon className="size-4 shrink-0 text-blue-500" />,
    item_added: <PlusCircleIcon className="size-4 shrink-0 text-green-500" />,
    item_removed: <MinusCircleIcon className="size-4 shrink-0 text-red-500" />,
    item_modified: <PencilIcon className="size-4 shrink-0 text-amber-500" />,
  }

  return (
    <div className="flex items-start gap-2">
      {iconMap[change.type]}
      <div className="flex-1 leading-5">
        <span className="font-medium">{change.label}</span>
        {change.type === "item_added" && change.newValue && (
          <span className="text-green-600"> → {change.newValue}</span>
        )}
        {change.type === "item_removed" && change.oldValue && (
          <span className="text-red-600"> {change.oldValue}</span>
        )}
        {change.type === "header" && (
          <>
            <span className="text-muted-foreground">: </span>
            {change.oldValue
              ? <><span className="text-red-600 line-through">{change.oldValue}</span><span className="text-muted-foreground"> → </span></>
              : <span className="text-green-600 font-medium">(set) </span>}
            <span className="text-green-600">{change.newValue}</span>
          </>
        )}
        {change.type === "item_modified" && (
          <>
            <span className="text-muted-foreground">: </span>
            <span className="text-red-600 line-through">{change.oldValue}</span>
            <span className="text-muted-foreground"> → </span>
            <span className="text-green-600">{change.newValue}</span>
          </>
        )}
      </div>
    </div>
  )
}

interface Props {
  poId: string
}

export function PurchaseOrderDetail({ poId }: Props) {
  const router = useRouter()
  const { can } = useAuth()
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [receipts, setReceipts] = useState<POReceipt[]>([])
  const [revisions, setRevisions] = useState<PORevision[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kirimDialogOpen, setKirimDialogOpen] = useState(false)
  const [setujuiDialogOpen, setSetujuiDialogOpen] = useState(false)
  const [batalkanDialogOpen, setBatalkanDialogOpen] = useState(false)
  const [terimaSheetOpen, setTerimaSheetOpen] = useState(false)
  const [terimaItems, setTerimaItems] = useState<Record<string, number>>({})
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [poData, receiptsData, revisionsData] = await Promise.all([
        fetchPurchaseOrder(poId),
        fetchPOReceipts(poId),
        fetchPORevisions(poId),
      ])
      setPo(poData)
      setReceipts(receiptsData)
      setRevisions(revisionsData)
    } catch {
      toast.error("Failed to load PO")
      router.push("/purchase-order")
    } finally {
      setLoading(false)
    }
  }, [poId, router])

  useEffect(() => { loadData() }, [loadData])

  async function handleKirim() {
    setActionLoading(true)
    try {
      await kirimPurchaseOrder(poId)
      toast.success("PO submitted")
      setKirimDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to submit PO")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSetujui() {
    setActionLoading(true)
    try {
      await setujuiPurchaseOrder(poId)
      toast.success("PO approved")
      setSetujuiDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to approve PO")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBatalkan() {
    setActionLoading(true)
    try {
      await batalkanPurchaseOrder(poId)
      toast.success("PO cancelled")
      setBatalkanDialogOpen(false)
      loadData()
    } catch {
      toast.error("Failed to cancel PO")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await deletePurchaseOrder(poId)
      toast.success("PO deleted")
      router.push("/purchase-order")
    } catch {
      toast.error("Failed to delete PO")
    } finally {
      setActionLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  async function handleTerima() {
    setActionLoading(true)
    try {
      const items = Object.entries(terimaItems)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({
          purchase_order_item_id: id,
          jumlah_diterima: qty,
        }))
      if (items.length === 0) {
        toast.error("Please enter at least one item quantity")
        setActionLoading(false)
        return
      }
      await terimaPurchaseOrder(poId, items)
      toast.success("Receipt recorded")
      setTerimaSheetOpen(false)
      loadData()
    } catch {
      toast.error("Failed to record receipt")
    } finally {
      setActionLoading(false)
    }
  }

  const currency = (val: number) =>
    `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(new Date(d))

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }

  if (!po) return null

  const canKirim = po.status === "draft" && can("po.submit")
  const canSetujui = po.status === "dikirim" && can("po.approve")
  const canTerima = (po.status === "disetujui" || po.status === "diterima_sebagian") && can("po.receive")
  const canBatalkan = !["diterima", "dibatalkan"].includes(po.status) && can("po.cancel")
  const canEdit = po.status === "draft" && can("po.edit")
  const canDelete = po.status === "draft" && can("po.delete")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/purchase-order")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{po.kode || "Pengajuan"}</h1>
              <Badge variant={statusColors[po.status]} className={statusClasses[po.status]}>{statusLabels[po.status]}</Badge>
            </div>
            <p className="text-muted-foreground">{formatDate(po.tanggal_po)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canKirim && (
            <Button onClick={() => setKirimDialogOpen(true)}>
              <SendIcon /> Kirim
            </Button>
          )}
          {canSetujui && (
            <Button onClick={() => setSetujuiDialogOpen(true)}>
              <ThumbsUpIcon /> Setujui
            </Button>
          )}
          {canTerima && (
            <Button onClick={() => {
              setTerimaItems({})
              po.items?.forEach((item) => {
                setTerimaItems((prev) => ({ ...prev, [item.id]: 0 }))
              })
              setTerimaSheetOpen(true)
            }}>
              <PackageIcon /> Terima
            </Button>
          )}
          {canBatalkan && (
            <Button variant="outline" onClick={() => setBatalkanDialogOpen(true)}>
              <XIcon /> Batalkan
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => router.push(`/purchase-order/${poId}/edit`)}>
              <PencilIcon /> Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="outline" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon /> Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/purchase-order/${poId}/pdf`)}>
            <FileTextIcon /> PDF
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>PO Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span>{po.vendor?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span>{po.client?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Project</span><span>{po.project?.nama || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tanggal PO</span><span>{formatDate(po.tanggal_po)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expected Delivery</span><span>{po.tanggal_kirim_expected || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Syarat Pembayaran</span><span>{po.syarat_pembayaran || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dibuat Oleh</span><span>{po.dibuat_oleh_user?.name || po.dibuat_oleh}</span></div>
            {po.disetujui_oleh && <div className="flex justify-between"><span className="text-muted-foreground">Disetujui Oleh</span><span>{po.disetujui_oleh_user?.name || po.disetujui_oleh}</span></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currency(po.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Diskon</span><span>{po.diskon > 0 ? `${po.diskon}%` : "-"}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{currency(po.total)}</span></div>
          </CardContent>
          {po.alamat_kirim && (
            <CardContent className="border-t pt-4">
              <div className="text-sm"><span className="text-muted-foreground">Alamat Kirim:</span><p className="mt-1">{po.alamat_kirim}</p></div>
            </CardContent>
          )}
          {po.catatan && (
            <CardContent className="border-t pt-4">
              <div className="text-sm"><span className="text-muted-foreground">Catatan:</span><p className="mt-1">{po.catatan}</p></div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Items + Tabs */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items"><PackageIcon /> Items</TabsTrigger>
          <TabsTrigger value="receipts"><ReceiptIcon /> Receipts ({receipts.length})</TabsTrigger>
          <TabsTrigger value="revisions"><HistoryIcon /> Revisions ({revisions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader><CardTitle>PO Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Diskon</TableHead>
                    <TableHead className="text-right">Pajak</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!po.items || po.items.length === 0) ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No items</TableCell></TableRow>
                  ) : (
                    po.items.map((item) => {
                      if (item.display_type === "section") {
                        return (
                          <TableRow key={item.id} className="bg-muted/50">
                            <TableCell colSpan={6} className="font-bold text-sm">
                              <GripVerticalIcon className="inline size-4 mr-1 text-muted-foreground" />
                              {item.keterangan}
                            </TableCell>
                          </TableRow>
                        )
                      }
                      if (item.display_type === "note") {
                        return (
                          <TableRow key={item.id}>
                            <TableCell colSpan={6} className="text-sm italic text-muted-foreground">
                              {item.keterangan}
                            </TableCell>
                          </TableRow>
                        )
                      }
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.barang?.nama || "-"}</div>
                            <div className="text-xs text-muted-foreground">{item.barang?.kode}</div>
                          </TableCell>
                          <TableCell className="text-right">{item.jumlah}</TableCell>
                          <TableCell className="text-right">{currency(item.harga_satuan)}</TableCell>
                          <TableCell className="text-right">{item.diskon > 0 ? `${item.diskon}%` : "-"}</TableCell>
                          <TableCell className="text-right">{item.nilai_pajak > 0 ? currency(item.nilai_pajak) : "-"}</TableCell>
                          <TableCell className="text-right font-medium">{currency(item.total_setelah_pajak)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Receipt History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No receipts</TableCell></TableRow>
                  ) : (
                    receipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.nomor}</TableCell>
                        <TableCell>{r.tanggal_terima}</TableCell>
                        <TableCell>{r.catatan || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revisions" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Revision History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revisions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No revisions</TableCell></TableRow>
                  ) : (
                    revisions.map((r) => (
                      <Fragment key={r.id}>
                        <TableRow className="cursor-pointer" onClick={() => setExpandedRevision(expandedRevision === r.id ? null : r.id)}>
                          <TableCell>
                            {expandedRevision === r.id ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                          </TableCell>
                          <TableCell className="font-medium">v{r.version}</TableCell>
                          <TableCell>
                            {r.changes && r.changes.length > 0
                              ? <span className="text-xs text-muted-foreground">{r.changes.length} change(s)</span>
                              : (r.changed_fields?.join(", ") || "-")}
                          </TableCell>
                          <TableCell>{r.changed_by_user?.name || r.changed_by || "-"}</TableCell>
                          <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                        {expandedRevision === r.id && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/30 p-0">
                              <div className="space-y-1 px-8 py-3 text-sm">
                                {r.changes && r.changes.length > 0 ? (
                                  r.changes.map((c, i) => (
                                    <ChangeRow key={i} change={c} />
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">—</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  )}
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
            <AlertDialogTitle>Submit Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>No further edits allowed after submission.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handleKirim}>
              {actionLoading ? "Submitting..." : "Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={setujuiDialogOpen} onOpenChange={setSetujuiDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><ThumbsUpIcon className="text-primary" /></AlertDialogMedia>
            <AlertDialogTitle>Approve Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>This will save a revision snapshot.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handleSetujui}>
              {actionLoading ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={batalkanDialogOpen} onOpenChange={setBatalkanDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><XIcon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>No</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading} onClick={handleBatalkan}>
              {actionLoading ? "Cancelling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={actionLoading} onClick={handleDelete}>
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={terimaSheetOpen} onOpenChange={setTerimaSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Receive Items</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 overflow-y-auto p-6 pt-0">
            {po.items?.map((item) => {
              const sisa = item.jumlah - ((item as PurchaseOrderItem & { jumlah_diterima?: number }).jumlah_diterima || 0)
              return (
                <div key={item.id} className="space-y-2 rounded-lg border p-3">
                  <div className="text-sm font-medium">{item.barang?.nama || "-"}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Dipesan: {item.jumlah}</span>
                    <span>Sisa: {sisa}</span>
                  </div>
                  <Field>
                    <FieldLabel>Jumlah Diterima</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        min="0"
                        max={sisa}
                        value={terimaItems[item.id] ?? 0}
                        onChange={(e) => setTerimaItems((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                      />
                    </FieldContent>
                  </Field>
                </div>
              )
            })}
            <Button onClick={handleTerima} disabled={actionLoading} className="mt-4">
              <PackageIcon />
              {actionLoading ? "Recording..." : "Record Receipt"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
