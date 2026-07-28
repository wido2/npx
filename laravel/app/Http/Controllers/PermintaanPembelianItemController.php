<?php

namespace App\Http\Controllers;

use App\Models\PermintaanPembelian;
use App\Models\PermintaanPembelianItem;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermintaanPembelianItemController extends Controller
{
    protected PurchaseOrderService $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    public function index(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.view_all')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $items = $permintaanPembelian->items()
            ->with('barang:id,kode,nama')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request, PermintaanPembelian $permintaanPembelian): JsonResponse
    {
        if (!$request->user()->can('pp.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be edited'], 422);
        }

        $validated = $request->validate([
            'barang_id' => 'required|exists:barangs,id',
            'jumlah_diminta' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        $item = $permintaanPembelian->items()->create($validated);

        return response()->json($item->load('barang:id,kode,nama'), 201);
    }

    public function update(Request $request, PermintaanPembelian $permintaanPembelian, PermintaanPembelianItem $item): JsonResponse
    {
        if (!$request->user()->can('pp.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be edited'], 422);
        }

        if ($item->permintaan_pembelian_id !== $permintaanPembelian->id) {
            return response()->json(['message' => 'Item does not belong to this PP'], 422);
        }

        $validated = $request->validate([
            'barang_id' => 'required|exists:barangs,id',
            'jumlah_diminta' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
        ]);

        $item->update($validated);

        return response()->json($item->fresh()->load('barang:id,kode,nama'));
    }

    public function destroy(Request $request, PermintaanPembelian $permintaanPembelian, PermintaanPembelianItem $item): JsonResponse
    {
        if (!$request->user()->can('pp.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($permintaanPembelian->status !== 'draft') {
            return response()->json(['message' => 'Only draft can be edited'], 422);
        }

        if ($item->permintaan_pembelian_id !== $permintaanPembelian->id) {
            return response()->json(['message' => 'Item does not belong to this PP'], 422);
        }

        $item->delete();

        return response()->json(['message' => 'Deleted']);
    }
}