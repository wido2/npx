<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::userRoutes(['middleware' => ['api', 'auth:sanctum']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{id}', function ($user, $id) {
    return Conversation::where('id', $id)
        ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
        ->exists() ? $user->only('id', 'name') : false;
});
