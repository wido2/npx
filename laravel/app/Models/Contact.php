<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Contact extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'contactable_id',
        'contactable_type',
        'nama',
        'jabatan',
        'telepon',
        'hp',
        'email',
        'utama',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'utama' => 'boolean',
            'aktif' => 'boolean',
        ];
    }

    public function contactable(): MorphTo
    {
        return $this->morphTo();
    }
}
