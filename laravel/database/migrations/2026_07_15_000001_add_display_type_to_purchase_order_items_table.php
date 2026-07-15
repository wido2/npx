<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->string('display_type')->nullable()->after('purchase_order_id');
            $table->integer('urutan')->default(0)->after('display_type');
            $table->foreignUuid('barang_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn(['display_type', 'urutan']);
            $table->foreignUuid('barang_id')->nullable(false)->change();
        });
    }
};
