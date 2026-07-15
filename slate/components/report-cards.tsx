"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Tooltip, Area, AreaChart, ResponsiveContainer } from "recharts"
import {
  fetchPOSummary,
  fetchPOPerBulan,
  fetchPOPerVendor,
  fetchPOPerStatus,
  fetchPOTopItems,
  type POSummary,
  type PerBulanItem,
  type PerVendorItem,
  type PerStatusItem,
  type TopItem,
} from "@/lib/report-api"
import { LoaderIcon, PackageIcon, CheckCircleIcon, ClockIcon, XCircleIcon, AlertTriangleIcon } from "lucide-react"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

const statusColors: Record<string, string> = {
  draft: "#6b7280", dikirim: "#3b82f6", disetujui: "#10b981",
  diterima_sebagian: "#f59e0b", diterima: "#22c55e", dibatalkan: "#ef4444",
}

const statusLabels: Record<string, string> = {
  draft: "Pengajuan", dikirim: "Dikirim", disetujui: "Disetujui",
  diterima_sebagian: "Diterima Sebagian", diterima: "Diterima", dibatalkan: "Dibatalkan",
}

export function ReportCards() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<POSummary | null>(null)
  const [perBulan, setPerBulan] = useState<PerBulanItem[]>([])
  const [perVendor, setPerVendor] = useState<PerVendorItem[]>([])
  const [perStatus, setPerStatus] = useState<PerStatusItem[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [topItemsByNilai, setTopItemsByNilai] = useState<TopItem[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [s, b, v, st, t, tn] = await Promise.all([
        fetchPOSummary(),
        fetchPOPerBulan(),
        fetchPOPerVendor(),
        fetchPOPerStatus(),
        fetchPOTopItems("total_dipesan"),
        fetchPOTopItems("total_nilai"),
      ])
      setSummary(s)
      setPerBulan(b)
      setPerVendor(v)
      setPerStatus(st)
      setTopItems(t)
      setTopItemsByNilai(tn)
    } catch {
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoaderIcon className="size-6 animate-spin text-muted-foreground" /></div>
  }



  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="per-bulan">Per Bulan</TabsTrigger>
        <TabsTrigger value="per-vendor">Per Vendor</TabsTrigger>
        <TabsTrigger value="per-status">Per Status</TabsTrigger>
        <TabsTrigger value="top-items">Top Items (Qty)</TabsTrigger>
        <TabsTrigger value="top-items-nilai">Top Items (Nilai)</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total PO</CardTitle>
              <PackageIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.total_po || 0}</div>
              <p className="text-xs text-muted-foreground">Total nilai: {currency(summary?.total_nilai || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircleIcon className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{summary?.diterima || 0}</div>
              <p className="text-xs text-muted-foreground">+ {summary?.diterima_sebagian || 0} sebagian</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pengajuan</CardTitle>
              <ClockIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.draft || 0}</div>
              <p className="text-xs text-muted-foreground">Menunggu dikirim</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Approval</CardTitle>
              <AlertTriangleIcon className="size-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.dikirim || 0}</div>
              <p className="text-xs text-muted-foreground">Dikirim: {summary?.dikirim || 0} | Disetujui: {summary?.disetujui || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dibatalkan</CardTitle>
              <XCircleIcon className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{summary?.dibatalkan || 0}</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="per-bulan" className="mt-6">
        <Card>
          <CardHeader><CardTitle>PO per Bulan</CardTitle></CardHeader>
          <CardContent className="p-0">
            {perBulan.length > 0 ? (
              <div className="h-80 w-full px-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perBulan} margin={{ top: 20, right: 20, bottom: 60, left: 80 }}>
                    <defs>
                      <linearGradient id="nilaiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="bulan_nama" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v: number) => currency(v)} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-lg">
                            <p className="mb-1 font-medium">{label}</p>
                            {payload.map((p, i) => (
                              <p key={i} className="text-muted-foreground">
                                Total Nilai: <span className="font-semibold text-foreground">{currency(p.value as number)}</span>
                              </p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Area type="monotone" dataKey="total_nilai" stroke="var(--primary)" strokeWidth={2} fill="url(#nilaiGradient)" name="Total Nilai" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="per-vendor" className="mt-6">
        <Card>
          <CardHeader><CardTitle>PO per Vendor</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Total PO</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perVendor.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  perVendor.map((v) => (
                    <TableRow key={v.vendor_id}>
                      <TableCell className="font-medium">{v.vendor_nama}</TableCell>
                      <TableCell className="text-right">{v.total_po}</TableCell>
                      <TableCell className="text-right">{currency(v.total_nilai)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="per-status" className="mt-6">
        <Card>
          <CardHeader><CardTitle>PO per Status</CardTitle></CardHeader>
          <CardContent>
            {perStatus.length > 0 ? (
              <div className="flex h-80 items-center justify-center">
                <PieChart width={400} height={350}>
                  <Pie
                    data={perStatus.map((s) => ({ ...s, name: statusLabels[s.status] || s.status }))}
                    cx={200}
                    cy={175}
                    innerRadius={60}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="total"
                    label
                  >
                    {perStatus.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="top-items" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Top Items (by Qty)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Total Dipesan</TableHead>
                  <TableHead className="text-right">Total Diterima</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  topItems.map((item, i) => (
                    <TableRow key={item.barang_id || i}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.total_dipesan}</TableCell>
                      <TableCell className="text-right">{item.total_diterima}</TableCell>
                      <TableCell className="text-right">{currency(item.total_nilai)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="top-items-nilai" className="mt-6">
        <Card>
          <CardHeader><CardTitle>Top Items (by Nilai)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                  <TableHead className="text-right">Total Dipesan</TableHead>
                  <TableHead className="text-right">Total Diterima</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItemsByNilai.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No data</TableCell></TableRow>
                ) : (
                  topItemsByNilai.map((item, i) => (
                    <TableRow key={item.barang_id || i}>
                      <TableCell>
                        <div className="font-medium">{item.barang_nama}</div>
                        <div className="text-xs text-muted-foreground">{item.barang_kode}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{currency(item.total_nilai)}</TableCell>
                      <TableCell className="text-right">{item.total_dipesan}</TableCell>
                      <TableCell className="text-right">{item.total_diterima}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
