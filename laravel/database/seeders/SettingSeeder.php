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

        Setting::firstOrCreate(['group' => 'pembelian_langsung'], ['data' => [
            'format_kode' => 'PL-{Y}-{M}-{seq}',
            'urutan_terakhir' => 0,
            'tahun_bulan_terakhir' => '',
            'reset_periode' => 'bulanan',
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

        Setting::firstOrCreate(['group' => 'po_pdf'], ['data' => [
            'margin_top' => 15,
            'margin_right' => 12,
            'margin_bottom' => 15,
            'margin_left' => 12,
            'warna_primary' => '#7c7bad',
            'warna_secondary' => '#2c3e50',
            'warna_tabel_header' => '#7c7bad',
            'warna_ttd' => '#7c7bad',
            'warna_footer_text' => '#bbbbbb',
            'font_family' => 'Segoe UI',
            'font_size_judul' => 16,
            'font_size_tabel_header' => 7,
            'font_size_tabel_body' => 8,
            'font_size_info' => 7.5,
            'font_size_ttd' => 7,
            'font_size_footer' => 6.5,
            'logo_max_height' => 125,
            'tampilkan_logo' => true,
            'tampilkan_kode_barang' => true,
            'tampilkan_ttd' => true,
            'tampilkan_footer' => true,
            'rahasiakan_client' => false,
            'judul_laporan' => 'PURCHASE ORDER',
        ]]);

        Setting::firstOrCreate(['group' => 'pb_pdf'], ['data' => [
            'margin_top' => 15,
            'margin_right' => 12,
            'margin_bottom' => 15,
            'margin_left' => 12,
            'warna_primary' => '#7c7bad',
            'warna_secondary' => '#2c3e50',
            'warna_tabel_header' => '#7c7bad',
            'warna_ttd' => '#7c7bad',
            'warna_footer_text' => '#bbbbbb',
            'font_family' => 'Segoe UI',
            'font_size_judul' => 16,
            'font_size_tabel_header' => 7,
            'font_size_tabel_body' => 8,
            'font_size_info' => 7.5,
            'font_size_ttd' => 7,
            'font_size_footer' => 6.5,
            'logo_max_height' => 125,
            'tampilkan_logo' => true,
            'tampilkan_kode_barang' => true,
            'tampilkan_ttd' => true,
            'tampilkan_footer' => true,
            'rahasiakan_client' => false,
        ]]);
    }
}
