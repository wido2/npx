<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\Client;
use App\Models\Project;
use App\Models\Barang;
use Illuminate\Http\JsonResponse;

class PurchaseOrderRevisionController extends Controller
{
    private const FIELD_LABELS = [
        'vendor_id' => 'Vendor',
        'client_id' => 'Client',
        'project_id' => 'Project',
        'tanggal_po' => 'Tanggal PO',
        'tanggal_kirim_expected' => 'Tgl Kirim',
        'diskon' => 'Diskon',
        'catatan' => 'Catatan',
        'syarat_pembayaran' => 'Syarat Bayar',
        'alamat_kirim' => 'Alamat Kirim',
        'status' => 'Status',
        'disetujui_oleh' => 'Disetujui Oleh',
        'tanggal_disetujui' => 'Tgl Disetujui',
    ];

    public function index(PurchaseOrder $purchaseOrder): JsonResponse
    {
        $revisions = $purchaseOrder->revisions()->orderBy('version')->get();
        $data = [];

        foreach ($revisions as $i => $r) {
            $entry = [...$r->toArray(), 'changed_by_user' => $r->changedBy?->only(['id', 'name'])];

            if ($i > 0) {
                $prev = $revisions[$i - 1];
                $entry['changes'] = $this->computeDiff($prev->data, $r->data);
            } else {
                $entry['changes'] = $this->computeInitialChanges($r->data);
            }

            $data[] = $entry;
        }

        return response()->json(array_reverse($data));
    }

    private function computeInitialChanges(array $data): array
    {
        $changes = [];
        $header = $data['header'] ?? [];
        $items = $data['items'] ?? [];

        $relevantFields = array_keys(self::FIELD_LABELS);
        foreach ($relevantFields as $field) {
            $val = $header[$field] ?? null;
            if ($val !== null && $val !== '' && $val !== 0 && $val !== '0') {
                $changes[] = [
                    'type' => 'header',
                    'field' => $field,
                    'label' => self::FIELD_LABELS[$field],
                    'oldValue' => null,
                    'newValue' => $this->resolveLabel($field, $val),
                ];
            }
        }

        foreach ($items as $item) {
            $nama = $item['barang']['nama'] ?? $item['keterangan'] ?? '-';
            $changes[] = [
                'type' => 'item_added',
                'label' => $nama,
                'oldValue' => null,
                'newValue' => ($item['jumlah'] ?? 0) . ' x Rp ' . number_format($item['harga_satuan'] ?? 0, 0),
            ];
        }

        return $changes;
    }

    public function show(PurchaseOrder $purchaseOrder, string $revision): JsonResponse
    {
        $r = $purchaseOrder->revisions()->findOrFail($revision);
        $data = [...$r->toArray(), 'changed_by_user' => $r->changedBy?->only(['id', 'name'])];
        return response()->json($data);
    }

    private function computeDiff(array $prevData, array $newData): array
    {
        $changes = [];
        $prevHeader = $prevData['header'] ?? [];
        $newHeader = $newData['header'] ?? [];
        $prevItems = $prevData['items'] ?? [];
        $newItems = $newData['items'] ?? [];

        // Header diff — only compare known scalar fields
        $relevantFields = array_keys(self::FIELD_LABELS);
        foreach ($relevantFields as $field) {
            $oldVal = $prevHeader[$field] ?? null;
            $newVal = $newHeader[$field] ?? null;
            if ((string) $oldVal !== (string) $newVal) {
                $changes[] = [
                    'type' => 'header',
                    'field' => $field,
                    'label' => self::FIELD_LABELS[$field],
                    'oldValue' => $this->resolveLabel($field, $oldVal),
                    'newValue' => $this->resolveLabel($field, $newVal),
                ];
            }
        }

        // Item diff
        $prevIndexed = [];
        foreach ($prevItems as $item) {
            $key = $item['barang_id'] ?? $item['id'] ?? spl_object_id($item);
            $prevIndexed[$item['id']] = $item;
        }

        $newIndexed = [];
        foreach ($newItems as $item) {
            $newIndexed[$item['id']] = $item;
        }

        // Detect added items
        foreach ($newItems as $item) {
            if (!isset($prevIndexed[$item['id']])) {
                $nama = $item['barang']['nama'] ?? $item['keterangan'] ?? '-';
                $changes[] = [
                    'type' => 'item_added',
                    'label' => $nama,
                    'oldValue' => null,
                    'newValue' => ($item['jumlah'] ?? 0) . ' x Rp ' . number_format($item['harga_satuan'] ?? 0, 0),
                ];
            }
        }

        // Detect removed items
        foreach ($prevItems as $item) {
            if (!isset($newIndexed[$item['id']])) {
                $nama = $item['barang']['nama'] ?? $item['keterangan'] ?? '-';
                $changes[] = [
                    'type' => 'item_removed',
                    'label' => $nama,
                    'oldValue' => ($item['jumlah'] ?? 0) . ' x Rp ' . number_format($item['harga_satuan'] ?? 0, 0),
                    'newValue' => null,
                ];
            }
        }

        // Detect modified items
        $itemFieldLabels = [
            'jumlah' => 'Qty',
            'harga_satuan' => 'Harga',
            'diskon' => 'Diskon',
        ];
        foreach ($newItems as $item) {
            $prev = $prevIndexed[$item['id']] ?? null;
            if (!$prev) continue;
            foreach ($itemFieldLabels as $f => $label) {
                if (($prev[$f] ?? null) != ($item[$f] ?? null)) {
                    $nama = $item['barang']['nama'] ?? $item['keterangan'] ?? '-';
                    $changes[] = [
                        'type' => 'item_modified',
                        'field' => $f,
                        'label' => $nama . ' — ' . $label,
                        'oldValue' => (string) ($prev[$f] ?? '-'),
                        'newValue' => (string) ($item[$f] ?? '-'),
                    ];
                }
            }
        }

        return $changes;
    }

    private function resolveLabel(string $field, mixed $value): string
    {
        if ($value === null || $value === '') return '-';
        return match ($field) {
            'vendor_id' => Vendor::find($value)?->nama ?? $value,
            'client_id' => Client::find($value)?->nama ?? $value,
            'project_id' => Project::find($value)?->nama ?? $value,
            'tanggal_po', 'tanggal_kirim_expected', 'tanggal_disetujui' => \Carbon\Carbon::parse($value)->format('d/m/Y'),
            'disetujui_oleh' => \App\Models\User::find($value)?->name ?? $value,
            'dibuat_oleh' => \App\Models\User::find($value)?->name ?? $value,
            'diskon' => 'Rp ' . number_format((float) $value, 0),
            'status' => match ($value) {
                'draft' => 'Draft',
                'dikirim' => 'Dikirim',
                'disetujui' => 'Disetujui',
                'diterima' => 'Diterima',
                'diterima_sebagian' => 'Diterima Sebagian',
                'dibatalkan' => 'Dibatalkan',
                default => $value,
            },
            default => $value,
        };
    }
}
