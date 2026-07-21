<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PembelianLangsung extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pembelian_langsung';

    protected $fillable = [
        'kode',
        'vendor_id',
        'karyawan_id',
        'tanggal',
        'catatan',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function karyawan(): BelongsTo
    {
        return $this->belongsTo(Karyawan::class);
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItemPembelianLangsung::class, 'pembelian_langsung_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(PembelianLangsungAttachment::class, 'pembelian_langsung_id');
    }
}
