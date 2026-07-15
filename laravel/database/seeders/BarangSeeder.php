<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Unit;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BarangSeeder extends Seeder
{
    public function run(): void
    {
        $kategoriIds = [];
        $kategoris = [
            ['nama' => 'Elektroda & Kawat Las', 'deskripsi' => 'Berbagai jenis elektroda dan kawat las'],
            ['nama' => 'Pelat Baja', 'deskripsi' => 'Pelat baja karbon dan baja paduan'],
            ['nama' => 'Pipa & Fitting', 'deskripsi' => 'Pipa seamless, ERW, dan perlengkapannya'],
            ['nama' => 'Alat K3', 'deskripsi' => 'Alat keselamatan dan keamanan kerja'],
            ['nama' => 'Peralatan Las', 'deskripsi' => 'Mesin las dan perlengkapannya'],
            ['nama' => 'Komponen Boiler', 'deskripsi' => 'Suku cadang dan komponen boiler'],
            ['nama' => 'Besi Profil', 'deskripsi' => 'Besi siku, UNP, H-Beam, dan profil lainnya'],
            ['nama' => 'Alat Ukur & Inspeksi', 'deskripsi' => 'Alat ukur presisi dan inspeksi'],
            ['nama' => 'Perlengkapan Bengkel', 'deskripsi' => 'Alat bantu kerja bengkel'],
            ['nama' => 'Bahan Kimia', 'deskripsi' => 'Bahan kimia untuk pengelasan dan fabrikasi'],
        ];

        foreach ($kategoris as $k) {
            $id = (string) Str::uuid();
            $kategoriIds[] = $id;
            KategoriBarang::create(array_merge($k, ['id' => $id]));
        }

        $unitIds = [];
        $units = [
            ['nama' => 'Pieces', 'singkatan' => 'pcs'],
            ['nama' => 'Kilogram', 'singkatan' => 'kg'],
            ['nama' => 'Meter', 'singkatan' => 'm'],
            ['nama' => 'Lembar', 'singkatan' => 'lbr'],
            ['nama' => 'Liter', 'singkatan' => 'L'],
            ['nama' => 'Roll', 'singkatan' => 'rol'],
            ['nama' => 'Set', 'singkatan' => 'set'],
            ['nama' => 'Box', 'singkatan' => 'box'],
            ['nama' => 'Batang', 'singkatan' => 'btg'],
            ['nama' => 'Pasang', 'singkatan' => 'psg'],
        ];

        foreach ($units as $u) {
            $id = (string) Str::uuid();
            $unitIds[] = $id;
            Unit::create(array_merge($u, ['id' => $id]));
        }

        $items = [
            ['kode' => 'EL-001', 'nama' => 'Elektroda E6013 3.2mm', 'kat' => 0, 'unt' => 1, 'harga' => 18000, 'stok' => 200, 'min' => 20],
            ['kode' => 'EL-002', 'nama' => 'Elektroda E7018 2.6mm', 'kat' => 0, 'unt' => 1, 'harga' => 22000, 'stok' => 150, 'min' => 15],
            ['kode' => 'EL-003', 'nama' => 'Kawat Las MIG ER70S-6 0.8mm', 'kat' => 0, 'unt' => 1, 'harga' => 25000, 'stok' => 100, 'min' => 10],
            ['kode' => 'EL-004', 'nama' => 'Kawat Las Flux Core E71T-1 1.2mm', 'kat' => 0, 'unt' => 1, 'harga' => 30000, 'stok' => 80, 'min' => 10],
            ['kode' => 'PL-001', 'nama' => 'Pelat Baja SS400 6mm x 1200 x 2400', 'kat' => 1, 'unt' => 3, 'harga' => 850000, 'stok' => 50, 'min' => 5],
            ['kode' => 'PL-002', 'nama' => 'Pelat Baja A36 10mm x 1500 x 3000', 'kat' => 1, 'unt' => 3, 'harga' => 1500000, 'stok' => 30, 'min' => 3],
            ['kode' => 'PL-003', 'nama' => 'Pelat Baja Hardox 400 8mm', 'kat' => 1, 'unt' => 3, 'harga' => 2200000, 'stok' => 20, 'min' => 2],
            ['kode' => 'PL-004', 'nama' => 'Pelat Baja Galvanis 2mm x 1000 x 2000', 'kat' => 1, 'unt' => 3, 'harga' => 350000, 'stok' => 40, 'min' => 5],
            ['kode' => 'PP-001', 'nama' => 'Pipa Seamless SCH40 2" x 6m', 'kat' => 2, 'unt' => 8, 'harga' => 450000, 'stok' => 60, 'min' => 5],
            ['kode' => 'PP-002', 'nama' => 'Pipa ERW 1.5" x 6m', 'kat' => 2, 'unt' => 8, 'harga' => 180000, 'stok' => 80, 'min' => 10],
            ['kode' => 'PP-003', 'nama' => 'Pipa Seamless SCH80 4" x 6m', 'kat' => 2, 'unt' => 8, 'harga' => 1200000, 'stok' => 25, 'min' => 3],
            ['kode' => 'PP-004', 'nama' => 'Flange JIS 10K 2"', 'kat' => 2, 'unt' => 0, 'harga' => 85000, 'stok' => 100, 'min' => 10],
            ['kode' => 'PP-005', 'nama' => 'Elbow 90° SCH40 2"', 'kat' => 2, 'unt' => 0, 'harga' => 35000, 'stok' => 120, 'min' => 15],
            ['kode' => 'PP-006', 'nama' => 'Tee SCH40 2"', 'kat' => 2, 'unt' => 0, 'harga' => 45000, 'stok' => 80, 'min' => 10],
            ['kode' => 'K3-001', 'nama' => 'Helmet Safety Proyek', 'kat' => 3, 'unt' => 0, 'harga' => 35000, 'stok' => 100, 'min' => 20],
            ['kode' => 'K3-002', 'nama' => 'Kacamata Safety', 'kat' => 3, 'unt' => 0, 'harga' => 15000, 'stok' => 150, 'min' => 20],
            ['kode' => 'K3-003', 'nama' => 'Sarung Tangan Las (Welding Gloves)', 'kat' => 3, 'unt' => 9, 'harga' => 45000, 'stok' => 80, 'min' => 10],
            ['kode' => 'K3-004', 'nama' => 'Apron Kulit Las', 'kat' => 3, 'unt' => 0, 'harga' => 75000, 'stok' => 40, 'min' => 5],
            ['kode' => 'K3-005', 'nama' => 'Welding Mask / Helmed Las Otomatis', 'kat' => 3, 'unt' => 0, 'harga' => 350000, 'stok' => 30, 'min' => 5],
            ['kode' => 'K3-006', 'nama' => 'Masker Respirator N95', 'kat' => 3, 'unt' => 0, 'harga' => 8000, 'stok' => 200, 'min' => 30],
            ['kode' => 'LAS-001', 'nama' => 'Mesin Las MMA / Inverter 200A', 'kat' => 4, 'unt' => 6, 'harga' => 2500000, 'stok' => 10, 'min' => 2],
            ['kode' => 'LAS-002', 'nama' => 'Mesin Las MIG 250A', 'kat' => 4, 'unt' => 6, 'harga' => 4500000, 'stok' => 8, 'min' => 1],
            ['kode' => 'LAS-003', 'nama' => 'Mesin Las TIG 200A AC/DC', 'kat' => 4, 'unt' => 6, 'harga' => 5500000, 'stok' => 5, 'min' => 1],
            ['kode' => 'LAS-004', 'nama' => 'Regulator CO2 untuk Las MIG', 'kat' => 4, 'unt' => 0, 'harga' => 350000, 'stok' => 15, 'min' => 2],
            ['kode' => 'LAS-005', 'nama' => 'Torch Las MIG 3m', 'kat' => 4, 'unt' => 0, 'harga' => 450000, 'stok' => 12, 'min' => 2],
            ['kode' => 'LAS-006', 'nama' => 'Kabel Las 50mm² (permeter)', 'kat' => 4, 'unt' => 2, 'harga' => 25000, 'stok' => 200, 'min' => 30],
            ['kode' => 'LAS-007', 'nama' => 'Tang Las (Electrode Holder)', 'kat' => 4, 'unt' => 0, 'harga' => 35000, 'stok' => 50, 'min' => 5],
            ['kode' => 'BLR-001', 'nama' => 'Water Level Gauge Boiler', 'kat' => 5, 'unt' => 6, 'harga' => 750000, 'stok' => 10, 'min' => 2],
            ['kode' => 'BLR-002', 'nama' => 'Pressure Gauge Boiler 0-25 Bar', 'kat' => 5, 'unt' => 0, 'harga' => 150000, 'stok' => 20, 'min' => 3],
            ['kode' => 'BLR-003', 'nama' => 'Safety Valve Boiler 1"', 'kat' => 5, 'unt' => 0, 'harga' => 850000, 'stok' => 15, 'min' => 2],
            ['kode' => 'BLR-004', 'nama' => 'Steam Trap Thermostatic', 'kat' => 5, 'unt' => 0, 'harga' => 550000, 'stok' => 12, 'min' => 2],
            ['kode' => 'BLR-005', 'nama' => 'Burner Boiler Oil/Gas', 'kat' => 5, 'unt' => 6, 'harga' => 8500000, 'stok' => 3, 'min' => 1],
            ['kode' => 'BLR-006', 'nama' => 'Tube Boiler / Pipa Boiler 2" x 6m', 'kat' => 5, 'unt' => 8, 'harga' => 650000, 'stok' => 40, 'min' => 5],
            ['kode' => 'BLR-007', 'nama' => 'Gasket Boiler / Packing Tahan Panas', 'kat' => 5, 'unt' => 0, 'harga' => 25000, 'stok' => 100, 'min' => 15],
            ['kode' => 'BLR-008', 'nama' => 'Rockwool Insulasi (roll 15m²)', 'kat' => 5, 'unt' => 5, 'harga' => 450000, 'stok' => 20, 'min' => 3],
            ['kode' => 'BPR-001', 'nama' => 'Besi Siku 40x40x4 mm x 6m', 'kat' => 6, 'unt' => 8, 'harga' => 120000, 'stok' => 80, 'min' => 10],
            ['kode' => 'BPR-002', 'nama' => 'Besi UNP 100 x 6m', 'kat' => 6, 'unt' => 8, 'harga' => 350000, 'stok' => 40, 'min' => 5],
            ['kode' => 'BPR-003', 'nama' => 'Besi H-Beam 200 x 12m', 'kat' => 6, 'unt' => 8, 'harga' => 2500000, 'stok' => 15, 'min' => 2],
            ['kode' => 'BPR-004', 'nama' => 'Plat Strip 30x5 mm x 6m', 'kat' => 6, 'unt' => 8, 'harga' => 45000, 'stok' => 100, 'min' => 15],
            ['kode' => 'BPR-005', 'nama' => 'Baut & Mur M12 x 50mm (set)', 'kat' => 6, 'unt' => 6, 'harga' => 2500, 'stok' => 500, 'min' => 50],
            ['kode' => 'BPR-006', 'nama' => 'Baut & Mur M16 x 60mm (set)', 'kat' => 6, 'unt' => 6, 'harga' => 3500, 'stok' => 400, 'min' => 40],
            ['kode' => 'UKR-001', 'nama' => 'Mikrometer 0-25mm', 'kat' => 7, 'unt' => 0, 'harga' => 350000, 'stok' => 10, 'min' => 2],
            ['kode' => 'UKR-002', 'nama' => 'Jangka Sorong Digital 150mm', 'kat' => 7, 'unt' => 0, 'harga' => 250000, 'stok' => 15, 'min' => 2],
            ['kode' => 'UKR-003', 'nama' => 'Welding Gauge / Alat Ukur Las', 'kat' => 7, 'unt' => 0, 'harga' => 150000, 'stok' => 12, 'min' => 2],
            ['kode' => 'UKR-004', 'nama' => 'Thermometer Infrared (Thermal Gun)', 'kat' => 7, 'unt' => 0, 'harga' => 200000, 'stok' => 10, 'min' => 2],
            ['kode' => 'BKL-001', 'nama' => 'Gerinda Tangan 4"', 'kat' => 8, 'unt' => 0, 'harga' => 350000, 'stok' => 20, 'min' => 3],
            ['kode' => 'BKL-002', 'nama' => 'Batu Gerinda Potong 4"', 'kat' => 8, 'unt' => 0, 'harga' => 5000, 'stok' => 300, 'min' => 50],
            ['kode' => 'BKL-003', 'nama' => 'Batu Gerinda Halus 4"', 'kat' => 8, 'unt' => 0, 'harga' => 7000, 'stok' => 250, 'min' => 40],
            ['kode' => 'BKL-004', 'nama' => 'Kunci Pas Set 8-24mm', 'kat' => 8, 'unt' => 6, 'harga' => 250000, 'stok' => 15, 'min' => 2],
            ['kode' => 'BKL-005', 'nama' => 'Kunci Ring Set 8-24mm', 'kat' => 8, 'unt' => 6, 'harga' => 280000, 'stok' => 12, 'min' => 2],

        ];

        $vendorIds = Vendor::pluck('id')->toArray();

        $now = now();
        $barangs = [];
        foreach ($items as $i => $item) {
            $barangs[] = [
                'id' => (string) Str::uuid(),
                'kode' => $item['kode'],
                'nama' => $item['nama'],
                'deskripsi' => null,
                'kategori_id' => $kategoriIds[$item['kat']],
                'unit_id' => $unitIds[$item['unt']],
                'vendor_id' => $vendorIds[$i % count($vendorIds)],
                'harga_beli' => $item['harga'],
                'stok' => $item['stok'],
                'stok_minimum' => $item['min'],
                'gambar' => null,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        Barang::insert($barangs);
    }
}
