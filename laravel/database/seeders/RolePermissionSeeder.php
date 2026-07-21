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
            'master.barang.create', 'master.barang.view', 'master.barang.edit', 'master.barang.delete', 'master.barang.update_harga',
            'master.client.create', 'master.client.view', 'master.client.edit', 'master.client.delete',
            'master.project.create', 'master.project.view', 'master.project.edit', 'master.project.delete',
            'master.unit.view', 'master.unit.create', 'master.unit.edit', 'master.unit.delete',
            'master.kategori.view', 'master.kategori.create', 'master.kategori.edit', 'master.kategori.delete',
            'master.karyawan.view', 'master.karyawan.create', 'master.karyawan.edit', 'master.karyawan.delete',
            'master.alamat.view', 'master.alamat.create', 'master.alamat.edit', 'master.alamat.delete',
            'master.kontak.view', 'master.kontak.create', 'master.kontak.edit', 'master.kontak.delete',

            // PB - Pengambilan Barang
            'pb.create', 'pb.view_own', 'pb.view_all', 'pb.delete',

            // Inventory
            'inventory.view', 'inventory.opname',

            // Settings
            'settings.view', 'settings.update',

            // Users
            'users.view', 'users.manage',

            // Reports
            'reports.view',

            // Notifications
            'notification.po_submitted',
            'notification.po_approved',
            'notification.po_received',
            'notification.po_overdue',
            'notification.pb_created',
            'notification.stock_minimum',
            'notification.stock_opname',
            'notification.vendor_price_changed',

            // Widget
            'widget.section_cards', 'widget.chart_area_interactive', 'widget.data_table',
            'widget.report_cards', 'widget.inventory_laporan', 'widget.barang_history',
            'widget.barang_overview',
            'widget.po_overview',
            'widget.barang_report_cards',
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
        $manager->syncPermissions([
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

            'pb.create', 'pb.view_own', 'pb.view_all', 'pb.delete',
            'inventory.view', 'inventory.opname',
            'settings.view', 'settings.update',
            'users.view', 'users.manage',

            'reports.view',

            'notification.po_submitted',
            'notification.po_approved',
            'notification.po_received',
            'notification.po_overdue',
            'notification.pb_created',
            'notification.stock_minimum',
            'notification.stock_opname',
            'notification.vendor_price_changed',

            'widget.section_cards', 'widget.chart_area_interactive', 'widget.data_table',
            'widget.report_cards', 'widget.inventory_laporan', 'widget.barang_history',
            'widget.barang_overview',
            'widget.po_overview',
            'widget.barang_report_cards',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',
            'widget.po_status_chart', 'widget.barang_kategori_chart',
            'widget.recent_po', 'widget.recent_pb', 'widget.aging_po', 'widget.top_vendor', 'widget.low_stock',
            'widget.aktivitas_terbaru',
        ]);

        $user = Role::findOrCreate('user', 'web');
        $user->syncPermissions([
            'po.create', 'po.view_own', 'po.edit', 'po.submit',
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
}
