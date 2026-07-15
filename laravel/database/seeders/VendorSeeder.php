<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Contact;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            ['kode' => 'V-001', 'nama' => 'PT. Karya Baja Utama', 'tipe' => 'supplier'],
            ['kode' => 'V-002', 'nama' => 'CV. Anugrah Teknik Mandiri', 'tipe' => 'supplier'],
            ['kode' => 'V-003', 'nama' => 'PT. Sinar Las Nusantara', 'tipe' => 'supplier'],
            ['kode' => 'V-004', 'nama' => 'UD. Baja Sejahtera', 'tipe' => 'supplier'],
            ['kode' => 'V-005', 'nama' => 'PT. Multi Welding Indonesia', 'tipe' => 'supplier'],
            ['kode' => 'V-006', 'nama' => 'CV. Teknindo Jaya Abadi', 'tipe' => 'supplier'],
            ['kode' => 'V-007', 'nama' => 'PT. Boilerindo Perkasa', 'tipe' => 'supplier'],
            ['kode' => 'V-008', 'nama' => 'CV. Sinar Logam Jaya', 'tipe' => 'keduanya'],
            ['kode' => 'V-009', 'nama' => 'UD. Karya Mandiri Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-010', 'nama' => 'PT. Indal Steel Works', 'tipe' => 'supplier'],
            ['kode' => 'V-011', 'nama' => 'CV. Mitra Baja Sentosa', 'tipe' => 'keduanya'],
            ['kode' => 'V-012', 'nama' => 'PT. Pipa Mas Sejahtera', 'tipe' => 'supplier'],
            ['kode' => 'V-013', 'nama' => 'UD. Las Karya Abadi', 'tipe' => 'supplier'],
            ['kode' => 'V-014', 'nama' => 'PT. Cipta Baja Raya', 'tipe' => 'supplier'],
            ['kode' => 'V-015', 'nama' => 'CV. Anugrah Metalindo', 'tipe' => 'keduanya'],
            ['kode' => 'V-016', 'nama' => 'PT. Sumber Baja Perkasa', 'tipe' => 'supplier'],
            ['kode' => 'V-017', 'nama' => 'CV. Tiga Putra Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-018', 'nama' => 'UD. Barokah Teknik', 'tipe' => 'keduanya'],
            ['kode' => 'V-019', 'nama' => 'PT. Bintang Welding Supply', 'tipe' => 'supplier'],
            ['kode' => 'V-020', 'nama' => 'CV. Makmur Jaya Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-021', 'nama' => 'PT. Kencana Baja Utama', 'tipe' => 'supplier'],
            ['kode' => 'V-022', 'nama' => 'CV. Sinar Abadi Perkasa', 'tipe' => 'keduanya'],
            ['kode' => 'V-023', 'nama' => 'UD. Sumber Rezeki Las', 'tipe' => 'supplier'],
            ['kode' => 'V-024', 'nama' => 'PT. Bangun Pratama Engineering', 'tipe' => 'konsumen'],
            ['kode' => 'V-025', 'nama' => 'CV. Indo Welding Solution', 'tipe' => 'keduanya'],
            ['kode' => 'V-026', 'nama' => 'PT. Baja Nusa Persada', 'tipe' => 'supplier'],
            ['kode' => 'V-027', 'nama' => 'UD. Tiga Bersaudara Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-028', 'nama' => 'CV. Palembang Baja Teknik', 'tipe' => 'keduanya'],
            ['kode' => 'V-029', 'nama' => 'PT. Sinar Terang Logam', 'tipe' => 'supplier'],
            ['kode' => 'V-030', 'nama' => 'CV. Berkah Baja Abadi', 'tipe' => 'supplier'],
            ['kode' => 'V-031', 'nama' => 'UD. Maju Jaya Welding', 'tipe' => 'supplier'],
            ['kode' => 'V-032', 'nama' => 'PT. Teknik Metalindo Perkasa', 'tipe' => 'keduanya'],
            ['kode' => 'V-033', 'nama' => 'CV. Aneka Las Sejahtera', 'tipe' => 'supplier'],
            ['kode' => 'V-034', 'nama' => 'PT. Bumi Baja Indah', 'tipe' => 'supplier'],
            ['kode' => 'V-035', 'nama' => 'UD. Cahaya Baja Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-036', 'nama' => 'CV. Sinar Mas Baja', 'tipe' => 'keduanya'],
            ['kode' => 'V-037', 'nama' => 'PT. Mandiri Welding Indonesia', 'tipe' => 'supplier'],
            ['kode' => 'V-038', 'nama' => 'CV. Karya Agung Baja', 'tipe' => 'supplier'],
            ['kode' => 'V-039', 'nama' => 'UD. Sumber Baja Abadi', 'tipe' => 'supplier'],
            ['kode' => 'V-040', 'nama' => 'PT. Baja Teknik Nusantara', 'tipe' => 'keduanya'],
            ['kode' => 'V-041', 'nama' => 'CV. Sinar Jaya Metal', 'tipe' => 'supplier'],
            ['kode' => 'V-042', 'nama' => 'PT. Welding Indo Perkasa', 'tipe' => 'supplier'],
            ['kode' => 'V-043', 'nama' => 'UD. Karya Logam Sejahtera', 'tipe' => 'supplier'],
            ['kode' => 'V-044', 'nama' => 'CV. Baja Mas Engineering', 'tipe' => 'keduanya'],
            ['kode' => 'V-045', 'nama' => 'PT. Sinar Mentari Baja', 'tipe' => 'supplier'],
            ['kode' => 'V-046', 'nama' => 'UD. Anugrah Baja Kencana', 'tipe' => 'supplier'],
            ['kode' => 'V-047', 'nama' => 'CV. Tunas Baja Teknik', 'tipe' => 'supplier'],
            ['kode' => 'V-048', 'nama' => 'PT. Baja Sejahtera Abadi', 'tipe' => 'keduanya'],
            ['kode' => 'V-049', 'nama' => 'UD. Sinar Rejeki Las', 'tipe' => 'supplier'],
            ['kode' => 'V-050', 'nama' => 'CV. Bumi Welding Indonesia', 'tipe' => 'supplier'],
        ];

        $kotaList = [
            'Surabaya', 'Jakarta Utara', 'Bandung', 'Semarang', 'Medan',
            'Makassar', 'Palembang', 'Batam', 'Tangerang', 'Bekasi',
            'Depok', 'Bogor', 'Yogyakarta', 'Solo', 'Malang',
            'Denpasar', 'Balikpapan', 'Samarinda', 'Pontianak', 'Pekanbaru',
        ];

        $provinsiMap = [
            'Surabaya' => 'Jawa Timur', 'Jakarta Utara' => 'DKI Jakarta',
            'Bandung' => 'Jawa Barat', 'Semarang' => 'Jawa Tengah',
            'Medan' => 'Sumatera Utara', 'Makassar' => 'Sulawesi Selatan',
            'Palembang' => 'Sumatera Selatan', 'Batam' => 'Kepulauan Riau',
            'Tangerang' => 'Banten', 'Bekasi' => 'Jawa Barat',
            'Depok' => 'Jawa Barat', 'Bogor' => 'Jawa Barat',
            'Yogyakarta' => 'DI Yogyakarta', 'Solo' => 'Jawa Tengah',
            'Malang' => 'Jawa Timur', 'Denpasar' => 'Bali',
            'Balikpapan' => 'Kalimantan Timur', 'Samarinda' => 'Kalimantan Timur',
            'Pontianak' => 'Kalimantan Barat', 'Pekanbaru' => 'Riau',
        ];

        $jalanList = [
            'Jl. Raya Industri', 'Jl. Gatot Subroto', 'Jl. Ahmad Yani',
            'Jl. Soekarno Hatta', 'Jl. Diponegoro', 'Jl. Sudirman',
            'Jl. MT Haryono', 'Jl. Pahlawan', 'Jl. Merdeka',
            'Jl. Veteran', 'Jl. Gajah Mada', 'Jl. Hayam Wuruk',
            'Jl. Panglima Sudirman', 'Jl. Basuki Rahmat', 'Jl. Pemuda',
            'Jl. Kertajaya', 'Jl. Dharmawangsa', 'Jl. Margorejo',
            'Jl. Raya Kalirungkut', 'Jl. Raya Darmo',
        ];

        $namaOrang = [
            'Ahmad Fauzi', 'Budi Santoso', 'Chandra Wijaya', 'Dwi Hartono',
            'Eko Prasetyo', 'Farid Maulana', 'Gunawan Saputra', 'Hendra Gunawan',
            'Irfan Hakim', 'Joko Susilo', 'Kurniawan Effendi', 'Lukman Hidayat',
            'Muhammad Rizki', 'Nugroho Wibisono', 'Purnomo Setiawan',
            'Rudi Hermawan', 'Slamet Riyadi', 'Taufik Hidayat', 'Wawan Kurniawan',
            'Yoga Pratama', 'Agus Salim', 'Bambang Supriyanto', 'Cahyono Putro',
            'Deni Kuswanto', 'Edi Purwanto', 'Fajar Nugroho', 'Haryono Putra',
            'Indra Lesmana', 'Joko Prasetyo', 'Karim Abdullah',
            'Mulyono Raharjo', 'Nur Hidayat', 'Oki Setiawan', 'Pramudya Kurniawan',
            'Rahmat Hidayatullah', 'Sutrisno Adi', 'Triyono Saputro',
            'Wahyu Widodo', 'Yulianto Effendi', 'Zainal Arifin',
            'Siti Nurhaliza', 'Rina Wati', 'Dewi Sartika', 'Fitri Handayani',
            'Mega Suryani', 'Rina Marlina', 'Tri Wahyuni', 'Indah Permata Sari',
            'Ratna Dewi', 'Lina Marlina',
        ];

        $jabatanList = [
            'Direktur', 'Manajer Penjualan', 'Sales Executive', 'Marketing Manager',
            'Teknisi', 'Kepala Gudang', 'Admin', 'Supervisor', 'General Manager',
            'Business Development', 'Customer Service', 'Finance Manager',
        ];

        $now = now();
        $vendorIds = [];

        foreach ($vendors as $v) {
            $id = (string) Str::uuid();
            $vendorIds[] = $id;
            Vendor::create([
                'id' => $id,
                'kode' => $v['kode'],
                'nama' => $v['nama'],
                'npwp' => fake()->boolean(70) ? sprintf('%02d.%03d.%03d.%d-%03d.%03d', rand(1,99), rand(1,999), rand(1,999), rand(1,9), rand(1,999), rand(1,999)) : null,
                'tipe' => $v['tipe'],
                'keterangan' => match ($v['tipe']) {
                    'supplier' => 'Supplier ' . $v['nama'] . ' menyediakan berbagai kebutuhan las dan fabrikasi',
                    'konsumen' => 'Perusahaan engineering yang menggunakan jasa fabrikasi',
                    'keduanya' => 'Mitra bisnis yang memasok bahan baku dan juga menggunakan jasa fabrikasi',
                },
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $addressRecords = [];
        $contactRecords = [];

        foreach ($vendorIds as $i => $vendorId) {
            $kota = $kotaList[$i % count($kotaList)];
            $provinsi = $provinsiMap[$kota];
            $jalan = $jalanList[$i % count($jalanList)];
            $noJalan = rand(1, 200);
            $rtRw = sprintf('RT %02d/%02d', rand(1, 20), rand(1, 10));
            $kelurahan = 'Kelurahan ' . ['Sukajadi', 'Cihapit', 'Babakan', 'Kebonwaru', 'Cisarua', 'Padasuka', 'Cibaduyut', 'Cijaura', 'Margahayu', 'Cimahi'][$i % 10];

            $addressRecords[] = [
                'id' => (string) Str::uuid(),
                'addressable_id' => $vendorId,
                'addressable_type' => Vendor::class,
                'label' => 'Kantor',
                'alamat' => "$jalan No. $noJalan, $rtRw, $kelurahan",
                'provinsi' => $provinsi,
                'kota' => $kota,
                'kecamatan' => 'Kecamatan ' . ['Bojongloa', 'Cicendo', 'Regol', 'Coblong', 'Bandung Wetan', 'Cibeunying', 'Antapani', 'Arcamanik', 'Rancasari', 'Buahbatu'][$i % 10],
                'kelurahan' => $kelurahan,
                'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                'utama' => true,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($i % 3 === 0) {
                $addressRecords[] = [
                    'id' => (string) Str::uuid(),
                    'addressable_id' => $vendorId,
                    'addressable_type' => Vendor::class,
                    'label' => 'Gudang',
                    'alamat' => "Jl. Pergudangan No. " . rand(1, 50) . ", Kawasan Industri " . $kota,
                    'provinsi' => $provinsi,
                    'kota' => $kota,
                    'kecamatan' => 'Kecamatan ' . ['Rungkut', 'Gunung Anyar', 'Tandes', 'Benowo', 'Lakarsantri', 'Sambikerep', 'Pakal', 'Krembangan', 'Semampir', 'Pabean Cantian'][$i % 10],
                    'kelurahan' => 'Kelurahan ' . ['Industri', 'Pergudangan', 'Kawasan', 'Sentra', 'Karya'][$i % 5],
                    'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                    'utama' => false,
                    'aktif' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($i % 5 === 0) {
                $addressRecords[] = [
                    'id' => (string) Str::uuid(),
                    'addressable_id' => $vendorId,
                    'addressable_type' => Vendor::class,
                    'label' => 'Workshop',
                    'alamat' => "Jl. Industri Raya Blok A" . rand(1, 20) . " No. " . rand(1, 30),
                    'provinsi' => $provinsi,
                    'kota' => $kota,
                    'kecamatan' => 'Kecamatan ' . ['Cakung', 'Pulogadung', 'Jatinegara', 'Matraman', 'Duren Sawit'][$i % 5],
                    'kelurahan' => 'Kelurahan ' . ['Pulogadung', 'Cakung', 'Rawa Terate', 'Jatinegara', 'Penggilingan'][$i % 5],
                    'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                    'utama' => false,
                    'aktif' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            $namaKontak = $namaOrang[$i % count($namaOrang)];
            $jabatan = $jabatanList[$i % count($jabatanList)];

            $contactRecords[] = [
                'id' => (string) Str::uuid(),
                'contactable_id' => $vendorId,
                'contactable_type' => Vendor::class,
                'nama' => $namaKontak,
                'jabatan' => $jabatan,
                'telepon' => sprintf('0%d-%d', rand(21, 31), rand(100000, 9999999)),
                'hp' => sprintf('08%d%d', rand(10, 99), rand(10000000, 99999999)),
                'email' => strtolower(str_replace(' ', '', explode(',', $namaKontak)[0])) . '@' . strtolower(str_replace([' ', '.', ','], '', explode(' ', explode(',', explode('(', $v['nama'])[0])[0])[1] ?? 'email')) . '.co.id',
                'utama' => true,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($i % 4 === 0) {
                $contactRecords[] = [
                    'id' => (string) Str::uuid(),
                    'contactable_id' => $vendorId,
                    'contactable_type' => Vendor::class,
                    'nama' => $namaOrang[($i + 25) % count($namaOrang)],
                    'jabatan' => $jabatanList[($i + 3) % count($jabatanList)],
                    'telepon' => sprintf('0%d-%d', rand(21, 31), rand(100000, 9999999)),
                    'hp' => sprintf('08%d%d', rand(10, 99), rand(10000000, 99999999)),
                    'email' => 'kontak' . ($i + 1) . '@' . strtolower(str_replace([' ', '.', ','], '', explode(' ', $v['nama'])[1] ?? 'vendor')) . '.co.id',
                    'utama' => false,
                    'aktif' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        Address::insert($addressRecords);
        Contact::insert($contactRecords);
    }
}
