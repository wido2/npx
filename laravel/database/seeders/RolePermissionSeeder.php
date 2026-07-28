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

            'pp.create', 'pp.view_all', 'pp.edit', 'pp.submit', 'pp.verify', 'pp.cancel', 'pp.delete',
            'pp.create_po',

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

            // PL - Pembelian Langsung
            'pl.create', 'pl.view_own', 'pl.view_all', 'pl.edit', 'pl.delete',

            // PB - Pengambilan Barang
            'pb.create', 'pb.view_own', 'pb.view_all', 'pb.delete',

            // Inventory
            'inventory.view', 'inventory.opname',

            // Settings
            'settings.general.view', 'settings.general.update',
            'settings.alamat.view', 'settings.alamat.update',
            'settings.purchase_order.view', 'settings.purchase_order.update',
            'settings.pengambilan_barang.view', 'settings.pengambilan_barang.update',
            'settings.pembelian_langsung.view', 'settings.pembelian_langsung.update',
            'settings.stok_opname.view', 'settings.stok_opname.update',
            'settings.pdf.view', 'settings.pdf.update',

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
            'notification.project_created',
            'notification.client_created',
            'notification.pp_submitted',
            'notification.pp_verified',
            'notification.pp_rejected',

            // Widget
            'widget.chart_area_interactive',
            'widget.barang_overview',
            'widget.po_overview',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',

            'widget.recent_po', 'widget.recent_pb', 'widget.aging_po', 'widget.top_vendor', 'widget.low_stock', 'widget.recent_harga_update',
            'widget.aktivitas_terbaru',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions(Permission::all());

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

            'pl.create', 'pl.view_own', 'pl.view_all', 'pl.edit', 'pl.delete',
            'pb.create', 'pb.view_own', 'pb.view_all', 'pb.delete',
            'inventory.view', 'inventory.opname',
            'settings.general.view', 'settings.general.update',
            'settings.alamat.view', 'settings.alamat.update',
            'settings.purchase_order.view', 'settings.purchase_order.update',
            'settings.pengambilan_barang.view', 'settings.pengambilan_barang.update',
            'settings.pembelian_langsung.view', 'settings.pembelian_langsung.update',
            'settings.stok_opname.view', 'settings.stok_opname.update',
            'settings.pdf.view', 'settings.pdf.update',
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
            'notification.project_created',
            'notification.client_created',
            'notification.pp_submitted',
            'notification.pp_verified',
            'notification.pp_rejected',

            'widget.chart_area_interactive',
            'widget.barang_overview',
            'widget.po_overview',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',

            'widget.recent_po', 'widget.recent_pb', 'widget.aging_po', 'widget.top_vendor', 'widget.low_stock', 'widget.recent_harga_update',
            'widget.aktivitas_terbaru',
        ]);

        $user = Role::findOrCreate('user', 'web');
        $user->syncPermissions([
            'po.create', 'po.view_own', 'po.edit', 'po.submit',
            'pp.create', 'pp.view_all', 'pp.edit', 'pp.submit',
            'pl.create', 'pl.view_own',
            'pb.create', 'pb.view_own', 'pb.delete',
            'inventory.view',
            'master.vendor.view', 'master.barang.view', 'master.client.view', 'master.project.view',
            'master.unit.view', 'master.kategori.view',
            'master.karyawan.view', 'master.karyawan.create', 'master.karyawan.edit', 'master.karyawan.delete',
            'master.alamat.view', 'master.kontak.view',
            'reports.view',

            'widget.chart_area_interactive',
            'widget.barang_overview',
            'widget.vendor_summary', 'widget.client_summary', 'widget.project_summary', 'widget.karyawan_summary',

            'widget.recent_po', 'widget.recent_pb', 'widget.recent_harga_update', 'widget.aktivitas_terbaru',
        ]);

        $admin = User::where('email', 'admin@gmail.com')->first();
        if ($admin) {
            $admin->assignRole('super_admin');
        }
    }
}
