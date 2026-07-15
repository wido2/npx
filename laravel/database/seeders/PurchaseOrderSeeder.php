<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Barang;
use App\Models\Client;
use App\Models\Contact;
use App\Models\JenisPajak;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrderReceipt;
use App\Models\PurchaseOrderReceiptItem;
use App\Models\PurchaseOrderRevision;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $user = User::firstOrFail();
        $vendorIds = Vendor::pluck('id')->toArray();
        $barangIds = Barang::pluck('id')->toArray();
        $unitIds = Unit::pluck('id')->toArray();
        $pajakIds = JenisPajak::pluck('id')->toArray();

        // ─── Clients ───
        $clientData = [
            ['kode' => 'CL-001', 'nama' => 'PT. Wijaya Karya Beton', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-002', 'nama' => 'PT. Pembangunan Perumahan', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-003', 'nama' => 'PT. Adhi Karya', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-004', 'nama' => 'PT. Waskita Karya', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-005', 'nama' => 'PT. Hutama Karya', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-006', 'nama' => 'CV. Bangun Persada', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-007', 'nama' => 'PT. Jaya Konstruksi', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-008', 'nama' => 'CV. Mitra Engineering', 'tipe' => 'perusahaan'],
            ['kode' => 'CL-009', 'nama' => 'UD. Karya Teknik', 'tipe' => 'perorangan'],
            ['kode' => 'CL-010', 'nama' => 'PT. Bumi Karya Pratama', 'tipe' => 'perusahaan'],
        ];

        $clientIds = [];
        foreach ($clientData as $c) {
            $id = (string) Str::uuid();
            $clientIds[] = $id;
            Client::create(array_merge($c, [
                'id' => $id,
                'npwp' => sprintf('%02d.%03d.%03d.%d-%03d.%03d', rand(1, 99), rand(1, 999), rand(1, 999), rand(1, 9), rand(1, 999), rand(1, 999)),
                'email' => strtolower(str_replace([' ', '.', ','], '', explode(' ', $c['nama'])[1] ?? 'client')) . '@' . strtolower(str_replace(' ', '', explode('.', explode(' ', $c['nama'])[0] ?? 'pt')[0])) . '.co.id',
                'telepon' => sprintf('0%d-%d', rand(21, 31), rand(100000, 9999999)),
                'website' => 'www.' . strtolower(str_replace([' ', '.'], '', $c['nama'])) . '.co.id',
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }

        // Client addresses & contacts
        $kotaList = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta'];
        $provinsiMap = [
            'Jakarta' => 'DKI Jakarta', 'Bandung' => 'Jawa Barat',
            'Surabaya' => 'Jawa Timur', 'Semarang' => 'Jawa Tengah',
            'Yogyakarta' => 'DI Yogyakarta',
        ];
        $alamatList = [
            'Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto',
            'Jl. Ahmad Yani', 'Jl. Diponegoro',
        ];
        $namaKontak = [
            'Rudi Hartono', 'Sinta Dewi', 'Agus Prasetyo', 'Dian Permata',
            'Fajar Nugroho', 'Rina Marlina', 'Hendra Gunawan', 'Mega Sari',
            'Bambang Supriyanto', 'Dewi Sartika',
        ];

        foreach ($clientIds as $i => $cid) {
            $kota = $kotaList[$i % count($kotaList)];
            Address::create([
                'id' => (string) Str::uuid(),
                'addressable_id' => $cid,
                'addressable_type' => Client::class,
                'label' => 'Kantor',
                'alamat' => $alamatList[$i % count($alamatList)] . ' No. ' . rand(1, 200),
                'provinsi' => $provinsiMap[$kota],
                'kota' => $kota,
                'kecamatan' => 'Kecamatan ' . ['Menteng', 'Cicendo', 'Genteng', 'Gajahmungkur', 'Gondokusuman'][$i % 5],
                'kelurahan' => 'Kelurahan ' . ['Gondangdia', 'Babakan', 'Kebonagung', 'Kembangsari', 'Terban'][$i % 5],
                'kode_pos' => sprintf('%05d', rand(10000, 99999)),
                'utama' => true,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            Contact::create([
                'id' => (string) Str::uuid(),
                'contactable_id' => $cid,
                'contactable_type' => Client::class,
                'nama' => $namaKontak[$i % count($namaKontak)],
                'jabatan' => ['Direktur', 'Manajer Proyek', 'Procurement', 'Keuangan', 'Teknis'][$i % 5],
                'telepon' => sprintf('0%d-%d', rand(21, 31), rand(100000, 9999999)),
                'hp' => sprintf('08%d%d', rand(10, 99), rand(10000000, 99999999)),
                'email' => 'kontak' . ($i + 1) . '@client' . ($i + 1) . '.co.id',
                'utama' => true,
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ─── Projects ───
        $projectNames = [
            'Pembangunan Gedung Dinas Pekerjaan Umum',
            'Proyek Jalan Tol Trans Sumatera',
            'Pembangunan Bendungan Sukamahi',
            'Proyek Revitalisasi Pelabuhan Tanjung Priok',
            'Pembangunan Flyover Simpang Lima',
            'Proyek Pembangunan Rumah Sakit Daerah',
            'Pembangunan Jembatan Gantung Situbondo',
            'Proyek Peningkatan Jalan Provinsi Jawa Barat',
            'Pembangunan Gedung Serbaguna Kecamatan',
            'Proyek Irigasi Pertanian Daerah Aliran Sungai',
            'Pembangunan Terminal Bandar Udara',
            'Proyek Rel Kereta Api Ganda',
            'Pembangunan Pasar Tradisional Modern',
            'Proyek Pengolahan Air Limbah Kawasan Industri',
            'Pembangunan Jalan Akses Pelabuhan',
        ];

        $projectIds = [];
        foreach ($projectNames as $i => $pn) {
            $id = (string) Str::uuid();
            $projectIds[] = $id;
            $tglMulai = now()->subMonths(rand(1, 6));
            Project::create([
                'id' => $id,
                'kode' => 'PRJ-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'nama' => $pn,
                'client_id' => $clientIds[$i % count($clientIds)],
                'unit_id' => $unitIds[$i % count($unitIds)],
                'deskripsi' => 'Proyek ' . $pn . ' dengan nilai kontrak signifikan dalam rangka pembangunan infrastruktur nasional',
                'nilai_kontrak' => rand(50, 500) * 1000000,
                'tanggal_mulai' => $tglMulai,
                'tanggal_selesai' => $tglMulai->copy()->addMonths(rand(3, 12)),
                'status' => ['aktif', 'aktif', 'aktif', 'selesai', 'ditunda'][$i % 5],
                'aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ─── Purchase Orders ───
        $barangData = [];
        foreach (Barang::select('id', 'harga_beli')->cursor() as $b) {
            $barangData[] = ['id' => $b->id, 'harga' => $b->harga_beli];
        }

        $statuses = ['draft', 'draft', 'dikirim', 'dikirim', 'disetujui', 'disetujui', 'diterima', 'diterima', 'diterima_sebagian', 'dibatalkan'];

        $poIds = [];
        for ($i = 0; $i < 20; $i++) {
            $id = (string) Str::uuid();
            $poIds[] = $id;
            $status = $statuses[$i % count($statuses)];
            $tanggalPo = now()->subDays(rand(1, 60));

            $po = PurchaseOrder::create([
                'id' => $id,
                'kode' => in_array($status, ['draft']) ? null : sprintf('PO-%s-%s-%04d', now()->format('Y'), ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][now()->format('n') - 1], $i + 1),
                'vendor_id' => $vendorIds[$i % count($vendorIds)],
                'client_id' => $clientIds[$i % count($clientIds)],
                'project_id' => $projectIds[$i % count($projectIds)],
                'tanggal_po' => $tanggalPo,
                'tanggal_kirim_expected' => $tanggalPo->copy()->addDays(rand(7, 30)),
                'status' => $status,
                'subtotal' => 0,
                'diskon' => $i % 5 === 0 ? rand(50000, 200000) : 0,
                'total' => 0,
                'catatan' => $i % 4 === 0 ? 'PO untuk kebutuhan proyek bulan ini' : null,
                'syarat_pembayaran' => [null, '30 hari', '60 hari', 'COD'][$i % 4],
                'alamat_kirim' => 'Jl. Pengiriman No. ' . rand(1, 100) . ', Jakarta',
                'dibuat_oleh' => $user->id,
                'disetujui_oleh' => in_array($status, ['disetujui', 'diterima', 'diterima_sebagian']) ? $user->id : null,
                'diterima_oleh' => in_array($status, ['diterima', 'diterima_sebagian']) ? $user->id : null,
                'tanggal_disetujui' => in_array($status, ['disetujui', 'diterima', 'diterima_sebagian']) ? $tanggalPo->copy()->addDays(2) : null,
                'tanggal_diterima' => in_array($status, ['diterima', 'diterima_sebagian']) ? $tanggalPo->copy()->addDays(rand(10, 25)) : null,
                'created_at' => $tanggalPo,
                'updated_at' => $now,
            ]);

            // Items (2-4 items per PO)
            $totalItemSubtotal = 0;
            $numItems = rand(2, 4);
            for ($j = 0; $j < $numItems; $j++) {
                $barangIdx = ($i * 4 + $j) % count($barangData);
                $barang = $barangData[$barangIdx];
                $jumlah = rand(1, 10);
                $harga = $barang['harga'] + rand(-1000, 1000);
                $diskonItem = $j === 0 && $i % 3 === 0 ? rand(1000, 5000) : 0;
                $subtotal = ($jumlah * $harga) - $diskonItem;
                $totalItemSubtotal += $subtotal;

                $pajak = null;
                $nilaiPajak = 0;
                $totalSetelahPajak = $subtotal;
                if ($j === 0 && count($pajakIds) > 0) {
                    $pajak = $pajakIds[$i % count($pajakIds)];
                    $persen = $i % 2 === 0 ? 11 : 2;
                    $nilaiPajak = round($subtotal * $persen / 100);
                    $totalSetelahPajak = $subtotal + $nilaiPajak;
                }

                PurchaseOrderItem::create([
                    'id' => (string) Str::uuid(),
                    'purchase_order_id' => $id,
                    'barang_id' => $barang['id'],
                    'jumlah' => $jumlah,
                    'harga_satuan' => $harga,
                    'diskon' => $diskonItem,
                    'subtotal' => $subtotal,
                    'jenis_pajak_id' => $pajak,
                    'nilai_pajak' => $nilaiPajak,
                    'total_setelah_pajak' => $totalSetelahPajak,
                    'keterangan' => $j % 5 === 0 ? 'Barang pengganti proyek' : null,
                    'created_at' => $tanggalPo,
                    'updated_at' => $now,
                ]);
            }

            $total = $totalItemSubtotal - ($po->diskon ?? 0);
            $po->update([
                'subtotal' => $totalItemSubtotal,
                'total' => max($total, 0),
            ]);

            // ─── Revisions ───
            if (in_array($status, ['disetujui', 'diterima', 'diterima_sebagian', 'dibatalkan'])) {
                PurchaseOrderRevision::create([
                    'id' => (string) Str::uuid(),
                    'purchase_order_id' => $id,
                    'version' => 1,
                    'data' => [
                        'header' => $po->fresh()->toArray(),
                        'items' => $po->items->toArray(),
                    ],
                    'changed_fields' => ['status', 'disetujui_oleh', 'tanggal_disetujui'],
                    'changed_by' => $user->id,
                    'created_at' => $po->tanggal_disetujui ?? $now,
                    'updated_at' => $po->tanggal_disetujui ?? $now,
                ]);
            }

            // ─── Receipts ───
            if (in_array($status, ['diterima', 'diterima_sebagian'])) {
                $receipt = PurchaseOrderReceipt::create([
                    'id' => (string) Str::uuid(),
                    'purchase_order_id' => $id,
                    'nomor' => sprintf('TRM-%s-%04d', now()->format('Ymd'), $i + 1),
                    'tanggal_terima' => $po->tanggal_diterima ?? $tanggalPo->copy()->addDays(15),
                    'catatan' => $i % 3 === 0 ? 'Barang diterima dalam kondisi baik' : null,
                    'diterima_oleh' => $user->id,
                    'created_at' => $po->tanggal_diterima ?? $now,
                    'updated_at' => $po->tanggal_diterima ?? $now,
                ]);

                foreach ($po->items as $poItem) {
                    $acceptAll = $status === 'diterima';
                    $jmlTerima = $acceptAll ? $poItem->jumlah : rand(1, $poItem->jumlah);

                    PurchaseOrderReceiptItem::create([
                        'id' => (string) Str::uuid(),
                        'purchase_order_receipt_id' => $receipt->id,
                        'purchase_order_item_id' => $poItem->id,
                        'barang_id' => $poItem->barang_id,
                        'jumlah_dipesan' => $poItem->jumlah,
                        'jumlah_diterima' => $jmlTerima,
                        'keterangan' => $jmlTerima < $poItem->jumlah ? 'Kurang ' . ($poItem->jumlah - $jmlTerima) . ' pcs' : null,
                        'created_at' => $receipt->created_at,
                        'updated_at' => $receipt->created_at,
                    ]);

                    // Update stok
                    $poItem->barang()->increment('stok', $jmlTerima);
                }
            }
        }
    }
}
