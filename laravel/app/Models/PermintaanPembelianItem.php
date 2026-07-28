<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PermintaanPembelianItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'permintaan_pembelian_items';

    protected $fillable = [
        'permintaan_pembelian_id',
        'barang_id',
        'jumlah_diminta',
        'jumlah_disetujui',
        'catatan',
        'catatan_logistik',
    ];

    public function permintaanPembelian(): BelongsTo
    {
        return $this->belongsTo(PermintaanPembelian::class, 'permintaan_pembelian_id');
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function purchaseOrderItem(): HasOne
    {
        return $this->hasOne(PurchaseOrderItem::class, 'permintaan_pembelian_item_id');
    }
}