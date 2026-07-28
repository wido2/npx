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
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  fetchPembelianLangsungs,
  deletePembelianLangsung,
  type PembelianLangsung,
} from "@/lib/pembelian-langsung-api"

export function PembelianLangsungTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<PembelianLangsung[]>([])
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
  const [dari, setDari] = useState<Date | undefined>(undefined)
  const [sampai, setSampai] = useState<Date | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<PembelianLangsung | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = sorting[0]?.id || "created_at"
      const sortDir = sorting[0]?.desc ? "desc" : (sorting[0] ? "asc" : "desc")
      const res = await fetchPembelianLangsungs({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search,
        sort_field: sortField,
        sort_dir: sortDir,
        date_from: dari ? format(dari, "yyyy-MM-dd") : undefined,
        date_to: sampai ? format(sampai, "yyyy-MM-dd") : undefined,
      })
      setData(res.data)
      setTotal(res.total)
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, search, sorting, dari, sampai])

  useEffect(() => { loadData() }, [loadData])

  async function handleDelete(item: PembelianLangsung) {
    setDeleting(true)
    try {
      await deletePembelianLangsung(item.id)
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

  const columns: ColumnDef<PembelianLangsung>[] = useMemo(() => [
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
      header: "Kode PL",
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => row.original.vendor?.nama || "-",
    },
    {
      accessorKey: "karyawan",
      header: "Dibeli Oleh",
      cell: ({ row }) => row.original.karyawan?.nama || "-",
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const d = new Date(row.original.tanggal)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(d)
      },
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
              <DropdownMenuItem onClick={() => router.push(`/pembelian-langsung/${row.original.id}`)}>
                <ExternalLinkIcon /> Detail
              </DropdownMenuItem>
              {can("pl.edit") && (
                <DropdownMenuItem onClick={() => router.push(`/pembelian-langsung/${row.original.id}/edit`)}>
                  <PencilIcon /> Edit
                </DropdownMenuItem>
              )}
              {can("pl.delete") && (
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
  ], [router, can])

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
            placeholder="Search kode or vendor..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }}
            className="h-8 w-full max-w-sm pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" className={cn("h-8 gap-1", dari && "border-blue-500")} />}>
              <CalendarIcon className="size-3.5" />
              {dari ? format(dari, "dd/MM/yyyy") : "Dari"}
              {dari && <XIcon className="size-3" onClick={(e) => { e.stopPropagation(); setDari(undefined); setPagination((p) => ({ ...p, pageIndex: 0 })) }} />}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dari} onSelect={(d) => { setDari(d); setPagination((p) => ({ ...p, pageIndex: 0 })) }} />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">—</span>
          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" className={cn("h-8 gap-1", sampai && "border-blue-500")} />}>
              <CalendarIcon className="size-3.5" />
              {sampai ? format(sampai, "dd/MM/yyyy") : "Sampai"}
              {sampai && <XIcon className="size-3" onClick={(e) => { e.stopPropagation(); setSampai(undefined); setPagination((p) => ({ ...p, pageIndex: 0 })) }} />}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={sampai} onSelect={(d) => { setSampai(d); setPagination((p) => ({ ...p, pageIndex: 0 })) }} />
            </PopoverContent>
          </Popover>
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
          {can("pl.create") && (
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/pembelian-langsung/create")}>
              <PlusIcon /> <span className="hidden lg:inline">New PL</span>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="cursor-pointer" onClick={() => router.push(`/pembelian-langsung/${row.original.id}`)}>
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
            <AlertDialogTitle>Delete PL?</AlertDialogTitle>
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
    </div>
  )
}
