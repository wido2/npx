<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Services\HargaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    public function __construct(
        protected HargaService $hargaService,
    ) {}
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = Barang::with(['kategori', 'unit']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhere('nama', 'ilike', "%{$search}%");
            });
        }

        $sortField = $request->string('sort_field', 'created_at');
        $sortDir = $request->string('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($perPage));
    }

    public function show(Barang $barang): JsonResponse
    {
        return response()->json($barang->load(['kategori', 'unit']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:barangs',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori_id' => 'required|exists:kategori_barang,id',
            'unit_id' => 'required|exists:units,id',
            'harga_beli' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
            'stok_minimum' => 'nullable|integer|min:0',
            'gambar' => 'nullable|string|max:255',
            'aktif' => 'boolean',
        ]);

        $barang = Barang::create($validated);

        return response()->json($barang->load(['kategori', 'unit']), 201);
    }

    public function update(Request $request, Barang $barang): JsonResponse
    {
        $validated = $request->validate([
            'kode' => "required|string|max:50|unique:barangs,kode,{$barang->id}",
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'kategori_id' => 'required|exists:kategori_barang,id',
            'unit_id' => 'required|exists:units,id',
            'harga_beli' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
            'stok_minimum' => 'nullable|integer|min:0',
            'gambar' => 'nullable|string|max:255',
            'aktif' => 'boolean',
        ]);

        $hargaBaru = (float) $validated['harga_beli'];

        if ((float) $barang->harga_beli !== $hargaBaru) {
            $this->hargaService->rekam(
                $barang,
                $hargaBaru,
                Barang::class,
                $barang->id,
                'Update manual',
                $request->user()->id,
            );
        }

        $barang->update($validated);

        return response()->json($barang->fresh()->load(['kategori', 'unit']));
    }

    public function destroy(Barang $barang): JsonResponse
    {
        $barang->delete();

        return response()->json(['message' => 'Barang deleted']);
    }

    public function hargaHistory(Barang $barang, Request $request): JsonResponse
    {
        return response()->json(
            $barang->riwayatHargas()
                ->with('dibuatOleh:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate($request->integer('per_page', 10))
        );
    }

    public function bulkUpdateHarga(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:barangs,id',
            'items.*.harga_beli' => 'required|numeric|min:0',
        ]);

        $updated = 0;
        $errors = [];

        foreach ($validated['items'] as $item) {
            try {
                $barang = Barang::findOrFail($item['id']);
                $hargaBaru = (float) $item['harga_beli'];

                if ((float) $barang->harga_beli !== $hargaBaru) {
                    $this->hargaService->rekam(
                        $barang,
                        $hargaBaru,
                        Barang::class,
                        $barang->id,
                        'Update harga massal',
                        $request->user()->id,
                    );
                }

                $barang->update(['harga_beli' => $hargaBaru]);
                $updated++;
            } catch (\Exception $e) {
                $errors[] = ['id' => $item['id'], 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => "{$updated} barang berhasil diupdate",
            'updated' => $updated,
            'errors' => $errors,
        ]);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:barangs,id',
        ]);

        Barang::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' barang(s) deleted']);
    }
}
