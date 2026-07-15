<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportPurchaseOrderController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $tahun = $request->integer('tahun', now()->year);

        $totalPo = PurchaseOrder::whereYear('created_at', $tahun)->count();
        $totalNilai = PurchaseOrder::whereYear('created_at', $tahun)->sum('total');

        $perStatus = PurchaseOrder::whereYear('created_at', $tahun)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $bulanIni = PurchaseOrder::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $bulanLalu = PurchaseOrder::whereYear('created_at', now()->subMonth()->year)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->count();

        return response()->json([
            'total_po' => $totalPo,
            'total_nilai' => $totalNilai,
            'draft' => $perStatus['draft'] ?? 0,
            'dikirim' => $perStatus['dikirim'] ?? 0,
            'disetujui' => $perStatus['disetujui'] ?? 0,
            'diterima' => $perStatus['diterima'] ?? 0,
            'diterima_sebagian' => $perStatus['diterima_sebagian'] ?? 0,
            'dibatalkan' => $perStatus['dibatalkan'] ?? 0,
            'po_bulan_ini' => $bulanIni,
            'po_bulan_lalu' => $bulanLalu,
        ]);
    }

    public function perBulan(Request $request): JsonResponse
    {
        $tahun = $request->integer('tahun', now()->year);

        $data = PurchaseOrder::whereYear('created_at', $tahun)
            ->select(
                DB::raw('EXTRACT(MONTH FROM created_at) as bulan'),
                DB::raw('count(*) as total_po'),
                DB::raw('COALESCE(sum(total), 0) as total_nilai')
            )
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get();

        $bulanNama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        $result = collect(range(1, 12))->map(function ($b) use ($data, $bulanNama) {
            $item = $data->firstWhere('bulan', $b);
            return [
                'bulan' => $b,
                'bulan_nama' => $bulanNama[$b],
                'total_po' => (int) ($item->total_po ?? 0),
                'total_nilai' => (float) ($item->total_nilai ?? 0),
            ];
        });

        return response()->json($result);
    }

    public function perVendor(Request $request): JsonResponse
    {
        $tahun = $request->integer('tahun', now()->year);
        $limit = $request->integer('limit', 10);

        $data = PurchaseOrder::whereYear('created_at', $tahun)
            ->select(
                'vendor_id',
                DB::raw('count(*) as total_po'),
                DB::raw('COALESCE(sum(total), 0) as total_nilai')
            )
            ->groupBy('vendor_id')
            ->orderByDesc('total_nilai')
            ->limit($limit)
            ->get()
            ->load('vendor:id,kode,nama');

        return response()->json($data->map(fn($item) => [
            'vendor_id' => $item->vendor_id,
            'vendor_kode' => $item->vendor->kode,
            'vendor_nama' => $item->vendor->nama,
            'total_po' => (int) $item->total_po,
            'total_nilai' => (float) $item->total_nilai,
        ]));
    }

    public function perHari(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $dateFrom = Carbon::parse($request->date_from)->startOfDay();
        $dateTo = Carbon::parse($request->date_to)->endOfDay();

        $rows = PurchaseOrder::whereBetween('created_at', [$dateFrom, $dateTo])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("COALESCE(sum(CASE WHEN status IN ('disetujui','diterima','diterima_sebagian') THEN total ELSE 0 END), 0) as disetujui"),
                DB::raw("COALESCE(sum(CASE WHEN status NOT IN ('disetujui','diterima','diterima_sebagian','dibatalkan') THEN total ELSE 0 END), 0) as pending"),
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $result = collect();
        $current = $dateFrom->copy();
        while ($current->lte($dateTo)) {
            $dateStr = $current->format('Y-m-d');
            $item = $rows->get($dateStr);
            $result->push([
                'date' => $dateStr,
                'disetujui' => (float) ($item->disetujui ?? 0),
                'pending' => (float) ($item->pending ?? 0),
            ]);
            $current->addDay();
        }

        return response()->json($result);
    }

    public function perStatus(Request $request): JsonResponse
    {
        $tahun = $request->integer('tahun', now()->year);

        $data = PurchaseOrder::whereYear('created_at', $tahun)
            ->select('status', DB::raw('count(*) as total'), DB::raw('COALESCE(sum(total), 0) as total_nilai'))
            ->groupBy('status')
            ->get();

        return response()->json($data);
    }

    public function topItems(Request $request): JsonResponse
    {
        $tahun = $request->integer('tahun', now()->year);
        $limit = $request->integer('limit', 10);
        $sortBy = in_array($request->input('sort_by'), ['total_dipesan', 'total_nilai']) ? $request->input('sort_by') : 'total_dipesan';

        $data = DB::table('purchase_order_items as poi')
            ->leftJoin('purchase_order_receipt_items as ri', 'ri.purchase_order_item_id', '=', 'poi.id')
            ->join('purchase_orders as po', 'po.id', '=', 'poi.purchase_order_id')
            ->whereYear('po.created_at', $tahun)
            ->select(
                'poi.barang_id',
                DB::raw('sum(poi.jumlah) as total_dipesan'),
                DB::raw('COALESCE(sum(ri.jumlah_diterima), 0) as total_diterima'),
                DB::raw('sum(poi.subtotal) as total_nilai')
            )
            ->groupBy('poi.barang_id')
            ->orderByDesc($sortBy)
            ->limit($limit)
            ->get();

        $barangs = \App\Models\Barang::whereIn('id', $data->pluck('barang_id'))->get()->keyBy('id');

        return response()->json($data->map(fn($item) => [
            'barang_id' => $item->barang_id,
            'barang_kode' => $barangs[$item->barang_id]->kode ?? '',
            'barang_nama' => $barangs[$item->barang_id]->nama ?? '',
            'total_dipesan' => (int) $item->total_dipesan,
            'total_diterima' => (int) $item->total_diterima,
            'total_nilai' => (float) $item->total_nilai,
        ]));
    }
}
