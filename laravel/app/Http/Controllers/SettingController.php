<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function show(Request $request, string $group): JsonResponse
    {
        if (!$request->user()->can('settings.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $setting = Setting::where('group', $group)->firstOrFail();
        return response()->json($setting);
    }

    public function update(Request $request, string $group): JsonResponse
    {
        if (!$request->user()->can('settings.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $setting = Setting::where('group', $group)->firstOrFail();

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        $setting->update(['data' => $validated['data']]);

        return response()->json($setting);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        if (!$request->user()->can('settings.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        $path = $request->file('logo')->store('logo', 'public');

        return response()->json(['path' => $path]);
    }
}
