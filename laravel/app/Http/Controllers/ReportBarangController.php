<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportBarangController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $totalBarang = Barang::count();
        $totalAktif = Barang::where('aktif', true)->count();
        $totalNonAktif = Barang::where('aktif', false)->count();
        $totalKategori = KategoriBarang::count();
        $totalNilaiStok = Barang::select(DB::raw('COALESCE(sum(stok * harga_beli), 0) as total'))->value('total');
        $totalStok = Barang::sum('stok');
        $stokKosong = Barang::where('stok', 0)->count();
        $stokMinimum = Barang::whereColumn('stok', '<=', 'stok_minimum')->where('stok', '>', 0)->count();

        return response()->json([
            'total_barang' => (int) $totalBarang,
            'total_aktif' => (int) $totalAktif,
            'total_non_aktif' => (int) $totalNonAktif,
            'total_kategori' => (int) $totalKategori,
            'total_nilai_stok' => (float) $totalNilaiStok,
            'total_stok' => (float) $totalStok,
            'stok_kosong' => (int) $stokKosong,
            'stok_minimum' => (int) $stokMinimum,
        ]);
    }

    public function perKategori(Request $request): JsonResponse
    {
        $data = KategoriBarang::withCount('barangs')
            ->withSum(['barangs as total_stok' => fn($q) => $q], 'stok')
            ->get()
            ->map(fn($k) => [
                'kategori_id' => $k->id,
                'kategori_nama' => $k->nama,
                'total_barang' => (int) $k->barangs_count,
                'total_stok' => (float) ($k->total_stok ?? 0),
            ]);

        return response()->json($data);
    }

    public function perStatus(Request $request): JsonResponse
    {
        $data = Barang::select('aktif', DB::raw('count(*) as total'))
            ->groupBy('aktif')
            ->get()
            ->map(fn($item) => [
                'status' => $item->aktif ? 'aktif' : 'non_aktif',
                'total' => (int) $item->total,
            ]);

        return response()->json($data);
    }

    public function stokTerendah(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 10);

        $data = Barang::where('aktif', true)
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->orderBy('stok')
            ->limit($limit)
            ->get()
            ->load('kategori:id,nama', 'unit:id,singkatan');

        return response()->json($data->map(fn($item) => [
            'barang_id' => $item->id,
            'barang_kode' => $item->kode,
            'barang_nama' => $item->nama,
            'stok' => (float) $item->stok,
            'stok_minimum' => (float) $item->stok_minimum,
            'unit' => $item->unit?->singkatan ?? '',
            'kategori_nama' => $item->kategori?->nama ?? '',
        ]));
    }

    public function topItemsByNilai(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 10);

        $data = Barang::where('aktif', true)
            ->select('id', 'kode', 'nama', 'stok', 'harga_beli', 'unit_id')
            ->selectRaw('(stok * harga_beli) as nilai_stok')
            ->orderByDesc('nilai_stok')
            ->limit($limit)
            ->get()
            ->load('unit:id,singkatan');

        return response()->json($data->map(fn($item) => [
            'barang_id' => $item->id,
            'barang_kode' => $item->kode,
            'barang_nama' => $item->nama,
            'stok' => (float) $item->stok,
            'harga_beli' => (float) ($item->harga_beli ?? 0),
            'nilai_stok' => (float) ($item->nilai_stok ?? 0),
            'unit' => $item->unit?->singkatan ?? '',
        ]));
    }
}
