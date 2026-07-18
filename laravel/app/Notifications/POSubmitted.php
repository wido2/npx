<?php

namespace App\Notifications;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class POSubmitted extends Notification
{
    use Queueable;

    public function __construct(
        public PurchaseOrder $po,
        public string $submittedByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PO Dikirim',
            'message' => "PO {$this->po->kode} dari {$this->po->vendor?->nama} telah dikirim oleh {$this->submittedByName} dan menunggu persetujuan.",
            'action_url' => "/purchase-order/{$this->po->id}",
            'action_text' => 'Setujui PO',
            'type' => 'po_submitted',
            'po_id' => $this->po->id,
            'po_kode' => $this->po->kode,
            'vendor_nama' => $this->po->vendor?->nama,
        ];
    }
}
