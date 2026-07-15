<?php

if (!function_exists('terbilang')) {
    function terbilang(int|float $angka): string
    {
        if ($angka == 0) return 'Nol Rupiah';

        $satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
        $belasan = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
        $puluhan = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
        $besar = ['', 'ribu', 'juta', 'miliar', 'triliun'];

        $angka = (int) $angka;
        $result = '';
        $chunkIndex = 0;

        while ($angka > 0) {
            $chunk = $angka % 1000;
            if ($chunk > 0) {
                $words = '';
                if ($chunk >= 100) {
                    if ($chunk >= 200) {
                        $words .= $satuan[(int) ($chunk / 100)] . ' ratus ';
                    } else {
                        $words .= 'seratus ';
                    }
                    $chunk %= 100;
                }
                if ($chunk >= 20) {
                    $words .= $puluhan[(int) ($chunk / 10)] . ' ';
                    $chunk %= 10;
                } elseif ($chunk >= 10) {
                    $words .= $belasan[$chunk - 10] . ' ';
                    $chunk = 0;
                }
                if ($chunk > 0) {
                    $words .= $satuan[$chunk] . ' ';
                }
                if ($chunkIndex === 1 && $chunk === 1 && !$words) {
                    $result = 'seribu ' . $result;
                } else {
                    $result = trim($words) . ' ' . $besar[$chunkIndex] . ' ' . $result;
                }
            }
            $angka = (int) ($angka / 1000);
            $chunkIndex++;
        }

        $output = trim($result) . ' Rupiah';
        return ucwords($output);
    }
}
