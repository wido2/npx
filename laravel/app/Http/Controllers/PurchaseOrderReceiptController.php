<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;

class PurchaseOrderReceiptController extends Controller
{
    public function index(PurchaseOrder $purchaseOrder): JsonResponse
    {
        return response()->json(
            $purchaseOrder->receipts()->with([
                'items.barang:id,kode,nama',
                'diterimaOleh:id,name',
            ])->get()
        );
    }

    public function show(PurchaseOrder $purchaseOrder, string $receipt): JsonResponse
    {
        $receipt = $purchaseOrder->receipts()->with([
            'items.purchaseOrderItem.barang:id,kode,nama',
            'items.barang:id,kode,nama',
            'diterimaOleh:id,name',
        ])->findOrFail($receipt);

        return response()->json($receipt);
    }
}
