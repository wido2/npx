<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class KodePOService
{
    public function generate(?\Carbon\Carbon $tanggal = null): string
    {
        $tanggal ??= now();

        return DB::transaction(function () use ($tanggal) {
            $setting = Setting::where('group', 'purchase_order')
                ->lockForUpdate()
                ->firstOrFail();

            $data = $setting->data;
            $now = now();
            $thnBulan = $now->format('Ym');
            $resetPeriode = $data['reset_periode'] ?? 'bulanan';

            switch ($resetPeriode) {
                case 'tidak_pernah':
                    break;
                case 'bulanan':
                    if (($data['tahun_bulan_terakhir'] ?? null) !== $thnBulan) {
                        $data['urutan_terakhir'] = 0;
                    }
                    break;
                default:
                    $resetBulan = (int) $resetPeriode;
                    $lastYear = substr($data['tahun_bulan_terakhir'] ?? '', 0, 4);
                    $currentYear = $now->format('Y');
                    if (
                        (int) $now->format('m') === $resetBulan &&
                        $lastYear !== '' &&
                        $lastYear !== $currentYear
                    ) {
                        $data['urutan_terakhir'] = 0;
                    }
                    break;
            }

            $maxAttempts = 100;
            for ($i = 0; $i < $maxAttempts; $i++) {
                $data['urutan_terakhir'] = ($data['urutan_terakhir'] ?? 0) + 1;
                $data['tahun_bulan_terakhir'] = $thnBulan;

                $kode = str_replace(
                    ['{Y}', '{M}', '{seq}'],
                    [
                        $tanggal->format('Y'),
                        $this->toRomawi((int) $tanggal->format('m')),
                        str_pad($data['urutan_terakhir'], 4, '0', STR_PAD_LEFT),
                    ],
                    $data['format_kode'] ?? 'PO-{Y}-{M}-{seq}'
                );

                $exists = PurchaseOrder::where('kode', $kode)->exists();
                if (!$exists) {
                    $setting->update(['data' => $data]);
                    return $kode;
                }
            }

            throw new \RuntimeException("Unable to generate unique PO code after {$maxAttempts} attempts");
        });
    }

    private function toRomawi(int $angka): string
    {
        $romawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return $romawi[$angka] ?? (string) $angka;
    }
}
