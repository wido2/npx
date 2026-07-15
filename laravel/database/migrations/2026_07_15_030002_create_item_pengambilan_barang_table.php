<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_pengambilan_barang', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pengambilan_barang_id')->constrained('pengambilan_barang')->cascadeOnDelete();
            $table->foreignUuid('barang_id')->constrained()->restrictOnDelete();
            $table->integer('jumlah');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_pengambilan_barang');
    }
};
