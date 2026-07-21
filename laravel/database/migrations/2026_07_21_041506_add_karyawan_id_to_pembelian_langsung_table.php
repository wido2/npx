<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembelian_langsung', function (Blueprint $table) {
            $table->foreignUuid('karyawan_id')->nullable()->after('vendor_id')->constrained('karyawans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pembelian_langsung', function (Blueprint $table) {
            $table->dropForeign(['karyawan_id']);
            $table->dropColumn('karyawan_id');
        });
    }
};
