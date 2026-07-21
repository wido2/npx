<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PembelianLangsungAttachment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pembelian_langsung_attachments';

    protected $fillable = [
        'pembelian_langsung_id',
        'nama_file',
        'path',
        'mime_type',
        'ukuran',
    ];

    public function pembelianLangsung(): BelongsTo
    {
        return $this->belongsTo(PembelianLangsung::class, 'pembelian_langsung_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }
}
