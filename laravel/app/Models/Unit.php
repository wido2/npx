<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nama',
        'singkatan',
        'aktif',
    ];

    public function barangs(): HasMany
    {
        return $this->hasMany(Barang::class, 'unit_id');
    }
}
