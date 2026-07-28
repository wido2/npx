<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->foreignUuid('permintaan_pembelian_item_id')
                ->nullable()
                ->constrained('permintaan_pembelian_items')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropForeign(['permintaan_pembelian_item_id']);
            $table->dropColumn('permintaan_pembelian_item_id');
        });
    }
};