<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->uuid('kategori_id');
            $table->uuid('unit_id');
            $table->decimal('harga_beli', 15, 2)->default(0);
            $table->integer('stok')->default(0);
            $table->integer('stok_minimum')->nullable()->default(0);
            $table->string('gambar')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->foreign('kategori_id')->references('id')->on('kategori_barang')->onDelete('restrict');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barangs');
    }
};
