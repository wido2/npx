<?php

namespace App\Http\Controllers;

use App\Models\PermintaanPembelian;
use App\Models\PermintaanPembelianItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\User;
use App\Notifications\PPSubmitted;
use App\Notifications\PPVerified;
use App\Notifications\PPRejected;
use App\Services\KodePOService;
use App\Services\KodePPService;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class PermintaanPembelianController extends Controller
{
    public function __construct(
        protected KodePPService $kodePPService,
        protected KodePOService $kodePOService,
        protected PurchaseOrderService $poService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('pp.view_all')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = PermintaanPembelian::query()
            ->with([
                'dibuatOlehUser:id,name',
                'client:id,kode,nama',
                'project:id,kode,nama',
                'purchaseOrders:id,kode,status,permintaan_pembelian_id',
                'items.purchaseOrderItem.purchaseOrder:id,kode,status',
            ]);

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'like', "%{$search}%")
                    ->orWhereHas('dibuatOlehUser', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->status) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->date_from) {
            $query->whereDate('tanggal_diminta', '>=', $dateFrom);
        }

        if ($dateTo = $request->date_to) {
            $query->whereDate('tanggal_diminta', '<=', $dateTo);
        }

        $sortField = $request->sort_field ?? 'created_at';
        $sortDir = $request->sort_dir ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        $perPage = min((int) ($request->per_page ?? 10), 100);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('pp.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'client_id' => 'nullable|exists:clients,id',
            'tanggal_diminta' => 'required|date',
            'tanggal_diperlukan' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $validated['dibuat_oleh'] = $request->user()->id;
        $validated['status'] = 'draft';

        $pp = PermintaanPembelian::create($validated);

        return response()->json($pp->load(['dibuatOlehUser:id,name', 'client', 'project']), 201);
    }

    public function show(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.view_all')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pp = $permintaanPembelian->load([
            'dibuatOlehUser:id,name',
            'diverifikasiOlehUser:id,name',
            'client:id,kode,nama',
            'project:id,kode,nama',
            'items.barang:id,kode,nama,vendor_id',
            'items.barang.vendor:id,nama',
            'items.purchaseOrderItem.purchaseOrder:id,kode,status',
            'purchaseOrders:id,kode,status,permintaan_pembelian_id',
        ]);

        return response()->json($pp);
    }

    public function update(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be edited'], 422);
        }

        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'client_id' => 'nullable|exists:clients,id',
            'tanggal_diminta' => 'required|date',
            'tanggal_diperlukan' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $permintaanPembelian->update($validated);

        return response()->json($permintaanPembelian->fresh()->load(['dibuatOlehUser:id,name', 'client', 'project']));
    }

    public function destroy(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be deleted'], 422);
        }

        $permintaanPembelian->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        if (!$request->user()->can('pp.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ids = $request->validate(['ids' => 'required|array'])['ids'];

        $deleted = PermintaanPembelian::whereIn('id', $ids)
            ->where('status', 'draft')
            ->delete();

        return response()->json(['message' => "{$deleted} PP(s) deleted"]);
    }

    public function kirim(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.submit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be submitted'], 422);
        }

        if ($permintaanPembelian->items()->count() === 0) {
            return response()->json(['message' => 'Minimal satu item'], 422);
        }

        $kode = $this->kodePPService->generate();

        $permintaanPembelian->update([
            'kode' => $kode,
            'status' => 'menunggu',
        ]);

        $recipients = User::permission('notification.pp_submitted')->get();
        Notification::send($recipients, new PPSubmitted($permintaanPembelian, $request->user()->name));

        return response()->json($permintaanPembelian->fresh()->load(['dibuatOlehUser:id,name', 'client', 'project', 'items.barang:id,kode,nama,vendor_id', 'items.barang.vendor:id,nama', 'purchaseOrders:id,kode,status,permintaan_pembelian_id']));
    }

    public function verifikasi(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.verify')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'menunggu') {
            return response()->json(['message' => 'Only menunggu can be verified'], 422);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:permintaan_pembelian_items,id',
            'items.*.jumlah_disetujui' => 'required|integer|min:0',
            'items.*.catatan_logistik' => 'nullable|string',
        ]);

        $itemIds = collect($validated['items'])->pluck('id');

        $belongsToPP = $permintaanPembelian->items()
            ->whereIn('id', $itemIds)
            ->count();

        if ($belongsToPP !== $itemIds->count()) {
            return response()->json(['message' => 'Invalid items'], 422);
        }

        DB::transaction(function () use ($validated, $permintaanPembelian, $request) {
            foreach ($validated['items'] as $itemData) {
                $permintaanPembelian->items()
                    ->where('id', $itemData['id'])
                    ->update([
                        'jumlah_disetujui' => $itemData['jumlah_disetujui'],
                        'catatan_logistik' => $itemData['catatan_logistik'] ?? null,
                    ]);
            }

            $permintaanPembelian->update([
                'status' => 'diverifikasi',
                'diverifikasi_oleh' => $request->user()->id,
                'tanggal_diverifikasi' => now(),
            ]);
        });

        $permintaanPembelian = $permintaanPembelian->fresh()->load([
            'dibuatOlehUser:id,name', 'diverifikasiOlehUser:id,name',
            'client', 'project', 'items.barang:id,kode,nama,vendor_id', 'items.barang.vendor:id,nama',
            'purchaseOrders:id,kode,status,permintaan_pembelian_id',
        ]);

        $recipients = User::permission('notification.pp_verified')->get();
        Notification::send($recipients, new PPVerified($permintaanPembelian, $request->user()->name));

        return response()->json($permintaanPembelian);
    }

    public function tolak(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.verify')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'menunggu') {
            return response()->json(['message' => 'Only menunggu can be rejected'], 422);
        }

        $validated = $request->validate([
            'alasan_ditolak' => 'nullable|string',
        ]);

        $permintaanPembelian->update([
            'status' => 'ditolak',
            'alasan_ditolak' => $validated['alasan_ditolak'] ?? null,
            'diverifikasi_oleh' => $request->user()->id,
            'tanggal_diverifikasi' => now(),
        ]);

        $permintaanPembelian = $permintaanPembelian->fresh();

        $recipients = User::permission('notification.pp_rejected')->get();
        Notification::send($recipients, new PPRejected($permintaanPembelian, $request->user()->name));

        return response()->json($permintaanPembelian);
    }

    public function batalkan(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.cancel')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (in_array($permintaanPembelian->status, ['diterima', 'dibatalkan'])) {
            return response()->json(['message' => 'Cannot cancel in this status'], 422);
        }

        $permintaanPembelian->update(['status' => 'dibatalkan']);

        return response()->json($permintaanPembelian->fresh());
    }

    public function buatPO(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.create_po')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'diverifikasi') {
            return response()->json(['message' => 'PP must be verified first'], 422);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'tanggal_po' => 'nullable|date',
            'catatan' => 'nullable|string',
            'syarat_pembayaran' => 'nullable|string',
            'alamat_kirim' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.pp_item_id' => 'nullable|exists:permintaan_pembelian_items,id',
            'items.*.barang_id' => 'required_without:items.*.pp_item_id|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'numeric|min:0',
            'items.*.diskon' => 'numeric|min:0',
            'items.*.jenis_pajak_id' => 'nullable|exists:jenis_pajak,id',
            'items.*.keterangan' => 'nullable|string',
        ]);

        $pp = $permintaanPembelian->load('items');

        $poItems = [];
        foreach ($validated['items'] as $itemData) {
            $barangId = $itemData['barang_id'] ?? null;
            $keterangan = $itemData['keterangan'] ?? null;

            if ($ppItemId = $itemData['pp_item_id'] ?? null) {
                $ppItem = $pp->items->firstWhere('id', $ppItemId);
                if (!$ppItem) {
                    return response()->json(['message' => "Item {$ppItemId} not found in this PP"], 422);
                }
                if ($ppItem->jumlah_disetujui === null) {
                    return response()->json(['message' => "Item {$ppItem->barang_id} has not been reviewed"], 422);
                }
                if ($itemData['jumlah'] > $ppItem->jumlah_disetujui) {
                    return response()->json(['message' => "Quantity exceeds approved amount for item {$ppItem->barang_id}"], 422);
                }
                $barangId = $ppItem->barang_id;
                $keterangan ??= 'Dari PP: ' . $permintaanPembelian->kode;
            }

            $poItems[] = [
                'pp_item_id' => $ppItemId ?? null,
                'barang_id' => $barangId,
                'jumlah' => $itemData['jumlah'],
                'harga_satuan' => $itemData['harga_satuan'] ?? 0,
                'diskon' => $itemData['diskon'] ?? 0,
                'jenis_pajak_id' => $itemData['jenis_pajak_id'] ?? null,
                'keterangan' => $keterangan,
            ];
        }

        $po = DB::transaction(function () use ($request, $validated, $poItems, $permintaanPembelian) {
            $tanggalPO = $validated['tanggal_po'] ?? now()->format('Y-m-d');
            $po = PurchaseOrder::create([
                'kode' => $this->kodePOService->generate(\Carbon\Carbon::parse($tanggalPO)),
                'vendor_id' => $validated['vendor_id'],
                'client_id' => $permintaanPembelian->client_id,
                'project_id' => $permintaanPembelian->project_id,
                'permintaan_pembelian_id' => $permintaanPembelian->id,
                'tanggal_po' => $tanggalPO,
                'status' => 'draft',
                'subtotal' => 0,
                'diskon' => 0,
                'total' => 0,
                'catatan' => $validated['catatan'] ?? 'Dibuat dari PP: ' . $permintaanPembelian->kode,
                'syarat_pembayaran' => $validated['syarat_pembayaran'] ?? null,
                'alamat_kirim' => $validated['alamat_kirim'] ?? null,
                'dibuat_oleh' => $request->user()->id,
            ]);

            foreach ($poItems as $poItemData) {
                $poItem = PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'barang_id' => $poItemData['barang_id'],
                    'jumlah' => $poItemData['jumlah'],
                    'harga_satuan' => $poItemData['harga_satuan'],
                    'diskon' => $poItemData['diskon'],
                    'subtotal' => 0,
                    'jenis_pajak_id' => $poItemData['jenis_pajak_id'],
                    'nilai_pajak' => 0,
                    'total_setelah_pajak' => 0,
                    'keterangan' => $poItemData['keterangan'],
                    'permintaan_pembelian_item_id' => $poItemData['pp_item_id'],
                ]);

                $this->poService->recalculateItem($poItem);
            }

            return $po->fresh()->load(['vendor:id,kode,nama', 'items.barang:id,kode,nama']);
        });

        return response()->json($po, 201);
    }
}