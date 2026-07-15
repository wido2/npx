<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('bio')->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('bio');
            $table->string('facebook')->nullable()->after('avatar');
            $table->string('instagram')->nullable()->after('facebook');
            $table->string('twitter')->nullable()->after('instagram');
            $table->string('linkedin')->nullable()->after('twitter');
            $table->string('whatsapp')->nullable()->after('linkedin');
            $table->string('telegram')->nullable()->after('whatsapp');
            $table->string('tiktok')->nullable()->after('telegram');
            $table->string('youtube')->nullable()->after('tiktok');
            $table->string('github')->nullable()->after('youtube');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'bio', 'avatar',
                'facebook', 'instagram', 'twitter', 'linkedin',
                'whatsapp', 'telegram', 'tiktok', 'youtube', 'github',
            ]);
        });
    }
};
