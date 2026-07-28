<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignUuid('permintaan_pembelian_id')
                ->nullable()
                ->constrained(table: 'permintaan_pembelian', indexName: 'po_pp_id_foreign')
                ->nullOnDelete()
                ->after('vendor_id');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['permintaan_pembelian_id']);
            $table->dropColumn('permintaan_pembelian_id');
        });
    }
};
