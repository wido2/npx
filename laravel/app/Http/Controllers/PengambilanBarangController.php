<?php

namespace App\Http\Controllers;

use App\Models\PengambilanBarang;
use App\Models\Setting;
use App\Services\KodePBService;
use App\Services\StokService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengambilanBarangController extends Controller
{
    public function __construct(
        protected KodePBService $kodePBService,
        protected StokService $stokService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search', '');
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');

        $query = PengambilanBarang::with([
            'client:id,kode,nama',
            'project:id,kode,nama',
            'karyawan:id,nama',
        ]);

        if (!$request->user()->can('pb.view_all')) {
            $query->where('created_by', $request->user()->id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhereHas('client', fn($c) => $c->where('nama', 'ilike', "%{$search}%"))
                    ->orWhereHas('project', fn($p) => $p->where('nama', 'ilike', "%{$search}%"));
            });
        }

        if ($dateFrom !== '') {
            $query->whereDate('tanggal_pengambilan', '>=', $dateFrom);
        }

        if ($dateTo !== '') {
            $query->whereDate('tanggal_pengambilan', '<=', $dateTo);
        }

        $query->withCount('items');

        $sortField = $request->input('sort_field', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('pb.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'tanggal_pengambilan' => 'required|date',
            'client_id' => 'nullable|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'karyawan_id' => 'nullable|exists:karyawans,id',
            'keterangan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.keterangan' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $kode = $this->kodePBService->generate(
                \Carbon\Carbon::parse($validated['tanggal_pengambilan'])
            );

            $pb = PengambilanBarang::create([
                'kode' => $kode,
                'tanggal_pengambilan' => $validated['tanggal_pengambilan'],
                'client_id' => $validated['client_id'] ?? null,
                'project_id' => $validated['project_id'] ?? null,
                'karyawan_id' => $validated['karyawan_id'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $barang = \App\Models\Barang::findOrFail($itemData['barang_id']);

                $pb->items()->create([
                    'barang_id' => $barang->id,
                    'jumlah' => $itemData['jumlah'],
                    'keterangan' => $itemData['keterangan'] ?? null,
                ]);

                $this->stokService->kurangi(
                    $barang,
                    $itemData['jumlah'],
                    PengambilanBarang::class,
                    $pb->id,
                    $itemData['keterangan'] ?? null,
                    $request->user()->id
                );
            }

            return response()->json(
                $pb->load([
                    'client:id,kode,nama',
                    'project:id,kode,nama',
                    'karyawan:id,nama',
                    'items.barang:id,kode,nama',
                ]),
                201
            );
        });
    }

    public function show(Request $request, PengambilanBarang $pengambilanBarang): JsonResponse
    {
        if (!$request->user()->can('pb.view_all') && $pengambilanBarang->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pb = $pengambilanBarang->load([
            'client',
            'project',
            'karyawan',
            'items.barang',
            'dibuatOleh',
        ]);

        $data = $pb->toArray();
        $data['dibuat_oleh_user'] = $pb->dibuatOleh?->only(['id', 'name']);

        return response()->json($data);
    }

    public function destroy(Request $request, PengambilanBarang $pengambilanBarang): JsonResponse
    {
        if (!$request->user()->can('pb.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pengambilanBarang->delete();

        return response()->json(['message' => 'Pengambilan barang deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        if (!$request->user()->can('pb.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:pengambilan_barang,id',
        ]);

        $count = PengambilanBarang::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => $count . ' pengambilan barang deleted']);
    }

    public function pdf(PengambilanBarang $pengambilanBarang): \Illuminate\Http\Response
    {
        $pb = $pengambilanBarang->load([
            'client',
            'project',
            'karyawan',
            'items.barang.unit',
            'dibuatOleh',
        ]);

        $generalSetting = Setting::where('group', 'general')->first();
        $dataSetting = $generalSetting ? $generalSetting->data : [];

        $pdf = Pdf::loadView('pdf.pengambilan-barang', [
            'pb' => $pb,
            'setting' => $dataSetting,
        ]);

        $fontPath = '/usr/share/fonts/wps-fonts';
        if (is_dir($fontPath)) {
            $fontMetrics = $pdf->getDomPDF()->getFontMetrics();
            $fontMetrics->registerFont(
                ['family' => 'Segoe UI', 'style' => 'normal', 'weight' => 'normal'],
                $fontPath . '/segoeui.ttf'
            );
            $fontMetrics->registerFont(
                ['family' => 'Segoe UI', 'style' => 'normal', 'weight' => 'bold'],
                $fontPath . '/segoeuib.ttf'
            );
            $fontMetrics->registerFont(
                ['family' => 'Segoe UI', 'style' => 'italic', 'weight' => 'normal'],
                $fontPath . '/segoeuii.ttf'
            );
        }

        $filename = ($pb->kode ?? 'PB-DRAFT') . '.pdf';
        return $pdf->stream($filename);
    }
}
