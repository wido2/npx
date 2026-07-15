<?php

namespace App\Http\Controllers;

use App\Models\KategoriBarang;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KategoriBarangController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(KategoriBarang::where('aktif', true)->orderBy('nama')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:kategori_barang,nama',
        ]);

        $kategori = KategoriBarang::create($validated);

        return response()->json($kategori, 201);
    }
}
