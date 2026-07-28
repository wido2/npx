<?php

namespace App\Notifications;

use App\Models\PermintaanPembelian;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PPRejected extends Notification
{
    use Queueable;

    public function __construct(
        public PermintaanPembelian $pp,
        public string $rejectedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PP Ditolak',
            'message' => "Permintaan Pembelian {$this->pp->kode} telah ditolak oleh {$this->rejectedByName}.",
            'action_url' => "/permintaan-pembelian/{$this->pp->id}",
            'action_text' => 'Lihat PP',
            'type' => 'pp_rejected',
            'pp_id' => $this->pp->id,
            'pp_kode' => $this->pp->kode,
        ];
    }
}
