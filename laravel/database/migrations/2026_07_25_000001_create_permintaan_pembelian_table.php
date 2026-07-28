<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permintaan_pembelian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode')->unique()->nullable();
            $table->foreignUuid('dibuat_oleh')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained()->nullOnDelete();
            $table->date('tanggal_diminta');
            $table->date('tanggal_diperlukan')->nullable();
            $table->string('status')->default('draft');
            $table->text('catatan')->nullable();
            $table->text('alasan_ditolak')->nullable();
            $table->foreignUuid('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('tanggal_diverifikasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permintaan_pembelian');
    }
};