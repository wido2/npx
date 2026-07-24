"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  HistoryIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import {
  fetchPengambilanBarangs,
  deletePengambilanBarang,
  bulkDeletePengambilanBarangs,
  type PengambilanBarang,
} from "@/lib/pengambilan-barang-api"

export function PengambilanBarangTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<PengambilanBarang[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<PengambilanBarang | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = sorting[0]?.id || "created_at"
      const sortDir = sorting[0]?.desc ? "desc" : (sorting[0] ? "asc" : "desc")
      const res = await fetchPengambilanBarangs({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search,
        sort_field: sortField,
        sort_dir: sortDir,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting])

  useEffect(() => { loadData() }, [loadData])

  async function handleDelete(item: PengambilanBarang) {
    setDeleting(true)
    try {
      await deletePengambilanBarang(item.id)
      toast.success(`${item.kode} deleted`)
      loadData()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    }
  }

  async function handleBulkDelete() {
    const items = table.getSelectedRowModel().rows.map((r) => r.original)
    if (!items.length) return
    setDeleting(true)
    try {
      await bulkDeletePengambilanBarangs(items.map((i) => i.id))
      toast.success("Selected PB(s) deleted")
      setRowSelection({})
      loadData()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const columns: ColumnDef<PengambilanBarang>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        </div>
      ),
      enableSorting: false, enableHiding: false,
    },
    {
      accessorKey: "kode",
      header: "Kode PB",
    },
    {
      accessorKey: "tanggal_pengambilan",
      header: "Tanggal",
      cell: ({ row }) => {
        const d = new Date(row.original.tanggal_pengambilan)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(d)
      },
    },
    {
      accessorKey: "karyawan",
      header: "Diambil Oleh",
      cell: ({ row }) => row.original.karyawan?.nama || "-",
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => row.original.client?.nama || "-",
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => row.original.project?.nama || "-",
    },
    {
      id: "total_item",
      header: "Total Item",
      cell: ({ row }) => row.original.items_count ?? "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="flex size-8 text-muted-foreground data-open:bg-muted" size="icon" />}>
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => router.push(`/pengambilan-barang/${row.original.id}`)}>
                <ExternalLinkIcon /> Detail
              </DropdownMenuItem>
              {can("pb.delete") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => { setDeletingItem(row.original); setDeleteDialogOpen(true) }}>
                    <Trash2Icon /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [router])

  const selectedCount = Object.keys(rowSelection).length

  const table = useReactTable({
    data, columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
  })

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex flex-1 items-center gap-2">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search kode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }}
            className="h-8 w-full max-w-sm pl-8"
          />
          {can("pb.delete") && selectedCount > 0 && (
            <Button variant="destructive" size="sm" className="h-8" onClick={() => setBulkDeleteDialogOpen(true)}>
              <Trash2Icon /> Delete ({selectedCount})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8" />}>
              <Columns3Icon /> Columns <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(value) => col.toggleVisibility(!!value)}>
                  {col.id === "total_item" ? "Total Item" : col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/pengambilan-barang/riwayat")}>
            <HistoryIcon /> <span className="hidden lg:inline">Riwayat</span>
          </Button>
          {can("pb.create") && (
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/pengambilan-barang/create")}>
              <PlusIcon /> <span className="hidden lg:inline">New PB</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} onClick={header.column.getToggleSortingHandler()} className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="cursor-pointer" onClick={() => router.push(`/pengambilan-barang/${row.original.id}`)}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={(e) => (cell.column.id === "actions" || cell.column.id === "select") ? e.stopPropagation() : undefined}>
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
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => { table.setPageSize(Number(value)) }}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top"><SelectGroup>{[10, 20, 30, 40, 50].map((ps) => (<SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>))}</SelectGroup></SelectContent>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Delete PB?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting || !deletingItem} onClick={() => deletingItem && handleDelete(deletingItem)}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2Icon className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Delete {selectedCount} PB(s)?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleBulkDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
