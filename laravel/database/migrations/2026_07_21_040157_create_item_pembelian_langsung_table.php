<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_pembelian_langsung', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pembelian_langsung_id')->constrained('pembelian_langsung')->cascadeOnDelete();
            $table->foreignUuid('barang_id')->constrained('barangs')->restrictOnDelete();
            $table->integer('jumlah');
            $table->decimal('harga_satuan', 15, 2);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_pembelian_langsung');
    }
};
