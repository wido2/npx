<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public string $recipientId;
    public array $data;

    public function __construct(Message $message, string $recipientId)
    {
        $this->recipientId = $recipientId;
        $this->data = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender?->name,
            'message' => $message->message,
            'created_at' => $message->created_at,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewChatMessage';
    }
}
