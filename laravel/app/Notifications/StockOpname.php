<?php

namespace App\Notifications;

use App\Models\Barang;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockOpname extends Notification
{
    use Queueable;

    public function __construct(
        public Barang $barang,
        public int $stokSebelum,
        public int $stokSesudah,
        public string $dilakukanOleh,
        public ?string $keterangan,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $selisih = $this->stokSesudah - $this->stokSebelum;
        $arah = $selisih >= 0 ? 'naik' : 'turun';

        return [
            'title' => 'Stok Opname',
            'message' => "Stok {$this->barang->nama} ({$this->barang->kode}) {$arah}: {$this->stokSebelum} → {$this->stokSesudah} oleh {$this->dilakukanOleh}." . ($this->keterangan ? " ({$this->keterangan})" : ''),
            'action_url' => "/barang/{$this->barang->id}",
            'action_text' => 'Lihat Barang',
            'type' => 'stock_opname',
            'barang_id' => $this->barang->id,
            'barang_kode' => $this->barang->kode,
            'barang_nama' => $this->barang->nama,
            'stok_sebelum' => $this->stokSebelum,
            'stok_sesudah' => $this->stokSesudah,
            'selisih' => $selisih,
        ];
    }
}
