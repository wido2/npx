<?php

namespace App\Notifications;

use App\Models\PermintaanPembelian;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PPVerified extends Notification
{
    use Queueable;

    public function __construct(
        public PermintaanPembelian $pp,
        public string $verifiedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PP Diverifikasi',
            'message' => "Permintaan Pembelian {$this->pp->kode} telah diverifikasi oleh {$this->verifiedByName}.",
            'action_url' => "/permintaan-pembelian/{$this->pp->id}",
            'action_text' => 'Lihat PP',
            'type' => 'pp_verified',
            'pp_id' => $this->pp->id,
            'pp_kode' => $this->pp->kode,
        ];
    }
}
