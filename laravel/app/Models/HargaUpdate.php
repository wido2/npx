<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HargaUpdate extends Model
{
    use HasUuids;

    protected $fillable = [
        'kode',
        'vendor_id',
        'keterangan',
        'created_by',
    ];

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatHarga::class, 'referensi_id', 'id')
            ->where('referensi_type', static::class);
    }
}
