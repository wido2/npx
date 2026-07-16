<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KaryawanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search', '');
        $aktif = $request->input('aktif', '');

        $query = Karyawan::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                    ->orWhere('nip', 'ilike', "%{$search}%")
                    ->orWhere('jabatan', 'ilike', "%{$search}%");
            });
        }

        if ($aktif !== '') {
            $query->where('aktif', filter_var($aktif, FILTER_VALIDATE_BOOLEAN));
        }

        $sortField = $request->input('sort_field', 'nama');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nip' => 'nullable|string|max:50',
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:20',
            'aktif' => 'boolean',
        ]);

        $karyawan = Karyawan::create($validated);

        return response()->json($karyawan, 201);
    }

    public function show(Karyawan $karyawan): JsonResponse
    {
        return response()->json($karyawan);
    }

    public function update(Request $request, Karyawan $karyawan): JsonResponse
    {
        $validated = $request->validate([
            'nip' => 'nullable|string|max:50',
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:100',
            'telepon' => 'nullable|string|max:20',
            'aktif' => 'boolean',
        ]);

        $karyawan->update($validated);

        return response()->json($karyawan);
    }

    public function destroy(Karyawan $karyawan): JsonResponse
    {
        $karyawan->delete();
        return response()->json(['message' => 'Karyawan deleted']);
    }
}
