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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
import { AddBarangSheet } from "@/components/add-barang-sheet"

import {
  fetchBarangs, deleteBarang, bulkDeleteBarangs, fetchBarangHargaHistory,
  type Barang, type RiwayatHarga,
} from "@/lib/barang-api"
import { fetchMutasi, type MutasiStok } from "@/lib/inventory-api"
import {
  AlertTriangleIcon,
  BanknoteIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  EyeIcon,
  LoaderIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

export function BarangTable() {
  const router = useRouter()
  const { can } = useAuth()
  const [data, setData] = useState<Barang[]>([])
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editItem, setEditItem] = useState<Barang | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<Barang | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Harga sheet
  const [hargaSheetOpen, setHargaSheetOpen] = useState(false)
  const [hargaSheetBarang, setHargaSheetBarang] = useState<Barang | null>(null)
  const [hargaHistory, setHargaHistory] = useState<RiwayatHarga[]>([])
  const [hargaHistoryLoading, setHargaHistoryLoading] = useState(false)

  // Stok sheet
  const [stokSheetOpen, setStokSheetOpen] = useState(false)
  const [stokSheetBarang, setStokSheetBarang] = useState<Barang | null>(null)
  const [mutasiHistory, setMutasiHistory] = useState<MutasiStok[]>([])
  const [mutasiHistoryLoading, setMutasiHistoryLoading] = useState(false)



  function openHargaSheet(barang: Barang) {
    setHargaSheetBarang(barang)
    setHargaSheetOpen(true)
    setHargaHistoryLoading(true)
    fetchBarangHargaHistory(barang.id, { per_page: 5 })
      .then((res) => setHargaHistory(res.data))
      .catch(() => toast.error("Gagal memuat riwayat harga"))
      .finally(() => setHargaHistoryLoading(false))
  }

  function openStokSheet(barang: Barang) {
    setStokSheetBarang(barang)
    setStokSheetOpen(true)
    setMutasiHistoryLoading(true)
    fetchMutasi({ barang_id: barang.id, per_page: 5 })
      .then((res) => setMutasiHistory(res.data))
      .catch(() => toast.error("Gagal memuat riwayat stok"))
      .finally(() => setMutasiHistoryLoading(false))
  }

  async function handleDelete(barang: Barang) {
    setDeleting(true)
    try {
      await deleteBarang(barang.id)
      toast.success(`${barang.kode} - ${barang.nama} deleted`)
      loadData()
    } catch {
      toast.error(`Failed to delete ${barang.kode}`)
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
      await bulkDeleteBarangs(items.map((i) => i.id))
      toast.success(
        items
          .map((i) => `${i.kode} - ${i.nama}`)
          .join(", ") + " deleted"
      )
      setRowSelection({})
      loadData()
    } catch {
      toast.error("Failed to delete barangs")
    } finally {
      setDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const sortField = sorting[0]?.id || "created_at"
      const sortDir = sorting[0]?.desc ? "desc" : "asc"
      const res = await fetchBarangs({
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

  useEffect(() => {
    loadData()
  }, [loadData])

  const columns: ColumnDef<Barang>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "kode",
        header: "Kode",
      },
      {
        accessorKey: "nama",
        header: "Nama Barang",
      },
      {
        accessorKey: "kategori.nama",
        header: "Kategori",
        cell: ({ row }) => row.original.kategori?.nama || "-",
      },
      {
        accessorKey: "unit.singkatan",
        header: "Satuan",
        cell: ({ row }) => row.original.unit?.singkatan || "-",
      },
      {
        accessorKey: "harga_beli",
        header: "Harga Beli",
        cell: ({ row }) => {
          const r = row.original
          return (
            <button
              type="button"
              className="cursor-pointer underline-offset-2 hover:underline hover:text-primary"
              onClick={(e) => { e.stopPropagation(); openHargaSheet(r) }}
            >
              {r.harga_beli != null
                ? `Rp${new Intl.NumberFormat("id-ID", {
                    style: "decimal",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Math.round(r.harga_beli))}`
                : "-"}
            </button>
          )
        },
      },
      {
        accessorKey: "stok",
        header: "Stok",
        cell: ({ row }) => {
          const r = row.original
          const isLow = r.stok_minimum > 0 && r.stok <= r.stok_minimum
          return (
            <button
              type="button"
              className={cn("cursor-pointer underline-offset-2 hover:underline hover:text-primary", isLow ? "flex items-center gap-1 text-destructive font-medium" : "")}
              onClick={(e) => { e.stopPropagation(); openStokSheet(r) }}
            >
              {isLow && <AlertTriangleIcon className="size-4" />}
              {r.stok}
            </button>
          )
        },
      },
      {
        accessorKey: "stok_minimum",
        header: "Stok Min",
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="flex size-8 text-muted-foreground data-open:bg-muted"
                    size="icon"
                  />
                }
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={() => router.push(`/barang/${row.original.id}`)}
                  >
                    <EyeIcon />
                    Detail
                  </DropdownMenuItem>
                  {can("master.barang.edit") && (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditItem(row.original)
                        setSheetOpen(true)
                      }}
                    >
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {can("master.barang.edit") && can("master.barang.delete") && <DropdownMenuSeparator />}
                  {can("master.barang.delete") && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setDeletingItem(row.original)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
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
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex flex-1 items-center gap-2">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search kode or nama..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="h-8 w-full max-w-sm pl-8"
          />
          {selectedCount > 0 && can("master.barang.delete") && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2Icon />
              Delete ({selectedCount})
            </Button>
          )}
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
                    {col.id === "kategori.nama"
                      ? "Kategori"
                      : col.id === "unit.singkatan"
                        ? "Satuan"
                        : col.id === "harga_beli"
                          ? "Harga Beli"
                          : col.id === "stok_minimum"
                            ? "Stok Min"
                            : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {can("master.barang.update_harga") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => router.push("/barang/harga/update")}
            >
              <BanknoteIcon />
              <span className="hidden lg:inline">Update Harga</span>
            </Button>
          )}
          {can("master.barang.create") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setEditItem(null)
                setSheetOpen(true)
              }}
            >
              <PlusIcon />
              <span className="hidden lg:inline">Add Barang</span>
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
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => router.push(`/barang/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() =>
                table.setPageIndex(table.getPageCount() - 1)
              }
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>

      {/* Harga Sheet */}
      <Sheet open={hargaSheetOpen} onOpenChange={setHargaSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Riwayat Harga</SheetTitle>
            <SheetDescription>{hargaSheetBarang?.kode} — {hargaSheetBarang?.nama}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-3 p-6 pt-4 overflow-y-auto">
            {hargaHistoryLoading ? (
              <div className="flex items-center justify-center py-10"><LoaderIcon className="size-5 animate-spin text-muted-foreground" /></div>
            ) : hargaHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Belum ada riwayat harga</p>
            ) : (
              hargaHistory.map((h) => {
                const sumberLabel: Record<string, string> = {
                  "App\\Models\\Barang": "Manual",
                  "App\\Models\\PurchaseOrderItem": "PO",
                  "App\\Models\\HargaUpdate": "HU",
                }
                const tipe = h.referensi_type ? (sumberLabel[h.referensi_type] || h.referensi_type.split("\\").pop() || "-") : "-"
                return (
                  <div key={h.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(h.created_at))}</span>
                      <span className="font-medium text-foreground">{tipe}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600 tabular-nums">{formatCurrency(h.harga_beli_lama)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-emerald-600 font-medium tabular-nums">{formatCurrency(h.harga_beli_baru)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{h.dibuat_oleh?.name || "-"}</span>
                      {h.keterangan && <span>{h.keterangan}</span>}
                    </div>
                  </div>
                )
              })
            )}
            {hargaSheetBarang && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setHargaSheetOpen(false); router.push(`/barang/${hargaSheetBarang.id}/harga`) }}
              >
                <ExternalLinkIcon className="size-4" />
                Lihat Selengkapnya
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Stok Sheet */}
      <Sheet open={stokSheetOpen} onOpenChange={setStokSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Riwayat Stok</SheetTitle>
            <SheetDescription>{stokSheetBarang?.kode} — {stokSheetBarang?.nama}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-3 p-6 pt-4 overflow-y-auto">
            {mutasiHistoryLoading ? (
              <div className="flex items-center justify-center py-10"><LoaderIcon className="size-5 animate-spin text-muted-foreground" /></div>
            ) : mutasiHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Belum ada riwayat stok</p>
            ) : (
              mutasiHistory.map((m) => {
                const tipeColor: Record<string, string> = {
                  masuk: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
                  keluar: "text-red-600 bg-red-50 dark:bg-red-950",
                  opname: "text-blue-600 bg-blue-50 dark:bg-blue-950",
                }
                const tipeLabel: Record<string, string> = {
                  masuk: "Masuk", keluar: "Keluar", opname: "Opname",
                }
                return (
                  <div key={m.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(m.created_at))}
                      </span>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tipeColor[m.tipe] || "")}>
                        {tipeLabel[m.tipe] || m.tipe}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Stok: <span className="tabular-nums">{m.stok_sebelum}</span></span>
                      <span className="text-muted-foreground">→</span>
                      <span className="tabular-nums font-medium">{m.stok_sesudah}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.jumlah > 0 ? "+" : ""}{m.jumlah} | {m.keterangan || "-"}
                    </div>
                  </div>
                )
              })
            )}
            {stokSheetBarang && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setStokSheetOpen(false); router.push(`/inventory/barang/${stokSheetBarang.id}`) }}
              >
                <ExternalLinkIcon className="size-4" />
                Lihat Selengkapnya
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete barang?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem
                ? `${deletingItem.kode} - ${deletingItem.nama}. `
                : ""}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting || !deletingItem}
              onClick={() => deletingItem && handleDelete(deletingItem)}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Delete {selectedCount} barang(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {table
                .getSelectedRowModel()
                .rows.map((r) => `${r.original.kode} - ${r.original.nama}`)
                .join(", ")}
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleBulkDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddBarangSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setEditItem(null)
          setSheetOpen(open)
        }}
        onSuccess={loadData}
        editItem={editItem}
      />
    </div>
  )
}
