<?php

namespace App\Notifications;

use App\Models\PengambilanBarang;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PBCreated extends Notification
{
    use Queueable;

    public function __construct(
        public PengambilanBarang $pb,
        public string $createdByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PB Baru',
            'message' => "Pengambilan Barang {$this->pb->kode} telah dibuat oleh {$this->createdByName}.",
            'action_url' => "/pengambilan-barang/{$this->pb->id}",
            'action_text' => 'Lihat PB',
            'type' => 'pb_created',
            'pb_id' => $this->pb->id,
            'pb_kode' => $this->pb->kode,
        ];
    }
}
