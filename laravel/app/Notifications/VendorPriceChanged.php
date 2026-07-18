<?php

namespace App\Notifications;

use App\Models\Barang;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VendorPriceChanged extends Notification
{
    use Queueable;

    public function __construct(
        public Barang $barang,
        public string $vendorNama,
        public float $hargaLama,
        public float $hargaBaru,
        public string $referensi,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Harga Supplier Berubah',
            'message' => "Harga {$this->barang->nama} dari {$this->vendorNama} berubah: Rp " . number_format($this->hargaLama, 0, ',', '.') . " → Rp " . number_format($this->hargaBaru, 0, ',', '.') . " ({$this->referensi}).",
            'action_url' => "/barang/{$this->barang->id}",
            'action_text' => 'Lihat Barang',
            'type' => 'vendor_price_changed',
            'barang_id' => $this->barang->id,
            'barang_kode' => $this->barang->kode,
            'barang_nama' => $this->barang->nama,
            'vendor_nama' => $this->vendorNama,
            'harga_lama' => $this->hargaLama,
            'harga_baru' => $this->hargaBaru,
            'referensi' => $this->referensi,
        ];
    }
}
