<?php

namespace App\Services;

use App\Models\PermintaanPembelian;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KodePPService
{
    public function generate(): string
    {
        $now = now();
        $year = $now->format('Y');
        $month = $now->format('n');
        $romawi = $this->toRomawi($month);
        $prefix = "PP-{$year}-{$romawi}-";

        return DB::transaction(function () use ($prefix) {
            $setting = DB::table('settings')
                ->where('group', 'kode_pp')
                ->lockForUpdate()
                ->first();

            $urutan = 1;

            if ($setting) {
                $data = is_string($setting->data) ? json_decode($setting->data, true) : $setting->data;
                $lastMonth = $data['bulan'] ?? null;
                $urutan = $lastMonth === now()->format('Y-m')
                    ? ($data['urutan_terakhir'] ?? 0) + 1
                    : 1;
            }

            $kode = $prefix . str_pad($urutan, 4, '0', STR_PAD_LEFT);

            $payload = json_encode([
                'bulan' => now()->format('Y-m'),
                'urutan_terakhir' => $urutan,
            ]);

            if ($setting) {
                DB::table('settings')
                    ->where('group', 'kode_pp')
                    ->update(['data' => $payload]);
            } else {
                DB::table('settings')->insert([
                    'id' => (string) Str::uuid(),
                    'group' => 'kode_pp',
                    'data' => $payload,
                ]);
            }

            return $kode;
        });
    }

    private function toRomawi(int $angka): string
    {
        $romawi = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return $romawi[$angka] ?? (string) $angka;
    }
}