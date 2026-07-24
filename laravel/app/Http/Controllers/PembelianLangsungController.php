<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\PembelianLangsung;
use App\Models\ItemPembelianLangsung;
use App\Models\PembelianLangsungAttachment;
use App\Models\HargaSupplier;
use App\Models\RiwayatHargaSupplier;
use App\Models\User;
use App\Services\KodePLService;
use App\Services\StokService;
use App\Services\HargaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use App\Notifications\VendorPriceChanged;

class PembelianLangsungController extends Controller
{
    public function __construct(
        protected KodePLService $kodePLService,
        protected StokService $stokService,
        protected HargaService $hargaService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->input('search', '');
        $dateFrom = $request->input('date_from', '');
        $dateTo = $request->input('date_to', '');

        $query = PembelianLangsung::with([
            'vendor:id,kode,nama',
            'karyawan:id,nama',
            'items.barang:id,kode,nama',
        ]);

        if (!$request->user()->can('pl.view_all')) {
            $query->where('created_by', $request->user()->id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kode', 'ilike', "%{$search}%")
                    ->orWhereHas('vendor', fn($v) => $v->where('nama', 'ilike', "%{$search}%"));
            });
        }

        if ($dateFrom !== '') {
            $query->whereDate('tanggal', '>=', $dateFrom);
        }

        if ($dateTo !== '') {
            $query->whereDate('tanggal', '<=', $dateTo);
        }

        $query->withCount('items');

        $sortField = $request->input('sort_field', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortField, $sortDir);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->can('pl.create')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($request->has('items') && is_string($request->input('items'))) {
            $request->merge(['items' => json_decode($request->input('items'), true)]);
        }

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'karyawan_id' => 'nullable|exists:karyawans,id',
            'tanggal' => 'required|date',
            'catatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'required|numeric|min:0',
            'items.*.keterangan' => 'nullable|string',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'required|file|image|max:3072',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $kode = $this->kodePLService->generate(
                \Carbon\Carbon::parse($validated['tanggal'])
            );

            $pl = PembelianLangsung::create([
                'kode' => $kode,
                'vendor_id' => $validated['vendor_id'],
                'karyawan_id' => $validated['karyawan_id'] ?? null,
                'tanggal' => $validated['tanggal'],
                'catatan' => $validated['catatan'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $barang = Barang::findOrFail($itemData['barang_id']);

                $pl->items()->create([
                    'barang_id' => $barang->id,
                    'jumlah' => $itemData['jumlah'],
                    'harga_satuan' => $itemData['harga_satuan'],
                    'keterangan' => $itemData['keterangan'] ?? null,
                ]);

                $this->stokService->tambah(
                    $barang,
                    $itemData['jumlah'],
                    PembelianLangsung::class,
                    $pl->id,
                    $itemData['keterangan'] ?? null,
                    $request->user()->id
                );

                $this->hargaService->rekam(
                    $barang,
                    $itemData['harga_satuan'],
                    PembelianLangsung::class,
                    $pl->id,
                    'Pembelian Langsung: ' . $kode,
                    $request->user()->id
                );
            }

            $this->updateHargaSupplierDariPL($pl, $validated['vendor_id'], $validated['items'], $request->user()->id);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('pembelian-langsung', 'public');
                    $pl->attachments()->create([
                        'nama_file' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'ukuran' => $file->getSize(),
                    ]);
                }
            }

            $pl->load([
                'vendor:id,kode,nama',
                'karyawan:id,nama',
                'items.barang:id,kode,nama',
                'attachments',
                'dibuatOleh:id,name',
            ]);

            return response()->json($pl, 201);
        });
    }

    public function show(Request $request, PembelianLangsung $pembelianLangsung): JsonResponse
    {
        if (!$request->user()->can('pl.view_all') && $pembelianLangsung->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pl = $pembelianLangsung->load([
            'vendor',
            'karyawan',
            'items.barang',
            'attachments',
            'dibuatOleh:id,name',
        ]);

        $data = $pl->toArray();
        $data['dibuat_oleh_user'] = $pl->dibuatOleh?->only(['id', 'name']);

        return response()->json($data);
    }

    public function update(Request $request, PembelianLangsung $pembelianLangsung): JsonResponse
    {
        if (!$request->user()->can('pl.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($request->has('items') && is_string($request->input('items'))) {
            $request->merge(['items' => json_decode($request->input('items'), true)]);
        }

        $validated = $request->validate([
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'karyawan_id' => 'nullable|exists:karyawans,id',
            'tanggal' => 'sometimes|required|date',
            'catatan' => 'nullable|string',
            'items' => 'sometimes|required|array|min:1',
            'items.*.barang_id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.harga_satuan' => 'required|numeric|min:0',
            'items.*.keterangan' => 'nullable|string',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'required|file|image|max:3072',
        ]);

        return DB::transaction(function () use ($validated, $request, $pembelianLangsung) {
            $pl = $pembelianLangsung;

            if (isset($validated['vendor_id'])) {
                $pl->vendor_id = $validated['vendor_id'];
            }
            if (isset($validated['tanggal'])) {
                $pl->tanggal = $validated['tanggal'];
            }
            $pl->karyawan_id = $validated['karyawan_id'] ?? $pl->karyawan_id;
            $pl->catatan = $validated['catatan'] ?? $pl->catatan;
            $pl->save();

            if (isset($validated['items'])) {
                $oldItems = $pl->items()->with('barang')->get()->keyBy('id');
                $newBarangIds = collect($validated['items'])->pluck('barang_id');

                foreach ($oldItems as $oldItem) {
                    $match = collect($validated['items'])->firstWhere('barang_id', $oldItem->barang_id);

                    if (!$match) {
                        $this->stokService->kurangi(
                            $oldItem->barang,
                            $oldItem->jumlah,
                            PembelianLangsung::class,
                            $pl->id,
                            'Dihapus dari PL: ' . $pl->kode,
                            $request->user()->id
                        );
                        $oldItem->delete();
                    } else {
                        $diff = $match['jumlah'] - $oldItem->jumlah;
                        if ($diff > 0) {
                            $this->stokService->tambah(
                                $oldItem->barang,
                                $diff,
                                PembelianLangsung::class,
                                $pl->id,
                                'Penyesuaian PL: ' . $pl->kode,
                                $request->user()->id
                            );
                        } elseif ($diff < 0) {
                            $this->stokService->kurangi(
                                $oldItem->barang,
                                abs($diff),
                                PembelianLangsung::class,
                                $pl->id,
                                'Penyesuaian PL: ' . $pl->kode,
                                $request->user()->id
                            );
                        }

                        if ((float) $match['harga_satuan'] !== (float) $oldItem->harga_satuan) {
                            $this->hargaService->rekam(
                                $oldItem->barang,
                                $match['harga_satuan'],
                                PembelianLangsung::class,
                                $pl->id,
                                'Update harga PL: ' . $pl->kode,
                                $request->user()->id
                            );
                        }

                        $oldItem->update([
                            'jumlah' => $match['jumlah'],
                            'harga_satuan' => $match['harga_satuan'],
                            'keterangan' => $match['keterangan'] ?? null,
                        ]);
                    }
                }

                $existingBarangIds = $oldItems->pluck('barang_id');
                foreach ($validated['items'] as $itemData) {
                    if ($existingBarangIds->contains($itemData['barang_id'])) {
                        continue;
                    }

                    $barang = Barang::findOrFail($itemData['barang_id']);

                    $pl->items()->create([
                        'barang_id' => $barang->id,
                        'jumlah' => $itemData['jumlah'],
                        'harga_satuan' => $itemData['harga_satuan'],
                        'keterangan' => $itemData['keterangan'] ?? null,
                    ]);

                    $this->stokService->tambah(
                        $barang,
                        $itemData['jumlah'],
                        PembelianLangsung::class,
                        $pl->id,
                        'Item baru PL: ' . $pl->kode,
                        $request->user()->id
                    );

                    $this->hargaService->rekam(
                        $barang,
                        $itemData['harga_satuan'],
                        PembelianLangsung::class,
                        $pl->id,
                        'Pembelian Langsung: ' . $pl->kode,
                        $request->user()->id
                    );
                }
            }

            if (isset($validated['items'])) {
                $this->updateHargaSupplierDariPL($pl, $pl->vendor_id, $validated['items'], $request->user()->id);
            }

            if ($request->hasFile('attachments')) {
                $currentCount = $pl->attachments()->count();
                $newCount = count($request->file('attachments'));

                if ($currentCount + $newCount > 5) {
                    throw new \RuntimeException('Total attachment tidak boleh lebih dari 5');
                }

                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('pembelian-langsung', 'public');
                    $pl->attachments()->create([
                        'nama_file' => $file->getClientOriginalName(),
                        'path' => $path,
                        'mime_type' => $file->getMimeType(),
                        'ukuran' => $file->getSize(),
                    ]);
                }
            }

            $pl->load([
                'vendor:id,kode,nama',
                'karyawan:id,nama',
                'items.barang:id,kode,nama',
                'attachments',
                'dibuatOleh:id,name',
            ]);

            return response()->json($pl);
        });
    }

    public function destroy(Request $request, PembelianLangsung $pembelianLangsung): JsonResponse
    {
        if (!$request->user()->can('pl.delete')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::transaction(function () use ($pembelianLangsung, $request) {
            $pl = $pembelianLangsung->load('items.barang', 'attachments');

            foreach ($pl->items as $item) {
                $this->stokService->kurangi(
                    $item->barang,
                    $item->jumlah,
                    PembelianLangsung::class,
                    $pl->id,
                    'Pembatalan PL: ' . $pl->kode,
                    $request->user()->id
                );
            }

            foreach ($pl->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->path);
            }

            $pl->delete();
        });

        return response()->json(['message' => 'Pembelian langsung deleted']);
    }

    public function destroyAttachment(Request $request, PembelianLangsung $pembelianLangsung, PembelianLangsungAttachment $attachment): JsonResponse
    {
        if (!$request->user()->can('pl.edit')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($attachment->pembelian_langsung_id !== $pembelianLangsung->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted']);
    }

    private function updateHargaSupplierDariPL(PembelianLangsung $pl, string $vendorId, array $items, string $userId): void
    {
        $pl->loadMissing('vendor:id,kode,nama');
        $vendorNama = $pl->vendor?->nama ?? 'Unknown';
        $changedPrices = [];

        foreach ($items as $itemData) {
            $barang = Barang::find($itemData['barang_id']);
            if (!$barang) continue;

            $hargaSupplier = HargaSupplier::where('vendor_id', $vendorId)
                ->where('barang_id', $barang->id)
                ->first();

            if ($hargaSupplier) {
                $hargaLama = (float) $hargaSupplier->harga_beli;
                $hargaBaru = (float) $itemData['harga_satuan'];

                if ($hargaLama !== $hargaBaru) {
                    $hargaSupplier->update(['harga_beli' => $hargaBaru]);

                    RiwayatHargaSupplier::create([
                        'harga_supplier_id' => $hargaSupplier->id,
                        'barang_id' => $barang->id,
                        'vendor_id' => $vendorId,
                        'harga_beli_lama' => $hargaLama,
                        'harga_beli_baru' => $hargaBaru,
                        'referensi_type' => PembelianLangsung::class,
                        'referensi_id' => $pl->id,
                        'keterangan' => "Dari PL {$pl->kode}",
                        'created_by' => $userId,
                        'created_at' => now(),
                    ]);

                    $changedPrices[] = [
                        'barang' => $barang,
                        'vendor_nama' => $vendorNama,
                        'harga_lama' => $hargaLama,
                        'harga_baru' => $hargaBaru,
                    ];
                }
            } else {
                HargaSupplier::create([
                    'barang_id' => $barang->id,
                    'vendor_id' => $vendorId,
                    'harga_beli' => (float) $itemData['harga_satuan'],
                    'keterangan' => "Dari PL {$pl->kode}",
                ]);

                $changedPrices[] = [
                    'barang' => $barang,
                    'vendor_nama' => $vendorNama,
                    'harga_lama' => 0,
                    'harga_baru' => (float) $itemData['harga_satuan'],
                ];
            }
        }

        if (!empty($changedPrices)) {
            $users = User::permission('notification.vendor_price_changed')->get();

            foreach ($changedPrices as $change) {
                Notification::send($users, new VendorPriceChanged(
                    $change['barang'],
                    $change['vendor_nama'],
                    $change['harga_lama'],
                    $change['harga_baru'],
                    "PL {$pl->kode}",
                ));
            }
        }
    }
}
