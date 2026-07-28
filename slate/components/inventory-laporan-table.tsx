"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import * as XLSX from "xlsx"
import { AlertCircleIcon, PackageIcon, SearchIcon, DownloadIcon } from "lucide-react"
import {
  fetchLaporanStok,
  type BarangLaporanItem,
  type LaporanStokResponse,
} from "@/lib/inventory-api"
import { cn } from "@/lib/utils"

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

export function InventoryLaporanTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [laporan, setLaporan] = useState<LaporanStokResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchLaporanStok({ search: search || undefined })
      setLaporan(res)
    } catch {
      toast.error("Failed to load laporan stok")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { loadData() }, [loadData])

  // Reset selection when data changes
  useEffect(() => { setRowSelection({}) }, [laporan])

  const lowStockCount = useMemo(() => {
    if (!laporan) return 0
    return laporan.data.filter((b) => b.stok_minimum > 0 && b.stok <= b.stok_minimum).length
  }, [laporan])

  const columns: ColumnDef<BarangLaporanItem>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "kode",
      header: "Kode",
    },
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "kategori",
      header: "Kategori",
      cell: ({ row }) => row.original.kategori?.nama || "-",
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => row.original.unit?.nama || "-",
    },
    {
      accessorKey: "stok",
      header: "Stok",
      cell: ({ row }) => {
        const r = row.original
        const isLow = r.stok_minimum > 0 && r.stok <= r.stok_minimum
        return (
          <span className={cn("tabular-nums", isLow && "text-red-600 font-medium")}>
            {isLow && <AlertCircleIcon className="inline size-3.5 mr-0.5 -mt-0.5" />}
            {r.stok}
          </span>
        )
      },
    },
    {
      accessorKey: "stok_minimum",
      header: "Min.",
      cell: ({ row }) => <span className="tabular-nums">{row.original.stok_minimum}</span>,
    },
    {
      accessorKey: "harga_beli",
      header: "Harga Beli",
      cell: ({ row }) => row.original.harga_beli ? formatRupiah(row.original.harga_beli) : "-",
    },
    {
      id: "nilai_stok",
      header: "Nilai Stok",
      cell: ({ row }) => {
        const r = row.original
        return r.harga_beli ? formatRupiah(r.stok * r.harga_beli) : "-"
      },
    },
  ], [])

  const table = useReactTable({
    data: laporan?.data || [],
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length

  const selectedData = useMemo(() => {
    if (!laporan) return []
    return table.getSelectedRowModel().rows.map((r) => r.original)
  }, [laporan, rowSelection, table])

  function handleExportExcel() {
    const sourceData = selectedCount > 0 ? selectedData : (laporan?.data || [])
    const rows = sourceData.map((r) => [
      r.kode,
      r.nama,
      r.kategori?.nama || "-",
      r.unit?.nama || "-",
      r.stok,
      r.stok_minimum,
      r.harga_beli ?? 0,
      (r.harga_beli ?? 0) * r.stok,
    ])
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ["Kode", "Nama", "Kategori", "Unit", "Stok", "Stok Minimum", "Harga Beli", "Nilai Stok"],
      ...rows,
    ])
    ws["!cols"] = [{ wch: 18 }, { wch: 40 }, { wch: 18 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 24 }]
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Stok")
    XLSX.writeFile(wb, "laporan-stok.xlsx")
  }

  if (!can("inventory.view")) {
    return <p className="text-sm text-muted-foreground">Anda tidak memiliki izin untuk melihat inventory.</p>
  }

  const showWidget = can("widget.inventory_laporan")

  return (
    <div className="flex w-full flex-col gap-6">
      {showWidget && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold tabular-nums">{laporan?.total_item ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tabular-nums">{laporan?.total_stok ?? "—"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nilai Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tabular-nums">{laporan ? formatRupiah(laporan.nilai_stok) : "—"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stok Minimum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex items-center gap-2", lowStockCount > 0 && "text-red-600")}>
              <AlertCircleIcon className="size-5" />
              <span className="text-2xl font-bold tabular-nums">{lowStockCount}</span>
              <span className="text-sm text-muted-foreground">barang</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </>}

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search barang..."
              value={search}
              onChange={(e) => { setSearch(e.target.value) }}
              className="h-8 w-full max-w-sm pl-8"
            />
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <DownloadIcon className="size-4" />
                Export Excel
              </Button>
            </div>
          )}
        </div>

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
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => router.push(`/inventory/barang/${row.original.id}`)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} onClick={cell.column.id === "select" ? (e) => e.stopPropagation() : undefined}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No results.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
