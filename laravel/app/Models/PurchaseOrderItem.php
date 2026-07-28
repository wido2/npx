<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class PurchaseOrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'purchase_order_id',
        'display_type',
        'urutan',
        'barang_id',
        'jumlah',
        'harga_satuan',
        'diskon',
        'subtotal',
        'jenis_pajak_id',
        'nilai_pajak',
        'total_setelah_pajak',
        'keterangan',
        'permintaan_pembelian_item_id',
    ];

    public function isSection(): bool
    {
        return $this->display_type === 'section';
    }

    public function isNote(): bool
    {
        return $this->display_type === 'note';
    }

    public function isProduct(): bool
    {
        return $this->display_type === null;
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('urutan');
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function jenisPajak(): BelongsTo
    {
        return $this->belongsTo(JenisPajak::class, 'jenis_pajak_id');
    }

    public function receiptItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderReceiptItem::class, 'purchase_order_item_id');
    }

    public function permintaanPembelianItem(): BelongsTo
    {
        return $this->belongsTo(PermintaanPembelianItem::class, 'permintaan_pembelian_item_id');
    }

    public function getJumlahDiterimaAttribute(): int
    {
        return $this->receiptItems()->sum('jumlah_diterima');
    }

    public function getSisaAttribute(): int
    {
        return $this->jumlah - $this->jumlah_diterima;
    }
}
