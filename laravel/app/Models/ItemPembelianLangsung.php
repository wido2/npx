<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPembelianLangsung extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'item_pembelian_langsung';

    protected $fillable = [
        'pembelian_langsung_id',
        'barang_id',
        'jumlah',
        'harga_satuan',
        'keterangan',
    ];

    public function pembelianLangsung(): BelongsTo
    {
        return $this->belongsTo(PembelianLangsung::class, 'pembelian_langsung_id');
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
