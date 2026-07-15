<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // PO
            'po.create', 'po.view_own', 'po.view_all', 'po.edit', 'po.delete',
            'po.submit', 'po.approve', 'po.receive', 'po.cancel',

            // Master Data
            'master.vendor.create', 'master.vendor.view', 'master.vendor.edit', 'master.vendor.delete',
            'master.barang.create', 'master.barang.view', 'master.barang.edit', 'master.barang.delete',
            'master.client.create', 'master.client.view', 'master.client.edit', 'master.client.delete',
            'master.project.create', 'master.project.view', 'master.project.edit', 'master.project.delete',
            'master.unit.view', 'master.unit.create', 'master.unit.edit', 'master.unit.delete',
            'master.kategori.view', 'master.kategori.create', 'master.kategori.edit', 'master.kategori.delete',

            // Settings
            'settings.view', 'settings.update',

            // Users
            'users.view', 'users.manage',

            // Reports
            'reports.view',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions($permissions);

        $manager = Role::findOrCreate('manager', 'web');
        $manager->syncPermissions([
            'po.create', 'po.view_own', 'po.view_all', 'po.edit', 'po.delete',
            'po.submit', 'po.approve', 'po.receive', 'po.cancel',

            'master.vendor.create', 'master.vendor.view', 'master.vendor.edit', 'master.vendor.delete',
            'master.barang.create', 'master.barang.view', 'master.barang.edit', 'master.barang.delete',
            'master.client.create', 'master.client.view', 'master.client.edit', 'master.client.delete',
            'master.project.create', 'master.project.view', 'master.project.edit', 'master.project.delete',
            'master.unit.view', 'master.unit.create', 'master.unit.edit', 'master.unit.delete',
            'master.kategori.view', 'master.kategori.create', 'master.kategori.edit', 'master.kategori.delete',

            'settings.view', 'settings.update',
            'users.view', 'users.manage',

            'reports.view',
        ]);

        $user = Role::findOrCreate('user', 'web');
        $user->syncPermissions([
            'po.create', 'po.view_own', 'po.edit', 'po.submit',
            'master.vendor.view', 'master.barang.view', 'master.client.view', 'master.project.view',
            'master.unit.view', 'master.kategori.view',
            'reports.view',
        ]);

        $admin = User::where('email', 'admin@gmail.com')->first();
        if ($admin) {
            $admin->assignRole('super_admin');
        }
    }
}
