<?php

namespace App\Notifications;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class POOverdue extends Notification
{
    use Queueable;

    public function __construct(
        public PurchaseOrder $po,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'PO Overdue',
            'message' => "PO {$this->po->kode} dari {$this->po->vendor?->nama} melewati tanggal kirim expected ({$this->po->tanggal_kirim_expected?->format('d M Y')}) dan belum diterima.",
            'action_url' => "/purchase-order/{$this->po->id}",
            'action_text' => 'Lihat PO',
            'type' => 'po_overdue',
            'po_id' => $this->po->id,
            'po_kode' => $this->po->kode,
            'vendor_nama' => $this->po->vendor?->nama,
            'tanggal_kirim_expected' => $this->po->tanggal_kirim_expected?->toDateString(),
        ];
    }
}
