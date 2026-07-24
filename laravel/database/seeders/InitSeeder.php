<?php

namespace Database\Seeders;

use App\Models\KategoriBarang;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InitSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsers();
        $this->seedRolesAndPermissions();
        $this->seedUnits();
        $this->seedCategories();
    }

    protected function seedUsers(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('220716'),
            ]
        );
    }

    protected function seedRolesAndPermissions(): void
    {
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'po.create', 'po.view_own', 'po.view_all', 'po.edit', 'po.delete',
            'po.submit', 'po.approve', 'po.receive', 'po.cancel',

            'master.vendor.create', 'master.vendor.view', 'master.vendor.edit', 'master.vendor.delete',
            'master.barang.create', 'master.barang.view', 'master.barang.edit', 'master.barang.delete', 'master.barang.update_harga',
            'master.client.create', 'master.client.view', 'master.client.edit', 'master.client.delete',
            'master.project.create', 'master.project.view', 'master.project.edit', 'master.project.delete',
            'master.unit.view', 'master.unit.create', 'master.unit.edit', 'master.unit.delete',
            'master.kategori.view', 'master.kategori.create', 'master.kategori.edit', 'master.kategori.delete',
            'master.karyawan.view', 'master.karyawan.create', 'master.karyawan.edit', 'master.karyawan.delete',
            'master.alamat.view', 'master.alamat.create', 'master.alamat.edit', 'master.alamat.delete',
            'master.kontak.view', 'master.kontak.create', 'master.kontak.edit', 'master.kontak.delete',

            'pl.create', 'pl.view_own', 'pl.view_all', 'pl.edit', 'pl.delete',

            'pb.create', 'pb.view_own', 'pb.view_all', 'pb.delete',

            'inventory.view', 'inventory.opname',

            'settings.view', 'settings.update',

            'users.view', 'users.manage',

            'reports.view',

            'notification.po_submitted', 'notification.po_approved', 'notification.po_received',
            'notification.po_overdue', 'notification.pb_created', 'notification.stock_minimum',
            'notification.stock_opname', 'notification.vendor_price_changed',
            'notification.project_created', 'notification.client_created',

            'widget.section_cards', 'widget.chart_area_interactive', 'widget.data_table',
            'widget.report_cards', 'widget.inventory_laporan', 'widget.barang_history',
            'widget.barang_overview', 'widget.po_overview', 'widget.barang_report_cards',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',
            'widget.po_status_chart', 'widget.barang_kategori_chart',
            'widget.recent_po', 'widget.recent_pb', 'widget.aging_po', 'widget.top_vendor', 'widget.low_stock',
            'widget.aktivitas_terbaru',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions($permissions);

        $manager = Role::findOrCreate('manager', 'web');
        $manager->syncPermissions($permissions);

        $user = Role::findOrCreate('user', 'web');
        $user->syncPermissions([
            'po.create', 'po.view_own', 'po.edit', 'po.submit',
            'pl.create', 'pl.view_own',
            'pb.create', 'pb.view_own', 'pb.delete',
            'inventory.view',
            'master.vendor.view', 'master.barang.view', 'master.client.view', 'master.project.view',
            'master.unit.view', 'master.kategori.view',
            'master.karyawan.view', 'master.karyawan.create', 'master.karyawan.edit', 'master.karyawan.delete',
            'master.alamat.view', 'master.kontak.view',
            'reports.view',
            'widget.section_cards', 'widget.chart_area_interactive', 'widget.data_table',
            'widget.report_cards', 'widget.inventory_laporan', 'widget.barang_history',
            'widget.barang_overview',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',
            'widget.po_status_chart', 'widget.barang_kategori_chart',
            'widget.recent_po', 'widget.recent_pb', 'widget.aktivitas_terbaru',
        ]);

        $admin = User::where('email', 'admin@gmail.com')->first();
        if ($admin) {
            $admin->assignRole('super_admin');
        }
    }

    protected function seedUnits(): void
    {
        $units = [
            ['nama' => 'Pieces', 'singkatan' => 'pcs'],
            ['nama' => 'Kilogram', 'singkatan' => 'kg'],
            ['nama' => 'Meter', 'singkatan' => 'm'],
            ['nama' => 'Lembar', 'singkatan' => 'lbr'],
            ['nama' => 'Liter', 'singkatan' => 'L'],
            ['nama' => 'Roll', 'singkatan' => 'rol'],
            ['nama' => 'Set', 'singkatan' => 'set'],
            ['nama' => 'Box', 'singkatan' => 'box'],
            ['nama' => 'Batang', 'singkatan' => 'btg'],
            ['nama' => 'Pasang', 'singkatan' => 'psg'],
        ];

        foreach ($units as $u) {
            Unit::firstOrCreate(
                ['nama' => $u['nama']],
                [
                    'id' => (string) Str::uuid(),
                    'singkatan' => $u['singkatan'],
                ]
            );
        }
    }

    protected function seedCategories(): void
    {
        $kategoris = [
            ['nama' => 'Elektroda & Kawat Las', 'deskripsi' => 'Berbagai jenis elektroda dan kawat las'],
            ['nama' => 'Pelat Baja', 'deskripsi' => 'Pelat baja karbon dan baja paduan'],
            ['nama' => 'Pipa & Fitting', 'deskripsi' => 'Pipa seamless, ERW, dan perlengkapannya'],
            ['nama' => 'Alat K3', 'deskripsi' => 'Alat keselamatan dan keamanan kerja'],
            ['nama' => 'Peralatan Las', 'deskripsi' => 'Mesin las dan perlengkapannya'],
            ['nama' => 'Komponen Boiler', 'deskripsi' => 'Suku cadang dan komponen boiler'],
            ['nama' => 'Besi Profil', 'deskripsi' => 'Besi siku, UNP, H-Beam, dan profil lainnya'],
            ['nama' => 'Alat Ukur & Inspeksi', 'deskripsi' => 'Alat ukur presisi dan inspeksi'],
            ['nama' => 'Perlengkapan Bengkel', 'deskripsi' => 'Alat bantu kerja bengkel'],
            ['nama' => 'Bahan Kimia', 'deskripsi' => 'Bahan kimia untuk pengelasan dan fabrikasi'],
        ];

        foreach ($kategoris as $k) {
            KategoriBarang::firstOrCreate(
                ['nama' => $k['nama']],
                [
                    'id' => (string) Str::uuid(),
                    'deskripsi' => $k['deskripsi'],
                ]
            );
        }
    }
}
