<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $roles = Role::with('permissions')->get()->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'guard_name' => $r->guard_name,
            'permissions' => $r->permissions->pluck('name'),
        ]);

        return response()->json($roles);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::findOrCreate($validated['name'], 'web');
        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json([
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'permissions' => $role->permissions->pluck('name'),
        ], 201);
    }

    public function syncPermissions(Request $request, Role $role): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($request->permissions);

        return response()->json([
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name'),
        ]);
    }
}
