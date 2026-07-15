<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = Client::query();

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
            'kode' => 'required|string|max:50|unique:clients',
            'nama' => 'required|string|max:255',
            'npwp' => 'nullable|string|max:20',
            'tipe' => 'required|in:perusahaan,perorangan',
            'email' => 'nullable|email|max:255',
            'telepon' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client->load(['addresses', 'contacts']));
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'kode' => "required|string|max:50|unique:clients,kode,{$client->id}",
            'nama' => 'required|string|max:255',
            'npwp' => 'nullable|string|max:20',
            'tipe' => 'required|in:perusahaan,perorangan',
            'email' => 'nullable|email|max:255',
            'telepon' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json(['message' => 'Client deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:clients,id',
        ]);

        Client::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' client(s) deleted']);
    }
}
