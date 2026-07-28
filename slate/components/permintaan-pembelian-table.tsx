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

import { Badge } from "@/components/ui/badge"
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
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { fetchPPs, deletePP, bulkDeletePPs, type PermintaanPembelian } from "@/lib/permintaan-pembelian-api"

const currency = (val: number) =>
  `Rp${new Intl.NumberFormat("id-ID", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val))}`

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  menunggu: "default",
  diverifikasi: "default",
  ditolak: "destructive",
  dibatalkan: "destructive",
}

const statusClasses: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  menunggu: "bg-blue-100 text-blue-700 border-blue-200",
  diverifikasi: "bg-green-100 text-green-700 border-green-200",
  ditolak: "bg-red-100 text-red-700 border-red-200",
  dibatalkan: "bg-red-100 text-red-700 border-red-200",
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  menunggu: "Menunggu Persetujuan",
  diverifikasi: "Diverifikasi",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
}

function getPOList(pp: PermintaanPembelian): { id: string; kode: string | null; status: string }[] {
  if (pp.purchase_orders && pp.purchase_orders.length > 0) return pp.purchase_orders
  const seen = new Set<string>()
  const result: { id: string; kode: string | null; status: string }[] = []
  for (const item of pp.items || []) {
    const po = item.purchase_order_item?.purchase_order
    if (po && !seen.has(po.id)) {
      seen.add(po.id)
      result.push(po)
    }
  }
  return result
}

export function PermintaanPembelianTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<PermintaanPembelian[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ client: false, project: false })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<PermintaanPembelian | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = sorting[0]?.id || "created_at"
      const sortDir = sorting[0]?.desc ? "desc" : (sorting[0] ? "asc" : "desc")
      const res = await fetchPPs({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
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
  }, [pagination.pageIndex, pagination.pageSize, search, sorting, statusFilter, dateFrom, dateTo])

  useEffect(() => { loadData() }, [loadData])

  async function handleDelete(item: PermintaanPembelian) {
    setDeleting(true)
    try {
      await deletePP(item.id)
      toast.success(`${item.kode || "PP"} deleted`)
      loadData()
    } catch {
      toast.error(`Failed to delete`)
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
      await bulkDeletePPs(items.map((i) => i.id))
      toast.success("Selected PP(s) deleted")
      setRowSelection({})
      loadData()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const columns: ColumnDef<PermintaanPembelian>[] = useMemo(() => [
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
      header: "Kode PP",
      cell: ({ row }) => row.original.kode || <span className="italic text-muted-foreground">Draft</span>,
    },
    {
      accessorKey: "tanggal_diminta",
      header: "Tanggal Diminta",
      cell: ({ row }) => {
        const d = new Date(row.original.tanggal_diminta)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(d)
      },
    },
    {
      accessorKey: "tanggal_diperlukan",
      header: "Tanggal Diperlukan",
      cell: ({ row }) => {
        if (!row.original.tanggal_diperlukan) return <span className="text-muted-foreground">-</span>
        const d = new Date(row.original.tanggal_diperlukan)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(d)
      },
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status] || "outline"} className={statusClasses[row.original.status]}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      id: "po",
      header: "PO",
      cell: ({ row }) => {
        const pos = getPOList(row.original)
        if (pos.length === 0) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {pos.map((po) => (
              <Badge
                key={po.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => {
                  if (can("po.view_all")) {
                    router.push(`/purchase-order/${po.id}`)
                  } else {
                    toast.error("Aduh, kamu belum punya izin untuk melihat detail PO. Minta akses ke admin dulu ya!")
                  }
                }}
              >
                {po.kode || "Draft"}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: "po_status",
      header: "PO Status",
      cell: ({ row }) => {
        const pos = getPOList(row.original)
        if (pos.length === 0) return <span className="text-muted-foreground">-</span>
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
        return (
          <div className="flex flex-wrap gap-1">
            {pos.map((po) => (
              <Badge key={po.id} variant={poStatusColors[po.status] || "outline"} className={poStatusClasses[po.status]}>
                {poStatusLabels[po.status] || po.status}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Dibuat",
      cell: ({ row }) => {
        const d = new Date(row.original.created_at)
        return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "short", timeStyle: "short" }).format(d)
      },
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
              <DropdownMenuItem onClick={() => router.push(`/permintaan-pembelian/${row.original.id}`)}>
                <ExternalLinkIcon /> Detail
              </DropdownMenuItem>
              {row.original.status === "draft" && (
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

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center gap-2">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search kode or pemohon..." value={search} onChange={(e) => { setSorting([]); setSearch(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }} className="h-8 w-full max-w-sm pl-8" />
          <Select value={statusFilter || "all"} onValueChange={(v) => { setSorting([]); setStatusFilter(v === "all" ? "" : v ?? ""); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="menunggu">Menunggu</SelectItem>
              <SelectItem value="diverifikasi">Diverifikasi</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
              <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => { setSorting([]); setDateFrom(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }} className="h-8 w-40" />
          <span className="text-xs text-muted-foreground">—</span>
          <Input type="date" value={dateTo} onChange={(e) => { setSorting([]); setDateTo(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })) }} className="h-8 w-40" />
          {selectedCount > 0 && (
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
                <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(value) => col.toggleVisibility(!!value)}>{col.id}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {can("pp.create") && (
            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push("/permintaan-pembelian/create")}>
              <PlusIcon /> <span className="hidden lg:inline">New PP</span>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="cursor-pointer" onClick={() => router.push(`/permintaan-pembelian/${row.original.id}`)}>
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
            <AlertDialogTitle>Delete PP?</AlertDialogTitle>
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
            <AlertDialogTitle>Delete {selectedCount} PP(s)?</AlertDialogTitle>
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