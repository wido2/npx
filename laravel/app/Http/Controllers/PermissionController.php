<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $permissions = Permission::all()->pluck('name');

        $grouped = [];
        foreach ($permissions as $perm) {
            $parts = explode('.', $perm, 2);
            $group = $parts[0] ?? 'other';
            $name = $parts[1] ?? $perm;
            $grouped[$group][] = ['name' => $perm, 'label' => $name];
        }

        return response()->json($grouped);
    }
}
