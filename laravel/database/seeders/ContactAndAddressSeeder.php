<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Contact;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ContactAndAddressSeeder extends Seeder
{
    public function run(): void
    {
        $vendorIds = Vendor::pluck('id')->toArray();

        if (empty($vendorIds)) {
            return;
        }

        $now = now();

        $this->seedAddresses($vendorIds, $now);
        $this->seedContacts($vendorIds, $now);
    }

    private function seedAddresses(array $vendorIds, $now): void
    {
        $provinsiList = [
            'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
            'Jambi', 'Bengkulu', 'Sumatera Selatan', 'Bangka Belitung', 'Lampung',
            'Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta',
            'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
            'Kalimantan Barat',
        ];

        $kotaMap = [
            'Aceh' => ['Banda Aceh', 'Lhokseumawe', 'Langsa'],
            'Sumatera Utara' => ['Medan', 'Binjai', 'Pematangsiantar'],
            'Sumatera Barat' => ['Padang', 'Bukittinggi', 'Payakumbuh'],
            'Riau' => ['Pekanbaru', 'Dumai'],
            'Kepulauan Riau' => ['Batam', 'Tanjung Pinang'],
            'Jambi' => ['Jambi', 'Sungai Penuh'],
            'Bengkulu' => ['Bengkulu'],
            'Sumatera Selatan' => ['Palembang', 'Prabumulih'],
            'Bangka Belitung' => ['Pangkal Pinang'],
            'Lampung' => ['Bandar Lampung', 'Metro'],
            'Banten' => ['Tangerang', 'Cilegon', 'Serang', 'Tangerang Selatan'],
            'DKI Jakarta' => ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur'],
            'Jawa Barat' => ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi', 'Tasikmalaya', 'Cirebon'],
            'Jawa Tengah' => ['Semarang', 'Solo', 'Magelang', 'Pekalongan', 'Tegal', 'Salatiga'],
            'DI Yogyakarta' => ['Yogyakarta', 'Sleman'],
            'Jawa Timur' => ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Mojokerto', 'Kediri', 'Madiun'],
            'Bali' => ['Denpasar'],
            'Nusa Tenggara Barat' => ['Mataram', 'Bima'],
            'Nusa Tenggara Timur' => ['Kupang'],
            'Kalimantan Barat' => ['Pontianak', 'Singkawang'],
        ];

        $labelList = ['Kantor Pusat', 'Gudang', 'Workshop', 'Cabang', 'Showroom'];

        $jalanList = [
            'Jl. Raya Industri', 'Jl. Gatot Subroto', 'Jl. Ahmad Yani',
            'Jl. Soekarno Hatta', 'Jl. Diponegoro', 'Jl. Jenderal Sudirman',
            'Jl. MT Haryono', 'Jl. Pahlawan', 'Jl. Merdeka',
            'Jl. Veteran', 'Jl. Gajah Mada', 'Jl. Hayam Wuruk',
            'Jl. Panglima Sudirman', 'Jl. Basuki Rahmat', 'Jl. Pemuda',
            'Jl. Kertajaya', 'Jl. Dharmawangsa', 'Jl. Margorejo',
            'Jl. Raya Kalirungkut', 'Jl. Raya Darmo', 'Jl. KH. Hasyim Ashari',
            'Jl. Pangeran Diponegoro', 'Jl. Teuku Umar', 'Jl. Cut Nyak Dien',
            'Jl. Imam Bonjol', 'Jl. Sisingamangaraja', 'Jl. Ir. H. Juanda',
            'Jl. Cipedes', 'Jl. Setiabudi', 'Jl. Dago',
        ];

        $kecamatanList = [
            'Kecamatan Cibeunying', 'Kecamatan Regol', 'Kecamatan Cicendo',
            'Kecamatan Bojongloa', 'Kecamatan Coblong', 'Kecamatan Antapani',
            'Kecamatan Rancasari', 'Kecamatan Buahbatu', 'Kecamatan Margahayu',
            'Kecamatan Arcamanik', 'Kecamatan Sukajadi', 'Kecamatan Cisarua',
            'Kecamatan Panyileukan', 'Kecamatan Ujung Berung', 'Kecamatan Cibiru',
            'Kecamatan Gedebage', 'Kecamatan Cinambo', 'Kecamatan Lengkong',
            'Kecamatan Batununggal', 'Kecamatan Kiaracondong',
        ];

        $kelurahanList = [
            'Kelurahan Sukajadi', 'Kelurahan Cihapit', 'Kelurahan Babakan',
            'Kelurahan Kebonwaru', 'Kelurahan Padasuka', 'Kelurahan Cisarua',
            'Kelurahan Cibaduyut', 'Kelurahan Cijaura', 'Kelurahan Margahayu',
            'Kelurahan Cimahi', 'Kelurahan Pasirluyu', 'Kelurahan Pasirjati',
            'Kelurahan Pasirbiru', 'Kelurahan Cigadung', 'Kelurahan Ciumbuleuit',
            'Kelurahan Ledeng', 'Kelurahan Cipedes', 'Kelurahan Pasirkaliki',
            'Kelurahan Tamansari', 'Kelurahan Balonggede',
        ];

        $records = [];

        foreach ($vendorIds as $i => $vendorId) {
            $provinsi = $provinsiList[$i % count($provinsiList)];
            $kotaList = $kotaMap[$provinsi];
            $kota = $kotaList[$i % count($kotaList)];

            $records[] = [
                'id' => (string) Str::uuid(),
                'addressable_id' => $vendorId,
                'addressable_type' => Vendor::class,
                'label' => $labelList[0],
                'alamat' => $jalanList[$i % count($jalanList)] . ' No. ' . rand(1, 200) . ', RT ' . sprintf('%02d', rand(1, 20)) . '/RW ' . sprintf('%02d', rand(1, 10)),
                'provinsi' => $provinsi,
                'kota' => $kota,
                'kecamatan' => $kecamatanList[$i % count($kecamatanList)],
                'kelurahan' => $kelurahanList[$i % count($kelurahanList)],
                'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                'utama' => true,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($i % 3 === 0) {
                $records[] = [
                    'id' => (string) Str::uuid(),
                    'addressable_id' => $vendorId,
                    'addressable_type' => Vendor::class,
                    'label' => $labelList[1],
                    'alamat' => 'Jl. Pergudangan No. ' . rand(1, 50) . ', Kawasan Industri ' . $kota,
                    'provinsi' => $provinsi,
                    'kota' => $kota,
                    'kecamatan' => $kecamatanList[($i + 5) % count($kecamatanList)],
                    'kelurahan' => $kelurahanList[($i + 7) % count($kelurahanList)],
                    'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                    'utama' => false,
                    'aktif' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($i % 5 === 0) {
                $records[] = [
                    'id' => (string) Str::uuid(),
                    'addressable_id' => $vendorId,
                    'addressable_type' => Vendor::class,
                    'label' => $labelList[2],
                    'alamat' => 'Jl. Industri Raya Blok A' . rand(1, 20) . ' No. ' . rand(1, 30) . ', ' . $kota,
                    'provinsi' => $provinsi,
                    'kota' => $kota,
                    'kecamatan' => $kecamatanList[($i + 3) % count($kecamatanList)],
                    'kelurahan' => $kelurahanList[($i + 5) % count($kelurahanList)],
                    'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                    'utama' => false,
                    'aktif' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        Address::insert($records);
    }

    private function seedContacts(array $vendorIds, $now): void
    {
        $namaDepan = [
            'Ahmad', 'Budi', 'Chandra', 'Dewi', 'Eko', 'Fitri', 'Gunawan',
            'Hendra', 'Indah', 'Joko', 'Kurniawan', 'Lukman', 'Mega', 'Nugroho',
            'Oki', 'Pramudya', 'Ratna', 'Slamet', 'Taufik', 'Utami',
            'Vina', 'Wawan', 'Yoga', 'Zainal', 'Agus', 'Bambang', 'Cahyono',
            'Deni', 'Edi', 'Fajar', 'Haryono', 'Irfan', 'Karim', 'Lina',
            'Mulyono', 'Nur', 'Purnomo', 'Rina', 'Sutrisno', 'Triyono',
            'Wahyu', 'Yulianto', 'Asep', 'Dadang', 'Entis', 'Firman',
            'Gilang', 'Herman', 'Ilham', 'Juned',
        ];

        $namaBelakang = [
            'Prasetyo', 'Wijaya', 'Hartono', 'Saputra', 'Maulana', 'Hidayat',
            'Susilo', 'Effendi', 'Wibisono', 'Setiawan', 'Hermawan', 'Kurniawan',
            'Nugraha', 'Pratama', 'Santoso', 'Gunawan', 'Putra', 'Rahardjo',
            'Suryadi', 'Ramadhan', 'Firmansyah', 'Pamungkas', 'Wicaksono',
            'Handayani', 'Marlina', 'Sari', 'Wati', 'Utami', 'Pertiwi',
            'Lestari', 'Kusuma', 'Cahyani', 'Rahmawati', 'Anggraini',
        ];

        $jabatanList = [
            'Direktur Utama', 'Direktur', 'Wakil Direktur',
            'General Manager', 'Manajer Penjualan', 'Manajer Pembelian',
            'Manajer Keuangan', 'Manajer Operasional', 'Manajer Gudang',
            'Manajer Produksi', 'Manajer Teknik', 'Manajer K3',
            'Supervisor Penjualan', 'Supervisor Gudang', 'Supervisor Produksi',
            'Sales Executive', 'Sales Marketing', 'Account Executive',
            'Staff Pembelian', 'Staff Gudang', 'Staff Produksi',
            'Staff Administrasi', 'Staff Keuangan', 'Staff HRD',
            'Teknisi', 'Kepala Teknisi', 'Kepala Gudang',
            'Admin Penjualan', 'Customer Service', 'Kepala Cabang',
        ];

        $records = [];

        foreach ($vendorIds as $i => $vendorId) {
            $depan = $namaDepan[$i % count($namaDepan)];
            $belakang = $namaBelakang[$i % count($namaBelakang)];
            $nama = $depan . ' ' . $belakang;

            $records[] = [
                'id' => (string) Str::uuid(),
                'contactable_id' => $vendorId,
                'contactable_type' => Vendor::class,
                'nama' => $nama,
                'jabatan' => $jabatanList[$i % count($jabatanList)],
                'telepon' => sprintf('0%d%d', rand(21, 31), rand(100000, 9999999)),
                'hp' => sprintf('08%d%d', rand(10, 99), rand(10000000, 99999999)),
                'email' => strtolower($depan . '.' . $belakang . '@' . ['gmail.com', 'yahoo.com', 'outlook.com', 'company.co.id'][$i % 4]),
                'utama' => true,
                'aktif' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if ($i % 4 === 0) {
                $depan2 = $namaDepan[($i + 17) % count($namaDepan)];
                $belakang2 = $namaBelakang[($i + 9) % count($namaBelakang)];

                $records[] = [
                    'id' => (string) Str::uuid(),
                    'contactable_id' => $vendorId,
                    'contactable_type' => Vendor::class,
                    'nama' => $depan2 . ' ' . $belakang2,
                    'jabatan' => $jabatanList[($i + 5) % count($jabatanList)],
                    'telepon' => sprintf('0%d%d', rand(21, 31), rand(100000, 9999999)),
                    'hp' => sprintf('08%d%d', rand(10, 99), rand(10000000, 99999999)),
                    'email' => strtolower($depan2 . '.' . $belakang2 . '@' . ['gmail.com', 'yahoo.com', 'outlook.com', 'company.co.id'][($i + 1) % 4]),
                    'utama' => false,
                    'aktif' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        Contact::insert($records);
    }
}
