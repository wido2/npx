<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$request->user()->id,
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'telegram' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'youtube' => 'nullable|string|max:255',
            'github' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $user->fill($request->only([
            'name', 'email', 'phone', 'bio', 'avatar',
            'facebook', 'instagram', 'twitter', 'linkedin',
            'whatsapp', 'telegram', 'tiktok', 'youtube', 'github',
        ]));
        $user->save();

        return response()->json([
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    // --- Admin endpoints ---

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('users.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $users = User::with('roles')->get()->map(fn($u) => [
            ...$u->toArray(),
            'roles' => $u->getRoleNames(),
            'permissions' => $u->getAllPermissions()->pluck('name'),
        ]);

        return response()->json($users);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
        ]);

        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('email')) $user->email = $request->email;
        if ($request->filled('password')) $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function syncRoles(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user->syncRoles($request->roles);

        return response()->json([
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function syncPermissions(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->can('users.manage')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user->syncPermissions($request->permissions);

        return response()->json([
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }
}
