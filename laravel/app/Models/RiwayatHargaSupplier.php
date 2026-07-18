<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatHargaSupplier extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'harga_supplier_id',
        'barang_id',
        'vendor_id',
        'harga_beli_lama',
        'harga_beli_baru',
        'referensi_type',
        'referensi_id',
        'keterangan',
        'created_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'harga_beli_lama' => 'decimal:2',
            'harga_beli_baru' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function hargaSupplier(): BelongsTo
    {
        return $this->belongsTo(HargaSupplier::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
