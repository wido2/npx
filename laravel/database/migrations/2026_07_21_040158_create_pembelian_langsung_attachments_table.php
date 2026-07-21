<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembelian_langsung_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pembelian_langsung_id')->constrained('pembelian_langsung')->cascadeOnDelete();
            $table->string('nama_file');
            $table->string('path');
            $table->string('mime_type', 100)->nullable();
            $table->integer('ukuran')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembelian_langsung_attachments');
    }
};
