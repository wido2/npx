<?php

namespace App\Services;

use App\Models\Barang;
use App\Models\RiwayatHarga;
use Illuminate\Support\Facades\DB;

class HargaService
{
    public function rekam(Barang $barang, float $hargaBaru, ?string $referensiType = null, ?string $referensiId = null, ?string $keterangan = null, ?string $createdBy = null): ?RiwayatHarga
    {
        $hargaLama = (float) $barang->harga_beli;

        if ($hargaLama === $hargaBaru) {
            return null;
        }

        return DB::transaction(function () use ($barang, $hargaLama, $hargaBaru, $referensiType, $referensiId, $keterangan, $createdBy) {
            $barang->update(['harga_beli' => $hargaBaru]);

            return RiwayatHarga::create([
                'barang_id' => $barang->id,
                'harga_beli_lama' => $hargaLama,
                'harga_beli_baru' => $hargaBaru,
                'referensi_type' => $referensiType,
                'referensi_id' => $referensiId,
                'keterangan' => $keterangan,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
        });
    }
}
