<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\HargaSupplier;
use App\Models\HargaUpdate;
use App\Models\RiwayatHarga;
use App\Models\RiwayatHargaSupplier;
use App\Models\User;
use App\Notifications\VendorPriceChanged;
use App\Services\KodeHargaUpdateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class HargaUpdateController extends Controller
{
    public function __construct(
        private readonly KodeHargaUpdateService $kodeHargaUpdateService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('master.barang.update_harga')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $query = HargaUpdate::with(['dibuatOleh', 'vendor:id,kode,nama'])
            ->orderBy('created_at', 'desc');

        $perPage = min((int) ($request->query('per_page', 20)), 100);
        $page = (int) ($request->query('page', 1));
        $query->skip(($page - 1) * $perPage)->take($perPage);

        $data = $query->get();
        $total = HargaUpdate::count();

        return response()->json([
            'data' => $data,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    public function show(Request $request, HargaUpdate $hargaUpdate): JsonResponse
    {
        if (!$request->user()->can('master.barang.update_harga')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $hargaUpdate->load(['dibuatOleh', 'vendor:id,kode,nama', 'riwayat.barang', 'riwayat.dibuatOleh']);

        return response()->json($hargaUpdate);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('master.barang.update_harga')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|string|exists:vendors,id',
            'keterangan' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|string|exists:barangs,id',
            'items.*.harga_beli' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $kode = $this->kodeHargaUpdateService->generate();
            $user = $request->user();

            $hargaUpdate = HargaUpdate::create([
                'kode' => $kode,
                'vendor_id' => $validated['vendor_id'],
                'keterangan' => $validated['keterangan'] ?? null,
                'created_by' => $user->id,
            ]);

            foreach ($validated['items'] as $item) {
                $barang = Barang::findOrFail($item['barang_id']);

                $hargaSupplier = HargaSupplier::where('barang_id', $item['barang_id'])
                    ->where('vendor_id', $validated['vendor_id'])
                    ->first();

                $hargaLama = $hargaSupplier ? (float) $hargaSupplier->harga_beli : (float) ($barang->harga_beli ?? 0);

                RiwayatHarga::create([
                    'barang_id' => $item['barang_id'],
                    'harga_beli_lama' => $hargaLama,
                    'harga_beli_baru' => $item['harga_beli'],
                    'referensi_type' => HargaUpdate::class,
                    'referensi_id' => $hargaUpdate->id,
                    'keterangan' => $validated['keterangan'] ?? null,
                    'created_by' => $user->id,
                    'created_at' => now(),
                ]);

                $hargaSupplier = HargaSupplier::updateOrCreate(
                    [
                        'barang_id' => $item['barang_id'],
                        'vendor_id' => $validated['vendor_id'],
                    ],
                    [
                        'harga_beli' => $item['harga_beli'],
                        'keterangan' => $validated['keterangan'] ?? null,
                    ]
                );

                $barang->update(['harga_beli' => $item['harga_beli']]);

                RiwayatHargaSupplier::create([
                    'harga_supplier_id' => $hargaSupplier->id,
                    'barang_id' => $item['barang_id'],
                    'vendor_id' => $validated['vendor_id'],
                    'harga_beli_lama' => $hargaLama,
                    'harga_beli_baru' => $item['harga_beli'],
                    'referensi_type' => HargaUpdate::class,
                    'referensi_id' => $hargaUpdate->id,
                    'keterangan' => $validated['keterangan'] ?? null,
                    'created_by' => $user->id,
                    'created_at' => now(),
                ]);
            }

            $hargaUpdate->load(['dibuatOleh', 'vendor:id,kode,nama', 'riwayat.barang']);

            // Notify about price changes
            $users = User::permission('notification.vendor_price_changed')->get();

            $vendor = $hargaUpdate->vendor;
            $vendorNama = $vendor?->nama ?? 'Unknown';

            foreach ($hargaUpdate->riwayat as $riwayat) {
                Notification::send($users, new VendorPriceChanged(
                    $riwayat->barang,
                    $vendorNama,
                    (float) $riwayat->harga_beli_lama,
                    (float) $riwayat->harga_beli_baru,
                    "Harga Update {$hargaUpdate->kode}",
                ));
            }

            return response()->json($hargaUpdate, 201);
        });
    }
}
