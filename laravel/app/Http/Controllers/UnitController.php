<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Unit::where('aktif', true)->orderBy('nama')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255|unique:units,nama',
            'singkatan' => 'required|string|max:10|unique:units,singkatan',
        ]);

        $unit = Unit::create($validated);

        return response()->json($unit, 201);
    }
}
