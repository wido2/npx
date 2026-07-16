"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { fetchBarang, type Barang } from "@/lib/barang-api"
import { fetchMutasi, type MutasiStok } from "@/lib/inventory-api"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  PackageIcon,
} from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"

const tipeLabel: Record<string, string> = {
  masuk: "Masuk",
  keluar: "Keluar",
  opname: "Opname",
}

const tipeColor: Record<string, string> = {
  masuk: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  keluar: "text-red-600 bg-red-50 dark:text-red-600 dark:bg-red-950",
  opname: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
}

const tipeIcon: Record<string, string> = {
  masuk: "+",
  keluar: "−",
  opname: "~",
}

interface Props {
  barangId: string
}

export function InventoryBarangHistory({ barangId }: Props) {
  const router = useRouter()
  const { can } = useAuth()

  const [barang, setBarang] = useState<Barang | null>(null)
  const [data, setData] = useState<MutasiStok[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const loadBarang = useCallback(async () => {
    try {
      const b = await fetchBarang(barangId)
      setBarang(b)
    } catch {
      toast.error("Gagal memuat data barang")
    }
  }, [barangId])

  const loadMutasi = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchMutasi({
        barang_id: barangId,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Gagal memuat riwayat mutasi")
    } finally {
      setLoading(false)
    }
  }, [barangId, pagination.pageIndex, pagination.pageSize])

  useEffect(() => { loadBarang() }, [loadBarang])
  useEffect(() => { loadMutasi() }, [loadMutasi])

  const stokStatus = barang
    ? barang.stok === 0 ? "kosong"
      : barang.stok_minimum > 0 && barang.stok <= barang.stok_minimum ? "menipis"
      : "normal"
    : "normal"

  const columns: ColumnDef<MutasiStok>[] = useMemo(() => [
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => {
        const d = new Date(row.original.created_at)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(d)
      },
    },
    {
      accessorKey: "tipe",
      header: "Tipe",
      cell: ({ row }) => {
        const t = row.original.tipe
        return (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tipeColor[t] || "")}>
            {tipeIcon[t] || "?"} {tipeLabel[t] || t}
          </span>
        )
      },
    },
    {
      accessorKey: "jumlah",
      header: "Jumlah",
      cell: ({ row }) => {
        const j = row.original.jumlah
        const t = row.original.tipe
        return (
          <span className={cn(
            "font-medium tabular-nums",
            t === "masuk" && "text-emerald-600",
            t === "keluar" && "text-red-600",
          )}>
            {j > 0 ? "+" : ""}{j}
          </span>
        )
      },
    },
    {
      id: "satuan",
      header: "Satuan",
      cell: ({ row }) => row.original.barang?.unit?.singkatan || "-",
    },
    {
      accessorKey: "stok_sebelum",
      header: "Stok Awal",
      cell: ({ row }) => <span className="tabular-nums">{row.original.stok_sebelum}</span>,
    },
    {
      accessorKey: "stok_sesudah",
      header: "Stok Akhir",
      cell: ({ row }) => <span className="tabular-nums">{row.original.stok_sesudah}</span>,
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      cell: ({ row }) => row.original.keterangan || "-",
    },
    {
      accessorKey: "dibuat_oleh",
      header: "Dibuat Oleh",
      cell: ({ row }) => row.original.dibuat_oleh?.name || row.original.created_by.slice(0, 8),
    },
    {
      id: "referensi",
      header: "Dokumen",
      cell: ({ row }) => {
        const ref = row.original.referensi_type
        if (!ref) return "-"
        const short = ref.split("\\").pop() || ref
        const refId = row.original.referensi_id
        let href = ""
        if (short === "PengambilanBarang") href = `/pengambilan-barang/${refId}`
        else if (short === "PurchaseOrder") href = `/purchase-order/${refId}`

        return href ? (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => router.push(href)}>
            {short} <ExternalLinkIcon className="ml-0.5 size-3" />
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{short}</span>
        )
      },
    },
  ], [router])

  const table = useReactTable({
    data, columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  if (!can("inventory.view")) {
    return <p className="text-sm text-muted-foreground">Anda tidak memiliki izin.</p>
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/inventory")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{barang?.nama || "Loading..."}</h1>
          {barang && (
            <p className="text-sm text-muted-foreground">
              {barang.kode}
              {barang.kategori && <span> &middot; {barang.kategori.nama}</span>}
              {barang.unit && <span> &middot; {barang.unit.nama}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Stock summary cards */}
      {can("widget.barang_history") && barang && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stok Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PackageIcon className={cn("size-5", stokStatus !== "normal" && "text-red-500")} />
                <span className={cn("text-2xl font-bold tabular-nums", stokStatus !== "normal" && "text-red-600")}>
                  {barang.stok}
                </span>
                {barang.unit && <span className="text-sm text-muted-foreground">{barang.unit.singkatan}</span>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stok Minimum</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold tabular-nums">{barang.stok_minimum}</span>
              {barang.unit && <span className="text-sm text-muted-foreground">{barang.unit.singkatan}</span>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stokStatus === "kosong" ? (
                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                  <AlertCircleIcon className="size-5" />
                  Stok Kosong
                </div>
              ) : stokStatus === "menipis" ? (
                <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <AlertCircleIcon className="size-5" />
                  Stok Menipis
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  Stok Normal
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mutation history table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Riwayat Mutasi Stok</h2>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Loading...</TableCell></TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Belum ada mutasi stok.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 mt-4">
          <div className="flex-1 text-sm text-muted-foreground">{total} total records</div>
          <div className="flex items-center gap-8">
            <div className="hidden items-center gap-2 lg:flex">
              <Label className="text-sm font-medium">Rows per page</Label>
              <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => { table.setPageSize(Number(value)) }}>
                <SelectTrigger size="sm" className="w-20">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top"><SelectGroup>{[10, 20, 30, 50, 100].map((ps) => (<SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>))}</SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeftIcon /></Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeftIcon /></Button>
              <span className="text-sm font-medium px-2">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRightIcon /></Button>
              <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRightIcon /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
