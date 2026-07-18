<?php

namespace App\Notifications;

use App\Models\Barang;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockMinimum extends Notification
{
    use Queueable;

    public function __construct(
        public Barang $barang,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Stok Minimum',
            'message' => "Stok {$this->barang->nama} ({$this->barang->kode}) tersisa {$this->barang->stok} (minimum: {$this->barang->stok_minimum}).",
            'action_url' => "/barang/{$this->barang->id}",
            'action_text' => 'Lihat Barang',
            'type' => 'stock_minimum',
            'barang_id' => $this->barang->id,
            'barang_kode' => $this->barang->kode,
            'barang_nama' => $this->barang->nama,
            'stok' => $this->barang->stok,
            'stok_minimum' => $this->barang->stok_minimum,
        ];
    }
}
