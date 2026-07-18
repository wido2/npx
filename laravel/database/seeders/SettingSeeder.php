<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::firstOrCreate(['group' => 'general'], ['data' => [
            'nama_perusahaan' => null,
            'npwp' => null,
            'telepon' => null,
            'email' => null,
            'website' => null,
            'logo' => null,
            'alamat' => null,
            'provinsi' => null,
            'kota' => null,
            'kecamatan' => null,
            'kelurahan' => null,
            'kode_pos' => null,
        ]]);

        Setting::firstOrCreate(['group' => 'purchase_order'], ['data' => [
            'format_kode' => 'PO-{Y}-{M}-{seq}',
            'urutan_terakhir' => 0,
            'tahun_bulan_terakhir' => '',
        ]]);

        Setting::firstOrCreate(['group' => 'pengambilan_barang'], ['data' => [
            'format_kode' => 'PB-{Y}-{M}-{seq}',
            'urutan_terakhir' => 0,
            'tahun_bulan_terakhir' => '',
            'reset_periode' => 'bulanan',
        ]]);

        Setting::firstOrCreate(['group' => 'harga_update'], ['data' => [
            'format_kode' => 'HU-{Y}-{M}-{seq}',
            'urutan_terakhir' => 0,
            'tahun_bulan_terakhir' => '',
            'reset_periode' => 'bulanan',
        ]]);

        Setting::firstOrCreate(['group' => 'pdf_report'], ['data' => [
                'warna_primary' => '#7c7bad',
                'warna_secondary' => '#2c3e50',
                'warna_tabel_header' => '#7c7bad',
                'warna_ttd' => '#7c7bad',
                'font_family' => 'Segoe UI',
                'font_size_base' => 9,
                'judul_laporan' => 'PURCHASE ORDER',
                'tampilkan_logo' => true,
                'tampilkan_kode_barang' => true,
                'tampilkan_ttd' => true,
                'tampilkan_footer' => true,
            ],
        ]);
    }
}
