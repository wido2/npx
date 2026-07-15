<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlamatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search', '');

        $query = Address::with('addressable');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'ilike', "%{$search}%")
                    ->orWhere('alamat', 'ilike', "%{$search}%")
                    ->orWhereHas('addressable', fn($q) => $q->where('nama', 'ilike', "%{$search}%"));
            });
        }

        $sortField = $request->string('sort_field', 'created_at');
        $sortDir = $request->string('sort_dir', 'desc');

        $allowedSortFields = ['label', 'alamat', 'provinsi', 'kota', 'kecamatan', 'kelurahan', 'kode_pos', 'utama', 'aktif', 'created_at', 'updated_at'];
        if (!in_array((string) $sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $query->orderBy((string) $sortField, $sortDir === 'asc' ? 'asc' : 'desc');

        return response()->json($query->paginate($perPage));
    }

    public function show(Address $address): JsonResponse
    {
        return response()->json($address);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'alamat' => 'required|string',
            'provinsi' => 'required|string|max:255',
            'kota' => 'required|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kelurahan' => 'nullable|string|max:255',
            'kode_pos' => 'nullable|string|max:10',
            'utama' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $validated['addressable_type'] = 'App\\Models\\Vendor';

        $address = Address::create($validated);

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'alamat' => 'required|string',
            'provinsi' => 'required|string|max:255',
            'kota' => 'required|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kelurahan' => 'nullable|string|max:255',
            'kode_pos' => 'nullable|string|max:10',
            'utama' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Address $address): JsonResponse
    {
        $address->delete();

        return response()->json(['message' => 'Alamat deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:addresses,id',
        ]);

        Address::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' alamat(s) deleted']);
    }
}
