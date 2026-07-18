<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HargaSupplier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'barang_id',
        'vendor_id',
        'harga_beli',
        'mata_uang',
        'keterangan',
    ];

    protected function casts(): array
    {
        return [
            'harga_beli' => 'decimal:2',
        ];
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function riwayatHargaSuppliers(): HasMany
    {
        return $this->hasMany(RiwayatHargaSupplier::class);
    }
}
