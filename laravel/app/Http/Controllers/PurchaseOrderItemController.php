<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderItemController extends Controller
{
    public function __construct(
        protected PurchaseOrderService $poService,
    ) {}

    public function index(PurchaseOrder $purchaseOrder): JsonResponse
    {
        return response()->json(
            $purchaseOrder->items()->with(['barang:id,kode,nama', 'jenisPajak:id,nama,persentase'])->get()
        );
    }

    public function store(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be modified'], 422);
        }

        $validated = $request->validate([
            'display_type' => 'nullable|in:section,note',
            'keterangan' => 'required|string',
            'barang_id' => 'required_if:display_type,null|nullable|exists:barangs,id',
            'jumlah' => 'required_if:display_type,null|nullable|integer|min:1',
            'harga_satuan' => 'required_if:display_type,null|nullable|numeric|min:0',
            'diskon' => 'nullable|numeric|min:0',
            'jenis_pajak_id' => 'nullable|exists:jenis_pajak,id',
            'urutan' => 'nullable|integer|min:0',
        ]);

        $validated['purchase_order_id'] = $purchaseOrder->id;

        // Set urutan: if not provided, append to end
        if (!isset($validated['urutan'])) {
            $maxUrutan = $purchaseOrder->items()->max('urutan') ?? 0;
            $validated['urutan'] = $maxUrutan + 1;
        }

        // Default values for section/note
        if ($validated['display_type'] !== null) {
            $validated['jumlah'] ??= 0;
            $validated['harga_satuan'] ??= 0;
            $validated['diskon'] ??= 0;
            $validated['subtotal'] = 0;
            $validated['nilai_pajak'] = 0;
            $validated['total_setelah_pajak'] = 0;
        } else {
            $validated['diskon'] ??= 0;
        }

        $item = PurchaseOrderItem::create($validated);

        // Only recalculate for product items
        if ($item->isProduct()) {
            $item->load('jenisPajak');
            $this->poService->recalculateItem($item);
        }

        return response()->json($item->load(['barang:id,kode,nama', 'jenisPajak:id,nama,persentase']), 201);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder, PurchaseOrderItem $item): JsonResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be modified'], 422);
        }

        if ($item->purchase_order_id !== $purchaseOrder->id) {
            return response()->json(['message' => 'Item does not belong to this PO'], 404);
        }

        $validated = $request->validate([
            'display_type' => 'nullable|in:section,note',
            'keterangan' => 'required|string',
            'barang_id' => 'required_if:display_type,null|nullable|exists:barangs,id',
            'jumlah' => 'required_if:display_type,null|nullable|integer|min:1',
            'harga_satuan' => 'required_if:display_type,null|nullable|numeric|min:0',
            'diskon' => 'nullable|numeric|min:0',
            'jenis_pajak_id' => 'nullable|exists:jenis_pajak,id',
            'urutan' => 'nullable|integer|min:0',
        ]);

        $validated['diskon'] ??= 0;
        $item->update($validated);

        // Only recalculate for product items
        if ($item->isProduct()) {
            $item->load('jenisPajak');
            $this->poService->recalculateItem($item);
        }

        return response()->json($item->load(['barang:id,kode,nama', 'jenisPajak:id,nama,persentase']));
    }

    public function destroy(PurchaseOrder $purchaseOrder, PurchaseOrderItem $item): JsonResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be modified'], 422);
        }

        if ($item->purchase_order_id !== $purchaseOrder->id) {
            return response()->json(['message' => 'Item does not belong to this PO'], 404);
        }

        $item->delete();
        $this->poService->recalculate($purchaseOrder);

        return response()->json(['message' => 'Item deleted']);
    }

    public function reorder(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return response()->json(['message' => 'Only draft PO can be modified'], 422);
        }

        $validated = $request->validate([
            'item_ids' => 'required|array',
            'item_ids.*' => 'exists:purchase_order_items,id',
        ]);

        foreach ($validated['item_ids'] as $index => $itemId) {
            PurchaseOrderItem::where('id', $itemId)
                ->where('purchase_order_id', $purchaseOrder->id)
                ->update(['urutan' => $index]);
        }

        return response()->json(['message' => 'Items reordered']);
    }
}
