<?php

namespace App\Notifications;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class POReceived extends Notification
{
    use Queueable;

    public function __construct(
        public PurchaseOrder $po,
        public string $receivedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PO Diterima',
            'message' => "PO {$this->po->kode} dari {$this->po->vendor?->nama} telah diterima oleh {$this->receivedByName}.",
            'action_url' => "/purchase-order/{$this->po->id}",
            'action_text' => 'Lihat PO',
            'type' => 'po_received',
            'po_id' => $this->po->id,
            'po_kode' => $this->po->kode,
            'vendor_nama' => $this->po->vendor?->nama,
        ];
    }
}
