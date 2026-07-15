<?php

namespace App\Http\Controllers;

use App\Models\JenisPajak;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JenisPajakController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = JenisPajak::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%");
            });
        }

        $sortField = $request->string('sort_field', 'nama');
        $sortDir = $request->string('sort_dir', 'asc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'persentase' => 'required|numeric|min:0|max:100',
            'deskripsi' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $pajak = JenisPajak::create($validated);

        return response()->json($pajak, 201);
    }

    public function show(JenisPajak $jenisPajak): JsonResponse
    {
        return response()->json($jenisPajak);
    }

    public function update(Request $request, JenisPajak $jenisPajak): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'persentase' => 'required|numeric|min:0|max:100',
            'deskripsi' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $jenisPajak->update($validated);

        return response()->json($jenisPajak);
    }

    public function destroy(JenisPajak $jenisPajak): JsonResponse
    {
        $jenisPajak->delete();

        return response()->json(['message' => 'Jenis pajak deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:jenis_pajak,id',
        ]);

        JenisPajak::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' jenis pajak(s) deleted']);
    }
}
