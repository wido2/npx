<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('harga_suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('barang_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained()->cascadeOnDelete();
            $table->decimal('harga_beli', 15, 2);
            $table->string('mata_uang', 3)->default('IDR');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['barang_id', 'vendor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harga_suppliers');
    }
};
