<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with(['lastMessage.sender:id,name', 'users:id,name'])
            ->orderByDesc(
                Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->limit(1)
            )
            ->get();

        return response()->json($conversations);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $userIds = array_merge($request->user_ids, [$request->user()->id]);
        sort($userIds);
        $userIds = array_unique($userIds);

        if (count($userIds) === 2) {
            $existing = Conversation::where('type', 'individual')
                ->whereHas('users', fn($q) => $q->where('user_id', $userIds[0]))
                ->whereHas('users', fn($q) => $q->where('user_id', $userIds[1]))
                ->whereDoesntHave('users', fn($q) => $q->whereNotIn('user_id', $userIds))
                ->first();

            if ($existing) {
                return response()->json($existing->load('users:id,name'));
            }
        }

        $conversation = DB::transaction(function () use ($request, $userIds) {
            $conversation = Conversation::create([
                'type' => count($userIds) === 2 ? 'individual' : 'group',
            ]);

            $conversation->users()->attach($userIds);

            return $conversation;
        });

        return response()->json($conversation->load('users:id,name'), 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$conversation->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($conversation->load('users:id,name'));
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$conversation->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,name')
            ->latest()
            ->paginate(50);

        $conversation->users()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        return response()->json($messages);
    }

    public function storeMessage(Request $request, Conversation $conversation): JsonResponse
    {
        if (!$conversation->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'message' => 'required_without:file|string',
            'type' => 'nullable|string|in:text,image,file',
            'file' => 'nullable|file|max:10240',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('chat-files', 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'message' => $request->message ?? '',
            'type' => $request->type ?? ($request->hasFile('file') ? 'image' : 'text'),
            'file_path' => $filePath,
        ]);

        return response()->json($message->load('sender:id,name'), 201);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with(['lastMessage.sender:id,name', 'users:id,name'])
            ->orderByDesc(
                Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->limit(1)
            )
            ->get();

        $totalUnread = 0;
        $unreadItems = [];

        foreach ($conversations as $conv) {
            $lastMsg = $conv->lastMessage;
            if (!$lastMsg) continue;

            $lastReadAt = $conv->pivot->last_read_at;
            if ($lastReadAt && $lastReadAt >= $lastMsg->created_at) continue;

            $otherName = $conv->users
                ->first(fn($u) => $u->id !== $user->id)?->name
                ?? $conv->name
                ?? 'Unknown';

            $unreadItems[] = [
                'id' => $conv->id,
                'conversation_id' => $conv->id,
                'username' => $otherName,
                'last_message' => $lastMsg->message,
                'last_message_at' => $lastMsg->created_at,
                'sender_id' => $lastMsg->sender_id,
                'sender_name' => $lastMsg->sender?->name,
            ];
            $totalUnread++;
        }

        return response()->json([
            'total_unread' => $totalUnread,
            'unread_items' => $unreadItems,
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::select('id', 'name', 'email')
            ->where('id', '!=', $request->user()->id)
            ->get();

        return response()->json($users);
    }
}
