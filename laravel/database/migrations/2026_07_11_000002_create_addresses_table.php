<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('addressable_id');
            $table->string('addressable_type');
            $table->string('label');
            $table->text('alamat');
            $table->string('provinsi');
            $table->string('kota');
            $table->string('kecamatan')->nullable();
            $table->string('kelurahan')->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->boolean('utama')->default(false);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['addressable_id', 'addressable_type']);
        });

        if (Schema::hasTable('vendor_addresses')) {
            DB::statement(
                "INSERT INTO addresses (id, addressable_id, addressable_type, label, alamat, provinsi, kota, kecamatan, kelurahan, kode_pos, utama, aktif, created_at, updated_at)
                 SELECT id, vendor_id, 'App\\Models\\Vendor', label, alamat, provinsi, kota, kecamatan, kelurahan, kode_pos, utama, aktif, created_at, updated_at
                 FROM vendor_addresses"
            );
        }

        Schema::dropIfExists('vendor_addresses');
    }

    public function down(): void
    {
        Schema::create('vendor_addresses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vendor_id');
            $table->string('label');
            $table->text('alamat');
            $table->string('provinsi');
            $table->string('kota');
            $table->string('kecamatan')->nullable();
            $table->string('kelurahan')->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->boolean('utama')->default(false);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
        });

        DB::statement(
            "INSERT INTO vendor_addresses (id, vendor_id, label, alamat, provinsi, kota, kecamatan, kelurahan, kode_pos, utama, aktif, created_at, updated_at)
             SELECT id, addressable_id, label, alamat, provinsi, kota, kecamatan, kelurahan, kode_pos, utama, aktif, created_at, updated_at
             FROM addresses
             WHERE addressable_type = 'App\\Models\\Vendor'"
        );

        Schema::dropIfExists('addresses');
    }
};
