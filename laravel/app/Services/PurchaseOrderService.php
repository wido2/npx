<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Barang;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function recalculate(PurchaseOrder $po): void
    {
        $po->load('items');

        $subtotal = $po->items->sum('subtotal');
        $diskon = $po->diskon ?? 0;
        $total = $subtotal - $diskon;

        $po->update([
            'subtotal' => $subtotal,
            'total' => $total,
        ]);
    }

    public function recalculateItem(PurchaseOrderItem $item): void
    {
        $subtotal = ($item->jumlah * $item->harga_satuan) - $item->diskon;
        $nilaiPajak = 0;

        if ($item->jenis_pajak_id && $item->jenisPajak) {
            $nilaiPajak = $subtotal * $item->jenisPajak->persentase / 100;
        }

        $totalSetelahPajak = $subtotal + $nilaiPajak;

        $item->update([
            'subtotal' => $subtotal,
            'nilai_pajak' => $nilaiPajak,
            'total_setelah_pajak' => $totalSetelahPajak,
        ]);

        $this->recalculate($item->purchaseOrder);
    }

    public function simpanRevisi(PurchaseOrder $po, array $changedFields): void
    {
        $po->load('items.barang');
        $version = $po->revisions()->max('version') ?? 0;

        $po->revisions()->create([
            'version' => $version + 1,
            'data' => [
                'header' => $po->attributesToArray(),
                'items' => $po->items->toArray(),
            ],
            'changed_fields' => $changedFields,
            'changed_by' => auth()->id(),
        ]);
    }

    public function updateStok(PurchaseOrder $po): void
    {
        $po->load('items.barang');
        foreach ($po->items as $item) {
            $item->barang->increment('stok', $item->jumlah_diterima);
        }
    }
}
