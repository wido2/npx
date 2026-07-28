<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'kode',
        'vendor_id',
        'client_id',
        'project_id',
        'permintaan_pembelian_id',
        'tanggal_po',
        'tanggal_kirim_expected',
        'status',
        'subtotal',
        'diskon',
        'total',
        'catatan',
        'syarat_pembayaran',
        'alamat_kirim',
        'dibuat_oleh',
        'disetujui_oleh',
        'diterima_oleh',
        'tanggal_disetujui',
        'tanggal_diterima',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_po' => 'date',
            'tanggal_kirim_expected' => 'date',
            'tanggal_disetujui' => 'datetime',
            'tanggal_diterima' => 'datetime',
            'subtotal' => 'float',
            'diskon' => 'float',
            'total' => 'float',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function diterimaOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diterima_oleh');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id')->ordered();
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(PurchaseOrderReceipt::class, 'purchase_order_id');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(PurchaseOrderRevision::class, 'purchase_order_id');
    }
}
