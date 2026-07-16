"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
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
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"
import {
  fetchMutasi,
  type MutasiStok,
} from "@/lib/inventory-api"
import { cn } from "@/lib/utils"

const tipeLabel: Record<string, string> = {
  masuk: "Masuk",
  keluar: "Keluar",
  opname: "Opname",
}

const tipeColor: Record<string, string> = {
  masuk: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  keluar: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
  opname: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
}

export function InventoryMutasiTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<MutasiStok[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchMutasi({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        barang_id: search || undefined,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Failed to load mutasi stok")
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, search])

  useEffect(() => { loadData() }, [loadData])

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
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tipeColor[t] || "")}>
            {tipeLabel[t] || t}
          </span>
        )
      },
    },
    {
      accessorKey: "barang",
      header: "Barang",
      cell: ({ row }) => row.original.barang?.nama || "-",
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
      accessorKey: "stok_sebelum",
      header: "Stok Sebelum",
      cell: ({ row }) => <span className="tabular-nums">{row.original.stok_sebelum}</span>,
    },
    {
      accessorKey: "stok_sesudah",
      header: "Stok Sesudah",
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
      cell: ({ row }) => row.original.dibuat_oleh?.name || row.original.created_by.slice(0, 8) || "-",
    },
    {
      accessorKey: "referensi_type",
      header: "Referensi",
      cell: ({ row }) => {
        const ref = row.original.referensi_type
        if (!ref) return "-"
        const short = ref.split("\\").pop() || ref
        return <span className="text-xs text-muted-foreground">{short}</span>
      },
    },
  ], [])

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
    return <p className="text-sm text-muted-foreground">Anda tidak memiliki izin untuk melihat inventory.</p>
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="relative flex items-center gap-2">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by barang ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }}
          className="h-8 w-full max-w-sm pl-8"
        />
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
                <TableRow key={row.id} className="cursor-pointer" onClick={() => router.push(`/inventory/barang/${row.original.barang_id}`)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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

      <div className="flex items-center justify-between px-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {total} total records
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => { table.setPageSize(Number(value)) }}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top"><SelectGroup>{[10, 20, 30, 50, 100].map((ps) => (<SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>))}</SelectGroup></SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeftIcon /></Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeftIcon /></Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRightIcon /></Button>
            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRightIcon /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
