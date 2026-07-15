<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = Project::with(['client', 'unit']);

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
            'kode' => 'required|string|max:100|unique:projects',
            'nama' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'unit_id' => 'required|exists:units,id',
            'deskripsi' => 'nullable|string',
            'nilai_kontrak' => 'nullable|numeric|min:0',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:aktif,selesai,ditunda,dibatalkan',
            'aktif' => 'boolean',
        ]);

        $project = Project::create($validated);

        return response()->json($project->load(['client', 'unit']), 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json($project->load(['client', 'unit']));
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'kode' => "required|string|max:100|unique:projects,kode,{$project->id}",
            'nama' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'unit_id' => 'required|exists:units,id',
            'deskripsi' => 'nullable|string',
            'nilai_kontrak' => 'nullable|numeric|min:0',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'status' => 'required|in:aktif,selesai,ditunda,dibatalkan',
            'aktif' => 'boolean',
        ]);

        $project->update($validated);

        return response()->json($project->load(['client', 'unit']));
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(['message' => 'Project deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:projects,id',
        ]);

        Project::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' project(s) deleted']);
    }
}
