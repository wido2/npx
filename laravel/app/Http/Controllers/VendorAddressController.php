<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorAddressController extends Controller
{
    public function index(Vendor $vendor): JsonResponse
    {
        return response()->json($vendor->addresses()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request, Vendor $vendor): JsonResponse
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

        $address = $vendor->addresses()->create($validated);

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

        return response()->json(['message' => 'Address deleted']);
    }
}
