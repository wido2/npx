<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KontakController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('master.kontak.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

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

    public function show(Request $request, Contact $contact): JsonResponse
    {
        if (!$request->user()->can('master.kontak.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($contact);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('master.kontak.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'telepon' => 'nullable|string|max:20',
            'hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'utama' => 'boolean',
            'aktif' => 'boolean',
            'contactable_type' => 'required|string|in:vendor,client',
            'contactable_id' => 'required|string',
        ]);

        $modelMap = [
            'vendor' => 'App\\Models\\Vendor',
            'client' => 'App\\Models\\Client',
        ];

        $validated['contactable_type'] = $modelMap[$validated['contactable_type']];

        $contact = Contact::create($validated);

        return response()->json($contact, 201);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        if (!$request->user()->can('master.kontak.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'telepon' => 'nullable|string|max:20',
            'hp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'utama' => 'boolean',
            'aktif' => 'boolean',
            'contactable_type' => 'nullable|string|in:vendor,client',
            'contactable_id' => 'nullable|string',
        ]);

        $modelMap = [
            'vendor' => 'App\\Models\\Vendor',
            'client' => 'App\\Models\\Client',
        ];

        if ($validated['contactable_type'] ?? false) {
            $validated['contactable_type'] = $modelMap[$validated['contactable_type']];
        } else {
            unset($validated['contactable_type']);
            unset($validated['contactable_id']);
        }

        $contact->update($validated);

        return response()->json($contact);
    }

    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        if (!$request->user()->can('master.kontak.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $contact->delete();

        return response()->json(['message' => 'Kontak deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        if (!$request->user()->can('master.kontak.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
        ]);

        Contact::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' kontak(s) deleted']);
    }
}
