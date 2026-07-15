<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\MutasiStok;
use App\Services\StokService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        protected StokService $stokService,
    ) {}

    public function mutasi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barang_id' => 'nullable|exists:barangs,id',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = MutasiStok::with(['barang:id,kode,nama', 'dibuatOleh:id,name']);

        if (!empty($validated['barang_id'])) {
            $query->where('barang_id', $validated['barang_id']);
        }

        $query->orderBy('created_at', 'desc');

        return response()->json($query->paginate($validated['per_page'] ?? 50));
    }

    public function stokMinimum(): JsonResponse
    {
        $barang = Barang::where('aktif', true)
            ->whereColumn('stok', '<=', 'stok_minimum')
            ->get(['id', 'kode', 'nama', 'stok', 'stok_minimum']);

        return response()->json($barang);
    }

    public function opname(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barangs,id',
            'stok_baru' => 'required|integer|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $barang = Barang::findOrFail($validated['barang_id']);

        $mutasi = $this->stokService->opname(
            $barang,
            $validated['stok_baru'],
            $validated['keterangan'] ?? null,
            $request->user()->id
        );

        return response()->json($mutasi->load('barang:id,kode,nama'));
    }

    public function laporanStok(Request $request): JsonResponse
    {
        $search = $request->input('search', '');
        $kategoriId = $request->input('kategori_id', '');

        $query = Barang::with(['kategori:id,nama', 'unit:id,nama'])
            ->where('aktif', true);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhere('nama', 'ilike', "%{$search}%");
            });
        }

        if ($kategoriId !== '') {
            $query->where('kategori_id', $kategoriId);
        }

        $query->orderBy('nama');

        $barang = $query->get();
        $total = $barang->count();
        $nilaiStok = $barang->sum(fn($b) => $b->stok * $b->harga_beli);

        return response()->json([
            'data' => $barang,
            'total_item' => $total,
            'total_stok' => $barang->sum('stok'),
            'nilai_stok' => $nilaiStok,
        ]);
    }
}
