<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Vendor extends Model
{
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::deleting(function (Vendor $vendor) {
            $vendor->contacts()->delete();
            $vendor->addresses()->delete();
        });
    }

    protected $fillable = [
        'kode',
        'nama',
        'npwp',
        'tipe',
        'keterangan',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function contacts(): MorphMany
    {
        return $this->morphMany(Contact::class, 'contactable');
    }

    public function barangs(): BelongsToMany
    {
        return $this->belongsToMany(Barang::class, 'harga_suppliers')
            ->withPivot(['harga_beli', 'mata_uang', 'keterangan'])
            ->withTimestamps();
    }

    public function hargaSuppliers(): HasMany
    {
        return $this->hasMany(HargaSupplier::class);
    }

    public function riwayatHargaSuppliers(): HasMany
    {
        return $this->hasMany(RiwayatHargaSupplier::class);
    }
}
