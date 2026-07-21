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

        $labelMap = [
            'create' => 'Create', 'view_own' => 'View Own', 'view_all' => 'View All',
            'view' => 'View', 'edit' => 'Edit', 'delete' => 'Delete',
            'submit' => 'Submit', 'approve' => 'Approve', 'receive' => 'Receive',
            'cancel' => 'Cancel', 'manage' => 'Manage', 'update' => 'Update',
            'opname' => 'Opname',
            'update_harga' => 'Update Harga',
            'vendor_summary' => 'Ringkasan Vendor',
            'client_summary' => 'Ringkasan Client',
            'project_summary' => 'Ringkasan Project',
            'karyawan_summary' => 'Ringkasan Karyawan',
            'po_status_chart' => 'Chart Status PO',
            'barang_kategori_chart' => 'Chart Kategori Barang',
            'recent_po' => 'PO Terbaru',
            'recent_pb' => 'PB Terbaru',
            'aging_po' => 'Aging PO',
            'top_vendor' => 'Top Vendor',
            'low_stock' => 'Stok Menipis',
            'aktivitas_terbaru' => 'Aktivitas Terbaru',
        ];

        $groupLabelMap = [
            'pb' => 'PB - Pengambilan Barang',
            'po' => 'Purchase Order',
            'master' => 'Master Data',
            'inventory' => 'Inventory',
            'notification' => 'Notifikasi',
            'widget' => 'Widget',
            'users' => 'Users',
            'settings' => 'Settings',
            'reports' => 'Reports',
        ];

        $grouped = [];
        foreach ($permissions as $perm) {
            $parts = explode('.', $perm, 2);
            $group = $parts[0] ?? 'other';
            $name = $parts[1] ?? $perm;
            $label = $labelMap[$name] ?? str_replace('_', ' ', ucfirst($name));
            $grouped[$group][] = ['name' => $perm, 'label' => $label];
        }

        // Gunakan group label jika ada
        $result = [];
        foreach ($grouped as $group => $perms) {
            $result[$groupLabelMap[$group] ?? ucfirst($group)] = $perms;
        }
        return response()->json($result);

        return response()->json($grouped);
    }
}
