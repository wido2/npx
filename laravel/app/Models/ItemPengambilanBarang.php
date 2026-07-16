<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemPengambilanBarang extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'item_pengambilan_barang';

    protected $fillable = [
        'pengambilan_barang_id',
        'barang_id',
        'jumlah',
        'keterangan',
    ];

    public function pengambilanBarang(): BelongsTo
    {
        return $this->belongsTo(PengambilanBarang::class, 'pengambilan_barang_id');
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
