<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    private function getGroupPermission(string $group): string
    {
        $map = [
            'general' => 'settings.general',
            'purchase_order' => 'settings.purchase_order',
            'pengambilan_barang' => 'settings.pengambilan_barang',
            'pembelian_langsung' => 'settings.pembelian_langsung',
            'stok_opname' => 'settings.stok_opname',
            'harga_update' => 'settings.general',
        ];

        if (in_array($group, ['pdf_report', 'po_pdf', 'pb_pdf'])) {
            return 'settings.pdf';
        }

        return $map[$group] ?? 'settings.general';
    }

    public function show(Request $request, string $group): JsonResponse
    {
        $perm = $this->getGroupPermission($group);
        if (!$request->user()->can("{$perm}.view")) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $setting = Setting::where('group', $group)->firstOrFail();
        return response()->json($setting);
    }

    public function update(Request $request, string $group): JsonResponse
    {
        $perm = $this->getGroupPermission($group);
        if (!$request->user()->can("{$perm}.update")) {
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
        if (!$request->user()->can('settings.general.update')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        $path = $request->file('logo')->store('logo', 'public');

        return response()->json(['path' => $path]);
    }
}
