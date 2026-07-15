<?php

namespace Database\Seeders;

use App\Models\JenisPajak;
use Illuminate\Database\Seeder;

class JenisPajakSeeder extends Seeder
{
    public function run(): void
    {
        JenisPajak::create([
            'nama' => 'PPN',
            'persentase' => 11,
            'deskripsi' => 'Pajak Pertambahan Nilai 11%',
            'aktif' => true,
        ]);

        JenisPajak::create([
            'nama' => 'PPh 23',
            'persentase' => 2,
            'deskripsi' => 'Pajak Penghasilan Pasal 23',
            'aktif' => true,
        ]);
    }
}
