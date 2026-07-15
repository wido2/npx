<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KontakController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search', '');

        $query = Contact::with('contactable');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                    ->orWhere('jabatan', 'ilike', "%{$search}%")
                    ->orWhere('telepon', 'ilike', "%{$search}%")
                    ->orWhere('hp', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhereHas('contactable', fn($q) => $q->where('nama', 'ilike', "%{$search}%"));
            });
        }

        $sortField = $request->string('sort_field', 'created_at');
        $sortDir = $request->string('sort_dir', 'desc');

        $allowedSortFields = ['nama', 'jabatan', 'telepon', 'hp', 'email', 'utama', 'aktif', 'created_at', 'updated_at'];
        if (!in_array((string) $sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        $query->orderBy((string) $sortField, $sortDir === 'asc' ? 'asc' : 'desc');

        return response()->json($query->paginate($perPage));
    }

    public function show(Contact $contact): JsonResponse
    {
        return response()->json($contact);
    }

    public function store(Request $request): JsonResponse
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

        $validated['contactable_type'] = 'App\\Models\\Vendor';

        $contact = Contact::create($validated);

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

        return response()->json(['message' => 'Kontak deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
        ]);

        Contact::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' kontak(s) deleted']);
    }
}
