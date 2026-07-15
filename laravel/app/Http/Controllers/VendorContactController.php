<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorContactController extends Controller
{
    public function index(Vendor $vendor): JsonResponse
    {
        return response()->json($vendor->contacts()->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request, Vendor $vendor): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'telepon' => 'nullable|string|max:20',
            'hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'utama' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $contact = $vendor->contacts()->create($validated);

        return response()->json($contact, 201);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'telepon' => 'nullable|string|max:20',
            'hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'utama' => 'boolean',
            'aktif' => 'boolean',
        ]);

        $contact->update($validated);

        return response()->json($contact);
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json(['message' => 'Contact deleted']);
    }
}
