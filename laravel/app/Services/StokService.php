<?php

namespace App\Services;

use App\Models\Barang;
use App\Models\MutasiStok;
use Illuminate\Support\Facades\DB;

class StokService
{
    public function tambah(Barang $barang, int $jumlah, ?string $referensiType = null, ?string $referensiId = null, ?string $keterangan = null, ?string $createdBy = null): MutasiStok
    {
        return DB::transaction(function () use ($barang, $jumlah, $referensiType, $referensiId, $keterangan, $createdBy) {
            $stokSebelum = $barang->stok;
            $barang->increment('stok', $jumlah);

            return MutasiStok::create([
                'barang_id' => $barang->id,
                'tipe' => 'masuk',
                'jumlah' => $jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSebelum + $jumlah,
                'referensi_type' => $referensiType,
                'referensi_id' => $referensiId,
                'keterangan' => $keterangan,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
        });
    }

    public function kurangi(Barang $barang, int $jumlah, ?string $referensiType = null, ?string $referensiId = null, ?string $keterangan = null, ?string $createdBy = null): MutasiStok
    {
        return DB::transaction(function () use ($barang, $jumlah, $referensiType, $referensiId, $keterangan, $createdBy) {
            if ($barang->stok < $jumlah) {
                throw new \RuntimeException("Stok barang {$barang->nama} tidak mencukupi. Stok: {$barang->stok}, diminta: {$jumlah}");
            }

            $stokSebelum = $barang->stok;
            $barang->decrement('stok', $jumlah);

            return MutasiStok::create([
                'barang_id' => $barang->id,
                'tipe' => 'keluar',
                'jumlah' => -$jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSebelum - $jumlah,
                'referensi_type' => $referensiType,
                'referensi_id' => $referensiId,
                'keterangan' => $keterangan,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
        });
    }

    public function opname(Barang $barang, int $stokBaru, ?string $keterangan = null, ?string $createdBy = null): MutasiStok
    {
        return DB::transaction(function () use ($barang, $stokBaru, $keterangan, $createdBy) {
            $stokSebelum = $barang->stok;
            $selisih = $stokBaru - $stokSebelum;

            $barang->update(['stok' => $stokBaru]);

            return MutasiStok::create([
                'barang_id' => $barang->id,
                'tipe' => 'opname',
                'jumlah' => $selisih,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokBaru,
                'keterangan' => $keterangan,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
        });
    }
}
