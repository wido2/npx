<?php

namespace App\Notifications;

use App\Models\PermintaanPembelian;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PPSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        public PermintaanPembelian $pp,
        public string $submittedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PP Baru',
            'message' => "Permintaan Pembelian {$this->pp->kode} telah dikirim oleh {$this->submittedByName} dan menunggu verifikasi.",
            'action_url' => "/permintaan-pembelian/{$this->pp->id}",
            'action_text' => 'Verifikasi PP',
            'type' => 'pp_submitted',
            'pp_id' => $this->pp->id,
            'pp_kode' => $this->pp->kode,
        ];
    }
}
