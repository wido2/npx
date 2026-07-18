<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'barangs';

    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'kategori_id',
        'unit_id',
        'vendor_id',
        'harga_beli',
        'stok',
        'stok_minimum',
        'gambar',
        'aktif',
    ];

    protected $appends = ['latest_po_price'];

    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function vendors(): BelongsToMany
    {
        return $this->belongsToMany(Vendor::class, 'harga_suppliers')
            ->withPivot(['harga_beli', 'mata_uang', 'keterangan'])
            ->withTimestamps();
    }

    public function riwayatHargas(): HasMany
    {
        return $this->hasMany(RiwayatHarga::class);
    }

    public function hargaSuppliers(): HasMany
    {
        return $this->hasMany(HargaSupplier::class);
    }

    public function riwayatHargaSuppliers(): HasMany
    {
        return $this->hasMany(RiwayatHargaSupplier::class);
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'barang_id');
    }

    public function getLatestPoPriceAttribute(): ?array
    {
        $item = $this->purchaseOrderItems()
            ->whereHas('purchaseOrder', function ($q) {
                $q->whereIn('status', ['selesai', 'diterima', 'disetujui']);
            })
            ->with('purchaseOrder:id,kode,tanggal_po,status')
            ->latest('created_at')
            ->first();

        if (!$item) {
            return null;
        }

        return [
            'harga' => (float) $item->harga_satuan,
            'po_number' => $item->purchaseOrder?->kode,
            'po_date' => $item->purchaseOrder?->tanggal_po,
            'po_status' => $item->purchaseOrder?->status,
        ];
    }
}
