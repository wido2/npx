<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Client;
use App\Models\Karyawan;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'vendor_count' => Vendor::where('aktif', true)->count(),
            'client_count' => Client::where('aktif', true)->count(),
            'project_total' => Project::count(),
            'project_aktif' => Project::where('status', 'aktif')->count(),
            'project_selesai' => Project::where('status', 'selesai')->count(),
            'karyawan_count' => Karyawan::where('aktif', true)->count(),
            'po_count' => PurchaseOrder::count(),
            'barang_count' => Barang::count(),
        ]);
    }

    public function agingPO(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 5);

        $data = PurchaseOrder::whereNotIn('status', ['diterima', 'dibatalkan', 'diterima_sebagian'])
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get()
            ->load('vendor:id,kode,nama');

        return response()->json($data->map(fn($po) => [
            'id' => $po->id,
            'kode' => $po->kode,
            'vendor_nama' => $po->vendor?->nama ?? '',
            'total' => (float) $po->total,
            'status' => $po->status,
            'created_at' => $po->created_at,
            'hari' => $po->created_at->diffInDays(now()),
        ]));
    }
}
