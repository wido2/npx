<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermintaanPembelian extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'permintaan_pembelian';

    protected $fillable = [
        'kode',
        'dibuat_oleh',
        'project_id',
        'client_id',
        'tanggal_diminta',
        'tanggal_diperlukan',
        'status',
        'catatan',
        'alasan_ditolak',
        'diverifikasi_oleh',
        'tanggal_diverifikasi',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_diminta' => 'date',
            'tanggal_diperlukan' => 'date',
            'tanggal_diverifikasi' => 'datetime',
        ];
    }

    public function dibuatOlehUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function diverifikasiOlehUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PermintaanPembelianItem::class, 'permintaan_pembelian_id');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'permintaan_pembelian_id');
    }
}