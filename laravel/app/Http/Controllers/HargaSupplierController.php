<?php

namespace App\Http\Controllers;

use App\Models\HargaSupplier;
use App\Models\RiwayatHargaSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HargaSupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HargaSupplier::with(['barang:id,kode,nama', 'vendor:id,kode,nama']);

        if ($request->filled('barang_id')) {
            $query->where('barang_id', $request->input('barang_id'));
        }

        if ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->input('vendor_id'));
        }

        $perPage = $request->integer('per_page', 50);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barangs,id',
            'vendor_id' => 'required|exists:vendors,id',
            'harga_beli' => 'required|numeric|min:0',
            'mata_uang' => 'nullable|string|max:3',
            'keterangan' => 'nullable|string',
        ]);

        $existing = HargaSupplier::where('barang_id', $validated['barang_id'])
            ->where('vendor_id', $validated['vendor_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Harga untuk supplier ini sudah ada'], 409);
        }

        $hargaSupplier = HargaSupplier::create($validated);

        RiwayatHargaSupplier::create([
            'harga_supplier_id' => $hargaSupplier->id,
            'barang_id' => $validated['barang_id'],
            'vendor_id' => $validated['vendor_id'],
            'harga_beli_lama' => 0,
            'harga_beli_baru' => $validated['harga_beli'],
            'referensi_type' => HargaSupplier::class,
            'referensi_id' => $hargaSupplier->id,
            'keterangan' => 'Harga awal',
            'created_by' => $request->user()?->id,
            'created_at' => now(),
        ]);

        return response()->json(
            $hargaSupplier->load(['barang:id,kode,nama', 'vendor:id,kode,nama']),
            201
        );
    }

    public function show(HargaSupplier $hargaSupplier): JsonResponse
    {
        return response()->json($hargaSupplier->load(['barang:id,kode,nama', 'vendor:id,kode,nama']));
    }

    public function update(Request $request, HargaSupplier $hargaSupplier): JsonResponse
    {
        $validated = $request->validate([
            'harga_beli' => 'required|numeric|min:0',
            'mata_uang' => 'nullable|string|max:3',
            'keterangan' => 'nullable|string',
        ]);

        $hargaLama = (float) $hargaSupplier->harga_beli;

        $hargaSupplier->update($validated);

        if ($hargaLama !== (float) $validated['harga_beli']) {
            RiwayatHargaSupplier::create([
                'harga_supplier_id' => $hargaSupplier->id,
                'barang_id' => $hargaSupplier->barang_id,
                'vendor_id' => $hargaSupplier->vendor_id,
                'harga_beli_lama' => $hargaLama,
                'harga_beli_baru' => $validated['harga_beli'],
                'referensi_type' => HargaSupplier::class,
                'referensi_id' => $hargaSupplier->id,
                'keterangan' => $validated['keterangan'] ?? 'Update manual',
                'created_by' => $request->user()?->id,
                'created_at' => now(),
            ]);
        }

        return response()->json($hargaSupplier->load(['barang:id,kode,nama', 'vendor:id,kode,nama']));
    }

    public function history(HargaSupplier $hargaSupplier, Request $request): JsonResponse
    {
        return response()->json(
            $hargaSupplier->riwayatHargaSuppliers()
                ->with('dibuatOleh:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate($request->integer('per_page', 20))
        );
    }

    public function destroy(HargaSupplier $hargaSupplier): JsonResponse
    {
        $hargaSupplier->delete();

        return response()->json(['message' => 'Harga supplier deleted']);
    }
}
