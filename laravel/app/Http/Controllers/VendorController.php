<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = Vendor::query();

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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:vendors',
            'nama' => 'required|string|max:255',
            'npwp' => 'nullable|string|max:20',
            'tipe' => 'required|in:supplier,konsumen,keduanya',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $vendor = Vendor::create($validated);

        return response()->json($vendor, 201);
    }

    public function show(Vendor $vendor): JsonResponse
    {
        return response()->json($vendor);
    }

    public function update(Request $request, Vendor $vendor): JsonResponse
    {
        $validated = $request->validate([
            'kode' => "required|string|max:50|unique:vendors,kode,{$vendor->id}",
            'nama' => 'required|string|max:255',
            'npwp' => 'nullable|string|max:20',
            'tipe' => 'required|in:supplier,konsumen,keduanya',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $vendor->update($validated);

        return response()->json($vendor);
    }

    public function destroy(Vendor $vendor): JsonResponse
    {
        $vendor->delete();

        return response()->json(['message' => 'Vendor deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:vendors,id',
        ]);

        Vendor::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' vendor(s) deleted']);
    }
}
