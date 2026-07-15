<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('contactable_id');
            $table->string('contactable_type');
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->string('telepon')->nullable();
            $table->string('hp')->nullable();
            $table->string('email')->nullable();
            $table->boolean('utama')->default(false);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['contactable_id', 'contactable_type']);
        });

        if (Schema::hasTable('vendor_contacts')) {
            DB::statement(
                "INSERT INTO contacts (id, contactable_id, contactable_type, nama, jabatan, telepon, hp, email, utama, aktif, created_at, updated_at)
                 SELECT id, vendor_id, 'App\\Models\\Vendor', nama, jabatan, telepon, hp, email, utama, aktif, created_at, updated_at
                 FROM vendor_contacts"
            );
        }

        Schema::dropIfExists('vendor_contacts');
    }

    public function down(): void
    {
        Schema::create('vendor_contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vendor_id');
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->string('telepon')->nullable();
            $table->string('hp')->nullable();
            $table->string('email')->nullable();
            $table->boolean('utama')->default(false);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
        });

        DB::statement(
            "INSERT INTO vendor_contacts (id, vendor_id, nama, jabatan, telepon, hp, email, utama, aktif, created_at, updated_at)
             SELECT id, contactable_id, nama, jabatan, telepon, hp, email, utama, aktif, created_at, updated_at
             FROM contacts
             WHERE contactable_type = 'App\\Models\\Vendor'"
        );

        Schema::dropIfExists('contacts');
    }
};
