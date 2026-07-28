<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permintaan_pembelian_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('permintaan_pembelian_id')->constrained('permintaan_pembelian')->cascadeOnDelete();
            $table->foreignUuid('barang_id')->constrained('barangs')->restrictOnDelete();
            $table->integer('jumlah_diminta');
            $table->integer('jumlah_disetujui')->nullable();
            $table->text('catatan')->nullable();
            $table->text('catatan_logistik')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permintaan_pembelian_items');
    }
};