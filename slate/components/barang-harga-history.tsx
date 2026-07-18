"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { fetchBarang, fetchBarangHargaHistory, type Barang, type RiwayatHarga } from "@/lib/barang-api"

import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  Columns3Icon,
} from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { cn, formatCurrency, formatCurrencyDiff } from "@/lib/utils"

const sumberLabel: Record<string, string> = {
  "App\\Models\\Barang": "Manual",
  "App\\Models\\PurchaseOrderItem": "PO",
  "App\\Models\\HargaUpdate": "HU",
}

function sumberSingkat(tipe: string | null): string {
  if (!tipe) return "-"
  return sumberLabel[tipe] || tipe.split("\\").pop() || tipe
}

export function BarangHargaHistory({ barangId, compact }: { barangId: string; compact?: boolean }) {
  const router = useRouter()

  const [barang, setBarang] = useState<Barang | null>(null)
  const [data, setData] = useState<RiwayatHarga[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [columnVisibility, setColumnVisibility] = useState({})
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

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchBarangHargaHistory(barangId, {
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Gagal memuat riwayat harga")
    } finally {
      setLoading(false)
    }
  }, [barangId, pagination.pageIndex, pagination.pageSize])

  useEffect(() => { loadBarang() }, [loadBarang])
  useEffect(() => { loadHistory() }, [loadHistory])

  const columns: ColumnDef<RiwayatHarga>[] = useMemo(() => [
    {
      id: "vendor",
      header: "Vendor",
      cell: ({ row }) => row.original.vendor?.nama || "-",
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => {
        const d = new Date(row.original.created_at)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(d)
      },
    },
    {
      id: "harga_lama",
      header: "Harga Lama",
      cell: ({ row }) => (
        <span className="tabular-nums text-red-600">
          {formatCurrency(row.original.harga_beli_lama)}
        </span>
      ),
    },
    {
      id: "harga_baru",
      header: "Harga Baru",
      cell: ({ row }) => (
        <span className="tabular-nums text-emerald-600 font-medium">
          {formatCurrency(row.original.harga_beli_baru)}
        </span>
      ),
    },
    {
      id: "selisih",
      header: "Selisih",
      cell: ({ row }) => {
        const selisih = row.original.harga_beli_baru - row.original.harga_beli_lama
        const naik = selisih >= 0
        return (
          <span className={cn("tabular-nums font-medium", naik ? "text-emerald-600" : "text-red-600")}>
            {formatCurrencyDiff(selisih)}
            {naik ? <TrendingUpIcon className="ml-1 inline size-3" /> : <TrendingDownIcon className="ml-1 inline size-3" />}
          </span>
        )
      },
    },
    {
      accessorKey: "keterangan",
      header: "Sumber",
      cell: ({ row }) => {
        const ref = row.original.keterangan
        const tipe = sumberSingkat(row.original.referensi_type)
        if (tipe === "PO" && ref) {
          return <span className="text-xs">{ref}</span>
        }
        return <span className="text-xs">{tipe}</span>
      },
    },
    {
      id: "dibuat_oleh",
      header: "Dibuat Oleh",
      cell: ({ row }) => row.original.dibuat_oleh?.name || row.original.created_by?.slice(0, 8) || "-",
    },
  ], [])

  const table = useReactTable({
    data, columns,
    state: { pagination, columnVisibility },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  return (
    <div className="flex w-full flex-col gap-6">
      {!compact && (
        <>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/barang")}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{barang?.nama || "Loading..."}</h1>
              {barang && (
                <p className="text-sm text-muted-foreground">
                  {barang.kode}
                  {barang.kategori && <span> &middot; {barang.kategori.nama}</span>}
                  {barang.unit && <span> &middot; {barang.unit.singkatan}</span>}
                </p>
              )}
            </div>
          </div>

          {barang && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Harga Beli Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BanknoteIcon className="size-5 text-muted-foreground" />
                    <span className="text-2xl font-bold tabular-nums">
                      {formatCurrency(barang.harga_beli)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Perubahan</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold tabular-nums">{total}</span>
                  <span className="ml-1 text-sm text-muted-foreground">kali</span>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      <div>
        {!compact && <h2 className="text-lg font-semibold mb-4">Riwayat Harga</h2>}
        <div className="flex items-center justify-end mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer">
              <Columns3Icon className="size-4" />
              Columns
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(v)}
                >
                  {column.columnDef.header as string}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">Belum ada riwayat harga.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
