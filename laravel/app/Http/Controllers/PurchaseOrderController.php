<?php

namespace App\Http\Controllers;

use App\Models\HargaSupplier;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\RiwayatHargaSupplier;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\POApproved;
use App\Notifications\POOverdue;
use App\Notifications\POReceived;
use App\Notifications\POSubmitted;
use App\Notifications\VendorPriceChanged;
use App\Services\HargaService;
use App\Services\KodePOService;
use App\Services\PurchaseOrderService;
use App\Services\StokService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class PurchaseOrderController extends Controller
{
    public function __construct(
        protected KodePOService $kodePOService,
        protected PurchaseOrderService $poService,
        protected StokService $stokService,
        protected HargaService $hargaService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');

        $query = PurchaseOrder::with([
            'vendor:id,kode,nama',
            'client:id,kode,nama',
            'project:id,kode,nama',
            'dibuatOleh:id,name',
        ]);

        if (!$request->user()->can('po.view_all')) {
            $query->where('dibuat_oleh', $request->user()->id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhereHas('vendor', fn($v) => $v->where('nama', 'ilike', "%{$search}%"));
            });
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($dateFrom !== '') {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo !== '') {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $sortField = $request->input('sort_field', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('po.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'client_id' => 'nullable|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'tanggal_po' => 'required|date',
            'tanggal_kirim_expected' => 'nullable|date|after_or_equal:tanggal_po',
            'diskon' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
            'syarat_pembayaran' => 'nullable|string|max:255',
            'alamat_kirim' => 'nullable|string',
        ]);

        $validated['status'] = 'draft';
        $validated['subtotal'] = 0;
        $validated['total'] = 0;
        $validated['dibuat_oleh'] = $request->user()->id;
        $validated['diskon'] ??= 0;
        $validated['kode'] = $this->kodePOService->generate(
            \Carbon\Carbon::parse($validated['tanggal_po'])
        );

        $po = PurchaseOrder::create($validated);

        $this->poService->simpanRevisi($po, []);

        return response()->json($po->load([
            'vendor:id,kode,nama',
            'client:id,kode,nama',
            'project:id,kode,nama',
        ]), 201);
    }

    public function show(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $po = $purchaseOrder->load([
            'vendor',
            'client',
            'project.unit',
            'items.barang',
            'items.jenisPajak',
            'receipts.items.barang',
        ]);

        $data = $po->toArray();
        $data['dibuat_oleh_user'] = $po->dibuatOleh?->only(['id', 'name']);
        $data['disetujui_oleh_user'] = $po->disetujuiOleh?->only(['id', 'name']);
        $data['diterima_oleh_user'] = $po->diterimaOleh?->only(['id', 'name']);

        return response()->json($data);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be updated'], 422);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'client_id' => 'nullable|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'tanggal_po' => 'required|date',
            'tanggal_kirim_expected' => 'nullable|date|after_or_equal:tanggal_po',
            'diskon' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
            'syarat_pembayaran' => 'nullable|string|max:255',
            'alamat_kirim' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|exists:purchase_order_items,id',
            'items.*.barang_id' => 'required_without:items.*.display_type|nullable|exists:barangs,id',
            'items.*.display_type' => 'nullable|in:section,note',
            'items.*.keterangan' => 'nullable|string',
            'items.*.jumlah' => 'nullable|integer|min:1',
            'items.*.harga_satuan' => 'nullable|numeric|min:0',
            'items.*.diskon' => 'nullable|numeric|min:0',
            'items.*.jenis_pajak_id' => 'nullable|exists:jenis_pajak,id',
        ]);

        $validated['diskon'] ??= 0;

        $changedFields = [];
        foreach (['vendor_id', 'client_id', 'project_id', 'tanggal_po', 'tanggal_kirim_expected', 'diskon', 'catatan', 'syarat_pembayaran', 'alamat_kirim'] as $key) {
            if (isset($validated[$key]) && (string) $purchaseOrder->{$key} !== (string) $validated[$key]) {
                $changedFields[] = $key;
            }
        }

        DB::transaction(function () use ($purchaseOrder, $validated, &$changedFields) {
            $purchaseOrder->update(collect($validated)->except('items')->toArray());

            $this->poService->recalculate($purchaseOrder);

            // Process items
            if (isset($validated['items'])) {
                $existingIds = $purchaseOrder->items()->pluck('id')->toArray();
                $submittedIds = [];

                foreach ($validated['items'] as $i => $itemData) {
                    $itemData['urutan'] = $i;
                    $itemData['diskon'] ??= 0;

                    if (!empty($itemData['id'])) {
                        // Update existing
                        $submittedIds[] = $itemData['id'];
                        $item = $purchaseOrder->items()->find($itemData['id']);
                        if ($item) {
                            $item->update(collect($itemData)->except('id')->toArray());
                            if ($item->isProduct()) {
                                $item->load('jenisPajak');
                                $this->poService->recalculateItem($item);
                            }
                        }
                    } else {
                        // Create new
                        $itemData['purchase_order_id'] = $purchaseOrder->id;
                        $item = PurchaseOrderItem::create($itemData);
                        if ($item->isProduct()) {
                            $item->load('jenisPajak');
                            $this->poService->recalculateItem($item);
                        }
                        $changedFields[] = 'item_added';
                    }
                }

                // Delete items not in submitted list
                $toDelete = array_diff($existingIds, $submittedIds);
                if (!empty($toDelete)) {
                    PurchaseOrderItem::whereIn('id', $toDelete)->delete();
                    $changedFields[] = 'item_removed';
                    $this->poService->recalculate($purchaseOrder);
                }
            }
        });

        if (!empty($changedFields)) {
            $this->poService->simpanRevisi($purchaseOrder, array_unique($changedFields));
        }

        return response()->json($purchaseOrder->fresh()->load([
            'vendor:id,kode,nama',
            'items.barang:id,kode,nama',
        ]));
    }

    public function destroy(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be deleted'], 422);
        }

        $purchaseOrder->delete();

        return response()->json(['message' => 'Purchase order deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:purchase_orders,id',
        ]);

        $count = PurchaseOrder::whereIn('id', $validated['ids'])
            ->where('status', 'draft')
            ->delete();

        return response()->json(['message' => $count . ' purchase order(s) deleted']);
    }

    public function kirim(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.submit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be submitted'], 422);
        }

        if ($purchaseOrder->items()->count() === 0) {
            return response()->json(['message' => 'PO must have at least one item'], 422);
        }

        $purchaseOrder->update(['status' => 'dikirim']);

        $this->poService->simpanRevisi($purchaseOrder, ['status']);

        $purchaseOrder->load('vendor');

        $recipients = User::permission('notification.po_submitted')->get();
        Notification::send($recipients, new POSubmitted($purchaseOrder, $request->user()->name));

        return response()->json($purchaseOrder->fresh()->load([
            'vendor:id,kode,nama',
            'items.barang:id,kode,nama',
        ]));
    }

    public function setujui(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.approve')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($purchaseOrder->status !== 'dikirim') {
            return response()->json(['message' => 'Only submitted PO can be approved'], 422);
        }

        $purchaseOrder->update([
            'status' => 'disetujui',
            'disetujui_oleh' => $request->user()->id,
            'tanggal_disetujui' => now(),
        ]);

        $this->updateHargaSupplierDariPO($purchaseOrder, $request->user()->id);

        $this->poService->simpanRevisi($purchaseOrder, ['status', 'disetujui_oleh', 'tanggal_disetujui']);

        $purchaseOrder->load('vendor');

        $recipients = collect();
        if ($purchaseOrder->dibuat_oleh && $purchaseOrder->dibuat_oleh !== $request->user()->id) {
            $recipients->push($purchaseOrder->dibuatOleh);
        }
        $notifUsers = User::permission('notification.po_approved')
            ->where('id', '!=', $purchaseOrder->dibuat_oleh ?? '')
            ->get();
        $recipients = $recipients->merge($notifUsers)->unique('id');
        Notification::send($recipients, new POApproved($purchaseOrder, $request->user()->name));

        return response()->json($purchaseOrder->fresh());
    }

    public function terima(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.receive')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!in_array($purchaseOrder->status, ['disetujui', 'diterima_sebagian'])) {
            return response()->json(['message' => 'PO must be approved to receive'], 422);
        }

        $validated = $request->validate([
            'tanggal_terima' => 'nullable|date',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.jumlah_diterima' => 'required|integer|min:1',
            'items.*.keterangan' => 'nullable|string',
        ]);

        DB::transaction(function () use ($purchaseOrder, $validated, $request) {
            $receipt = $purchaseOrder->receipts()->create([
                'nomor' => 'TRM-' . now()->format('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'tanggal_terima' => $validated['tanggal_terima'] ?? now()->toDateString(),
                'catatan' => $validated['catatan'] ?? null,
                'diterima_oleh' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $poItem = $purchaseOrder->items()->findOrFail($itemData['purchase_order_item_id']);

                $receipt->items()->create([
                    'purchase_order_item_id' => $poItem->id,
                    'barang_id' => $poItem->barang_id,
                    'jumlah_dipesan' => $poItem->jumlah,
                    'jumlah_diterima' => $itemData['jumlah_diterima'],
                    'keterangan' => $itemData['keterangan'] ?? null,
                ]);

                $this->stokService->tambah(
                    $poItem->barang,
                    $itemData['jumlah_diterima'],
                    PurchaseOrder::class,
                    $purchaseOrder->id,
                    null,
                    $request->user()->id
                );

                $this->hargaService->rekam(
                    $poItem->barang,
                    (float) $poItem->harga_satuan,
                    PurchaseOrderItem::class,
                    $poItem->id,
                    "Dari PO {$purchaseOrder->kode}",
                    $request->user()->id,
                );
            }

            $purchaseOrder->load('items');
            $totalSisa = $purchaseOrder->items->sum('sisa');

            if ($totalSisa <= 0) {
                $purchaseOrder->update([
                    'status' => 'diterima',
                    'diterima_oleh' => $request->user()->id,
                    'tanggal_diterima' => now(),
                ]);

                $this->updateHargaSupplierDariPO($purchaseOrder, $request->user()->id);
            } else {
                $purchaseOrder->update([
                    'status' => 'diterima_sebagian',
                    'diterima_oleh' => $request->user()->id,
                    'tanggal_diterima' => now(),
                ]);
            }
        });

        $purchaseOrder->load('vendor');

        $recipients = collect();
        if ($purchaseOrder->dibuat_oleh && $purchaseOrder->dibuat_oleh !== $request->user()->id) {
            $recipients->push($purchaseOrder->dibuatOleh);
        }
        $notifUsers = User::permission('notification.po_received')
            ->where('id', '!=', $purchaseOrder->dibuat_oleh ?? '')
            ->get();
        $recipients = $recipients->merge($notifUsers)->unique('id');
        Notification::send($recipients, new POReceived($purchaseOrder, $request->user()->name));

        return response()->json($purchaseOrder->fresh()->load([
            'receipts.items',
            'items.barang',
        ]));
    }

    public function stats(Request $request): JsonResponse
    {
        $tahun = now()->year;

        $totalBulanIni = PurchaseOrder::whereYear('created_at', $tahun)
            ->whereMonth('created_at', now()->month)
            ->count();

        $totalNilaiBulanIni = PurchaseOrder::whereYear('created_at', $tahun)
            ->whereMonth('created_at', now()->month)
            ->sum('total');

        $perStatus = PurchaseOrder::whereYear('created_at', $tahun)
            ->select('status', DB::raw('count(*) as total'), DB::raw('COALESCE(sum(total), 0) as total_nilai'))
            ->groupBy('status')
            ->get();

        $statusCounts = $perStatus->pluck('total', 'status');
        $statusNilai = $perStatus->pluck('total_nilai', 'status');

        $totalDisetujuiBulanIni = (int) ($statusCounts['disetujui'] ?? 0);
        $totalNilaiDisetujuiBulanIni = (float) ($statusNilai['disetujui'] ?? 0);

        return response()->json([
            'total_bulan_ini' => $totalBulanIni,
            'total_nilai_bulan_ini' => (float) $totalNilaiBulanIni,
            'total_disetujui_bulan_ini' => $totalDisetujuiBulanIni,
            'total_nilai_disetujui_bulan_ini' => (float) $totalNilaiDisetujuiBulanIni,
            'draft' => (int) ($statusCounts['draft'] ?? 0),
            'draft_nilai' => (float) ($statusNilai['draft'] ?? 0),
            'dikirim' => (int) ($statusCounts['dikirim'] ?? 0),
            'dikirim_nilai' => (float) ($statusNilai['dikirim'] ?? 0),
            'disetujui' => (int) ($statusCounts['disetujui'] ?? 0),
            'disetujui_nilai' => (float) ($statusNilai['disetujui'] ?? 0),
            'diterima' => (int) ($statusCounts['diterima'] ?? 0),
            'diterima_nilai' => (float) ($statusNilai['diterima'] ?? 0),
            'diterima_sebagian' => (int) ($statusCounts['diterima_sebagian'] ?? 0),
            'diterima_sebagian_nilai' => (float) ($statusNilai['diterima_sebagian'] ?? 0),
            'dibatalkan' => (int) ($statusCounts['dibatalkan'] ?? 0),
            'dibatalkan_nilai' => (float) ($statusNilai['dibatalkan'] ?? 0),
        ]);
    }

    public function batalkan(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if (!$request->user()->can('po.cancel')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (in_array($purchaseOrder->status, ['diterima', 'dibatalkan'])) {
            return response()->json(['message' => 'PO cannot be cancelled'], 422);
        }

        $purchaseOrder->update([
            'status' => 'dibatalkan',
        ]);

        $this->poService->simpanRevisi($purchaseOrder, ['status']);

        return response()->json($purchaseOrder->fresh());
    }

    public function pdf(PurchaseOrder $purchaseOrder): \Illuminate\Http\Response
    {
        $po = $purchaseOrder->load([
            'vendor',
            'vendor.addresses',
            'client',
            'project',
            'items.barang',
            'items.jenisPajak',
            'dibuatOleh',
            'disetujuiOleh',
            'diterimaOleh',
        ]);

        $generalSetting = Setting::where('group', 'general')->first();
        $pdfSetting = Setting::where('group', 'po_pdf')->first() ?? Setting::where('group', 'pdf_report')->first();
        $dataSetting = $generalSetting ? $generalSetting->data : [];
        $pdfData = $pdfSetting ? $pdfSetting->data : [];
        $dataSetting = array_merge($dataSetting, $pdfData);

        $pdf = Pdf::loadView('pdf.purchase-order', [
            'po' => $po,
            'setting' => $dataSetting,
        ]);

        $fontPath = '/usr/share/fonts/wps-fonts';
        $fontMetrics = $pdf->getDomPDF()->getFontMetrics();
        $fontMetrics->registerFont(
            ['family' => 'Segoe UI', 'style' => 'normal', 'weight' => 'normal'],
            $fontPath . '/segoeui.ttf'
        );
        $fontMetrics->registerFont(
            ['family' => 'Segoe UI', 'style' => 'normal', 'weight' => 'bold'],
            $fontPath . '/segoeuib.ttf'
        );
        $fontMetrics->registerFont(
            ['family' => 'Segoe UI', 'style' => 'italic', 'weight' => 'normal'],
            $fontPath . '/segoeuii.ttf'
        );

        $filename = ($po->kode ?? 'PO-DRAFT') . '.pdf';
        return $pdf->stream($filename);
    }

    private function updateHargaSupplierDariPO(PurchaseOrder $purchaseOrder, string $userId): void
    {
        $purchaseOrder->load('items.barang');
        $vendorNama = $purchaseOrder->vendor?->nama ?? 'Unknown';
        $changedPrices = [];

        foreach ($purchaseOrder->items as $poItem) {
            if ($poItem->barang_id === null) continue;

            $hargaSupplier = HargaSupplier::where('vendor_id', $purchaseOrder->vendor_id)
                ->where('barang_id', $poItem->barang_id)
                ->first();

            if ($hargaSupplier) {
                $hargaLama = (float) $hargaSupplier->harga_beli;
                $hargaBaru = (float) $poItem->harga_satuan;

                if ($hargaLama !== $hargaBaru) {
                    $hargaSupplier->update(['harga_beli' => $hargaBaru]);

                    RiwayatHargaSupplier::create([
                        'harga_supplier_id' => $hargaSupplier->id,
                        'barang_id' => $poItem->barang_id,
                        'vendor_id' => $purchaseOrder->vendor_id,
                        'harga_beli_lama' => $hargaLama,
                        'harga_beli_baru' => $hargaBaru,
                        'referensi_type' => PurchaseOrder::class,
                        'referensi_id' => $purchaseOrder->id,
                        'keterangan' => "Dari PO {$purchaseOrder->kode}",
                        'created_by' => $userId,
                        'created_at' => now(),
                    ]);

                    $this->hargaService->rekam(
                        $poItem->barang,
                        $hargaBaru,
                        PurchaseOrderItem::class,
                        $poItem->id,
                        "Dari PO {$purchaseOrder->kode}",
                        $userId,
                    );

                    $changedPrices[] = [
                        'barang' => $poItem->barang,
                        'vendor_nama' => $vendorNama,
                        'harga_lama' => $hargaLama,
                        'harga_baru' => $hargaBaru,
                    ];
                }
            }
        }

        if (!empty($changedPrices)) {
            $users = User::permission('notification.vendor_price_changed')->get();

            foreach ($changedPrices as $change) {
                Notification::send($users, new VendorPriceChanged(
                    $change['barang'],
                    $change['vendor_nama'],
                    $change['harga_lama'],
                    $change['harga_baru'],
                    "PO {$purchaseOrder->kode}",
                ));
            }
        }
    }
}
