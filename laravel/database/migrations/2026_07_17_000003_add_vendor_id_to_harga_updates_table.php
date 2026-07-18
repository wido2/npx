<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('harga_updates', function (Blueprint $table) {
            $table->foreignUuid('vendor_id')->nullable()->after('keterangan')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('harga_updates', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
            $table->dropColumn('vendor_id');
        });
    }
};
