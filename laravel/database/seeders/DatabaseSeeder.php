<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('220716'),
        ]);

        $this->call([
            RolePermissionSeeder::class,
            VendorSeeder::class,
            ContactAndAddressSeeder::class,
            BarangSeeder::class,
            SettingSeeder::class,
            JenisPajakSeeder::class,
            PurchaseOrderSeeder::class,
        ]);
    }
}
