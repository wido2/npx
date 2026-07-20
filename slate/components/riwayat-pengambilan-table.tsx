"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  SearchIcon,
  LoaderIcon,
} from "lucide-react"
import {
  fetchRiwayatPengambilan,
  type RiwayatItemPengambilan,
} from "@/lib/pengambilan-barang-api"

export function RiwayatPengambilanTable() {
  const router = useRouter()
  const [data, setData] = useState<RiwayatItemPengambilan[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = sorting[0]?.id || "created_at"
      const sortDir = sorting[0]?.desc ? "desc" : "asc"
      const res = await fetchRiwayatPengambilan({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search,
        sort_field: sortField,
        sort_dir: sortDir,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Gagal memuat riwayat pengambilan")
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting])

  useEffect(() => { loadData() }, [loadData])

  const columns: ColumnDef<RiwayatItemPengambilan>[] = useMemo(() => [
    {
      accessorKey: "pengambilan_barang.tanggal_pengambilan",
      id: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const tgl = row.original.pengambilan_barang?.tanggal_pengambilan
        if (!tgl) return "-"
        return new Date(tgl).toLocaleDateString("id-ID", { dateStyle: "medium" })
      },
    },
    {
      accessorKey: "pengambilan_barang.kode",
      id: "kode_pb",
      header: "Kode PB",
      cell: ({ row }) => {
        const pb = row.original.pengambilan_barang
        return pb ? (
          <button
            type="button"
            className="cursor-pointer underline-offset-2 hover:underline hover:text-primary font-medium"
            onClick={(e) => { e.stopPropagation(); router.push(`/pengambilan-barang/${pb.id}`) }}
          >
            {pb.kode}
          </button>
        ) : "-"
      },
    },
    {
      id: "barang",
      header: "Barang",
      cell: ({ row }) => {
        const b = row.original.barang
        return b ? `${b.kode} — ${b.nama}` : "-"
      },
    },
    {
      accessorKey: "jumlah",
      header: "Jumlah",
    },
    {
      id: "client",
      header: "Client",
      cell: ({ row }) => row.original.pengambilan_barang?.client?.nama || "-",
    },
    {
      id: "project",
      header: "Project",
      cell: ({ row }) => row.original.pengambilan_barang?.project?.nama || "-",
    },
    {
      id: "karyawan",
      header: "Karyawan",
      cell: ({ row }) => row.original.pengambilan_barang?.karyawan?.nama || "-",
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      cell: ({ row }) => row.original.keterangan || "-",
    },
    {
      id: "dibuat_oleh",
      header: "Dibuat Oleh",
      cell: ({ row }) => row.original.pengambilan_barang?.dibuat_oleh?.name || "-",
    },
  ], [router])

  const table = useReactTable({
    data, columns,
    state: { sorting, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex flex-1 items-center gap-2">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kode PB atau barang..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="h-8 w-full max-w-sm pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="h-8" />}
            >
              <Columns3Icon />
              Columns
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id === "kode_pb" ? "Kode PB" : col.id === "dibuat_oleh" ? "Dibuat Oleh" : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  <LoaderIcon className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    const pb = row.original.pengambilan_barang
                    if (pb) router.push(`/pengambilan-barang/${pb.id}`)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Belum ada riwayat pengambilan barang.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label className="text-sm font-medium">Rows per page</Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => { table.setPageSize(Number(value)) }}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50, 100].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline" className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
            ><ChevronsLeftIcon /></Button>
            <Button
              variant="outline" className="size-8" size="icon"
              onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
            ><ChevronLeftIcon /></Button>
            <Button
              variant="outline" className="size-8" size="icon"
              onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
            ><ChevronRightIcon /></Button>
            <Button
              variant="outline" className="hidden size-8 lg:flex" size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}
            ><ChevronsRightIcon /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
