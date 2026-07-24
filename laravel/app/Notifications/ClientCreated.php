<?php

namespace App\Notifications;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClientCreated extends Notification
{
    use Queueable;

    public function __construct(
        public Client $client,
        public string $createdByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Client Baru',
            'message' => "Client {$this->client->kode} - {$this->client->nama} telah dibuat oleh {$this->createdByName}.",
            'action_url' => "/client/{$this->client->id}",
            'action_text' => 'Lihat Client',
            'type' => 'client_created',
        ];
    }
}
