<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengambilan_barang', function (Blueprint $table) {
            $table->foreignUuid('karyawan_id')->nullable()->constrained('karyawans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pengambilan_barang', function (Blueprint $table) {
            $table->dropForeign(['karyawan_id']);
            $table->dropColumn('karyawan_id');
        });
    }
};
