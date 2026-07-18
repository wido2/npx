<?php

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Notifications\POOverdue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('po:check-overdue', function () {
    $overduePOs = PurchaseOrder::with('vendor')
        ->whereIn('status', ['disetujui', 'dikirim'])
        ->whereNotNull('tanggal_kirim_expected')
        ->where('tanggal_kirim_expected', '<', now()->subDay())
        ->get();

    if ($overduePOs->isEmpty()) {
        $this->info('No overdue POs found.');
        return;
    }

    $users = User::permission('notification.po_overdue')->get();

    if ($users->isEmpty()) {
        $this->warn('No users with notification.po_overdue permission.');
        return;
    }

    foreach ($overduePOs as $po) {
        Notification::send($users, new POOverdue($po));
    }

    $this->info("Sent {$overduePOs->count()} overdue PO notification(s) to {$users->count()} user(s).");
})->purpose('Notify about POs past expected delivery date');

Schedule::command('po:check-overdue')->dailyAt('08:00');
