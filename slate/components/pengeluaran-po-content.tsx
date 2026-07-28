"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  fetchPOPerProject,
  fetchPOPerClient,
  type PerProjectItem,
  type PerClientItem,
} from "@/lib/report-api"
import { fetchPurchaseOrders, type PurchaseOrder } from "@/lib/purchase-order-api"
import { fetchClients } from "@/lib/client-api"
import { fetchProjects } from "@/lib/project-api"
import { LoaderIcon, FolderKanbanIcon, UsersIcon, DownloadIcon, ReceiptTextIcon } from "lucide-react"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

const poStatusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
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

function exportToExcel(data: { project: PerProjectItem[]; client: PerClientItem[] }) {
  const wb = XLSX.utils.book_new()

  // Project sheet
  const projectRows = [
    ["Pengeluaran PO per Project", "", "", "", "Semua Tahun"],
    ["No", "Kode", "Nama Project", "Total PO", "Total Nilai"],
    ...data.project.map((row, i) => [
      i + 1,
      row.project_kode,
      row.project_nama,
      row.total_po,
      row.total_nilai,
    ]),
    ["", "", "Total", data.project.reduce((s, r) => s + r.total_po, 0), data.project.reduce((s, r) => s + r.total_nilai, 0)],
  ]
  const wsProject = XLSX.utils.aoa_to_sheet(projectRows)
  wsProject["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsProject, "Per Project")

  // Client sheet
  const clientRows = [
    ["Pengeluaran PO per Client", "", "", "", "Semua Tahun"],
    ["No", "Kode", "Nama Client", "Total PO", "Total Nilai"],
    ...data.client.map((row, i) => [
      i + 1,
      row.client_kode,
      row.client_nama,
      row.total_po,
      row.total_nilai,
    ]),
    ["", "", "Total", data.client.reduce((s, r) => s + r.total_po, 0), data.client.reduce((s, r) => s + r.total_nilai, 0)],
  ]
  const wsClient = XLSX.utils.aoa_to_sheet(clientRows)
  wsClient["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsClient, "Per Client")

  XLSX.writeFile(wb, `pengeluaran-po-semua-tahun.xlsx`)
}

export function PengeluaranPoContent() {
  const { can } = useAuth()
  if (!can("reports.view")) return null

  const [loading, setLoading] = useState(true)
  const [perProject, setPerProject] = useState<PerProjectItem[]>([])
  const [perClient, setPerClient] = useState<PerClientItem[]>([])

  const [poLoading, setPOLoading] = useState(false)
  const [poData, setPOData] = useState<PurchaseOrder[]>([])
  const [clients, setClients] = useState<{ id: string; kode: string; nama: string }[]>([])
  const [projects, setProjects] = useState<{ id: string; kode: string; nama: string }[]>([])
  const [filterClientId, setFilterClientId] = useState("")
  const [filterProjectId, setFilterProjectId] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        fetchPOPerProject(),
        fetchPOPerClient(),
      ])
      setPerProject(p)
      setPerClient(c)
    } catch {
      toast.error("Gagal memuat data pengeluaran PO")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    fetchClients({ per_page: 500 })
      .then((res) => setClients(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchProjects({ per_page: 500, client_id: filterClientId || undefined })
      .then((res) => setProjects(res.data))
      .catch(() => {})
  }, [filterClientId])

  const loadPO = useCallback(async () => {
    setPOLoading(true)
    try {
      const res = await fetchPurchaseOrders({
        per_page: 500,
        client_id: filterClientId || undefined,
        project_id: filterProjectId || undefined,
      })
      setPOData(res.data)
    } catch {
      toast.error("Gagal memuat data PO")
    } finally {
      setPOLoading(false)
    }
  }, [filterClientId, filterProjectId])

  useEffect(() => { loadPO() }, [loadPO])

  const totalNilaiProject = perProject.reduce((s, r) => s + r.total_nilai, 0)
  const totalNilaiClient = perClient.reduce((s, r) => s + r.total_nilai, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Menampilkan data semua tahun</p>
        {(perProject.length > 0 || perClient.length > 0) && (
          <Button variant="outline" size="sm" onClick={() => exportToExcel({ project: perProject, client: perClient })}>
            <DownloadIcon className="size-4 mr-1" />
            Export Excel
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="project">
          <TabsList>
            <TabsTrigger value="project">Per Project</TabsTrigger>
            <TabsTrigger value="client">Per Client</TabsTrigger>
            <TabsTrigger value="detail">Detail PO</TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanbanIcon className="size-5" />
                  Pengeluaran PO per Project
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Project</TableHead>
                      <TableHead className="text-right">Total PO</TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perProject.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      perProject.map((row, i) => (
                        <TableRow key={row.project_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{row.project_kode}</TableCell>
                          <TableCell className="font-medium">{row.project_nama}</TableCell>
                          <TableCell className="text-right">{row.total_po}</TableCell>
                          <TableCell className="text-right font-semibold">{currency(row.total_nilai)}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {perProject.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{perProject.reduce((s, r) => s + r.total_po, 0)}</TableCell>
                        <TableCell className="text-right">{currency(totalNilaiProject)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="size-5" />
                  Pengeluaran PO per Client
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Client</TableHead>
                      <TableHead className="text-right">Total PO</TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perClient.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      perClient.map((row, i) => (
                        <TableRow key={row.client_id}>
                          <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{row.client_kode}</TableCell>
                          <TableCell className="font-medium">{row.client_nama}</TableCell>
                          <TableCell className="text-right">{row.total_po}</TableCell>
                          <TableCell className="text-right font-semibold">{currency(row.total_nilai)}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {perClient.length > 0 && (
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{perClient.reduce((s, r) => s + r.total_po, 0)}</TableCell>
                        <TableCell className="text-right">{currency(totalNilaiClient)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ReceiptTextIcon className="size-5" />
                  Detail Purchase Order
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Combobox
                    options={clients.map((c) => ({ value: c.id, label: `${c.kode} - ${c.nama}` }))}
                    value={filterClientId}
                    onValueChange={(v) => { setFilterClientId(v); setFilterProjectId("") }}
                    placeholder="Filter klien..."
                    searchPlaceholder="Cari klien..."
                  />
                  <Combobox
                    options={projects.map((p) => ({ value: p.id, label: `${p.kode} - ${p.nama}` }))}
                    value={filterProjectId}
                    onValueChange={(v) => setFilterProjectId(v)}
                    placeholder="Filter project..."
                    searchPlaceholder="Cari project..."
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {poLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Kode PO</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Tanggal PO</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            Tidak ada data
                          </TableCell>
                        </TableRow>
                      ) : (
                        poData.map((po, i) => (
                          <TableRow key={po.id}>
                            <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                            <TableCell className="font-mono text-sm font-medium">{po.kode || "Draft"}</TableCell>
                            <TableCell>{po.client?.nama || "-"}</TableCell>
                            <TableCell>{po.project?.nama || "-"}</TableCell>
                            <TableCell>{po.vendor?.nama || "-"}</TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {new Date(po.tanggal_po).toLocaleDateString("id-ID")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={poStatusColors[po.status] || "outline"} className={poStatusClasses[po.status]}>
                                {poStatusLabels[po.status] || po.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{currency(po.total)}</TableCell>
                          </TableRow>
                        ))
                      )}
                      {poData.length > 0 && (
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell colSpan={7}>Total</TableCell>
                          <TableCell className="text-right">{currency(poData.reduce((s, r) => s + r.total, 0))}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
