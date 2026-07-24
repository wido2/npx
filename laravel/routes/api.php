<?php

use App\Http\Controllers\AlamatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\JenisPajakController;
use App\Http\Controllers\KategoriBarangController;
use App\Http\Controllers\KontakController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseOrderItemController;
use App\Http\Controllers\PurchaseOrderReceiptController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PurchaseOrderRevisionController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\PengambilanBarangController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportBarangController;
use App\Http\Controllers\ReportPurchaseOrderController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorAddressController;
use App\Http\Controllers\VendorContactController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\HargaSupplierController;
use App\Http\Controllers\HargaUpdateController;
use App\Http\Controllers\PembelianLangsungController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'changePassword']);

    Route::post('/register', [AuthController::class, 'register']);

    // User management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::put('/users/{user}/roles', [UserController::class, 'syncRoles']);
    Route::put('/users/{user}/permissions', [UserController::class, 'syncPermissions']);

    // Roles & Permissions
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
    Route::put('/roles/{role}', [RoleController::class, 'update']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    Route::get('/permissions', [PermissionController::class, 'index']);
});

Route::middleware('auth:sanctum')->group(function () {
    // ——— Master Data ———
    Route::get('kategori', [KategoriBarangController::class, 'index']);
    Route::post('kategori', [KategoriBarangController::class, 'store']);
    Route::get('unit', [UnitController::class, 'index']);
    Route::post('unit', [UnitController::class, 'store']);
    Route::get('vendor', [VendorController::class, 'index']);
    Route::get('vendor/{vendor}', [VendorController::class, 'show']);
    Route::delete('vendor/{vendor}', [VendorController::class, 'destroy']);
    Route::post('vendor', [VendorController::class, 'store']);
    Route::put('vendor/{vendor}', [VendorController::class, 'update']);
    Route::post('vendor/bulk-delete', [VendorController::class, 'bulkDestroy']);
    Route::get('vendor/{vendor}/addresses', [VendorAddressController::class, 'index']);
    Route::post('vendor/{vendor}/addresses', [VendorAddressController::class, 'store']);
    Route::put('addresses/{address}', [VendorAddressController::class, 'update']);
    Route::delete('addresses/{address}', [VendorAddressController::class, 'destroy']);
    Route::get('vendor/{vendor}/contacts', [VendorContactController::class, 'index']);
    Route::post('vendor/{vendor}/contacts', [VendorContactController::class, 'store']);
    Route::put('contacts/{contact}', [VendorContactController::class, 'update']);
    Route::delete('contacts/{contact}', [VendorContactController::class, 'destroy']);
    Route::post('barang/bulk-update-harga', [BarangController::class, 'bulkUpdateHarga']);
    Route::post('barang/bulk-delete', [BarangController::class, 'bulkDestroy']);
    Route::get('barang/{barang}/harga-history', [BarangController::class, 'hargaHistory']);
    Route::apiResource('barang', BarangController::class);

    // ——— Harga Update ———
    Route::get('harga-update', [\App\Http\Controllers\HargaUpdateController::class, 'index']);
    Route::post('harga-update', [\App\Http\Controllers\HargaUpdateController::class, 'store']);
    Route::get('harga-update/{hargaUpdate}', [\App\Http\Controllers\HargaUpdateController::class, 'show']);
    Route::get('riwayat-harga/terbaru', [\App\Http\Controllers\HargaUpdateController::class, 'riwayatTerbaru']);

    // ——— Harga Supplier ———
    Route::get('harga-supplier', [HargaSupplierController::class, 'index']);
    Route::post('harga-supplier', [HargaSupplierController::class, 'store']);
    Route::get('harga-supplier/{hargaSupplier}', [HargaSupplierController::class, 'show']);
    Route::put('harga-supplier/{hargaSupplier}', [HargaSupplierController::class, 'update']);
    Route::delete('harga-supplier/{hargaSupplier}', [HargaSupplierController::class, 'destroy']);
    Route::get('harga-supplier/{hargaSupplier}/history', [HargaSupplierController::class, 'history']);
    Route::apiResource('karyawan', KaryawanController::class);
    Route::get('alamat', [AlamatController::class, 'index']);
    Route::get('alamat/{address}', [AlamatController::class, 'show']);
    Route::post('alamat', [AlamatController::class, 'store']);
    Route::put('alamat/{address}', [AlamatController::class, 'update']);
    Route::delete('alamat/{address}', [AlamatController::class, 'destroy']);
    Route::post('alamat/bulk-delete', [AlamatController::class, 'bulkDestroy']);
    Route::get('kontak', [KontakController::class, 'index']);
    Route::get('kontak/{contact}', [KontakController::class, 'show']);
    Route::post('kontak', [KontakController::class, 'store']);
    Route::put('kontak/{contact}', [KontakController::class, 'update']);
    Route::delete('kontak/{contact}', [KontakController::class, 'destroy']);
    Route::post('kontak/bulk-delete', [KontakController::class, 'bulkDestroy']);

    // ——— Notifications ———
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications', [NotificationController::class, 'destroyAll']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

    // ——— Settings ———
    Route::get('settings/{group}', [SettingController::class, 'show']);
    Route::put('settings/{group}', [SettingController::class, 'update']);
    Route::post('settings/upload-logo', [SettingController::class, 'uploadLogo']);

    // ——— Jenis Pajak ———
    Route::get('jenis-pajak', [JenisPajakController::class, 'index']);
    Route::post('jenis-pajak', [JenisPajakController::class, 'store']);
    Route::get('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'show']);
    Route::put('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'update']);
    Route::delete('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'destroy']);
    Route::post('jenis-pajak/bulk-delete', [JenisPajakController::class, 'bulkDestroy']);

    // ——— Client ———
    Route::get('client', [ClientController::class, 'index']);
    Route::post('client', [ClientController::class, 'store']);
    Route::get('client/{client}', [ClientController::class, 'show']);
    Route::put('client/{client}', [ClientController::class, 'update']);
    Route::delete('client/{client}', [ClientController::class, 'destroy']);
    Route::post('client/bulk-delete', [ClientController::class, 'bulkDestroy']);

    // ——— Project ———
    Route::get('project', [ProjectController::class, 'index']);
    Route::post('project', [ProjectController::class, 'store']);
    Route::get('project/{project}', [ProjectController::class, 'show']);
    Route::put('project/{project}', [ProjectController::class, 'update']);
    Route::delete('project/{project}', [ProjectController::class, 'destroy']);
    Route::post('project/bulk-delete', [ProjectController::class, 'bulkDestroy']);

    // ——— Purchase Order ———
    Route::get('purchase-order', [PurchaseOrderController::class, 'index']);
    Route::get('purchase-order/stats', [PurchaseOrderController::class, 'stats']);
    Route::post('purchase-order', [PurchaseOrderController::class, 'store']);
    Route::get('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
    Route::put('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
    Route::delete('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
    Route::post('purchase-order/bulk-delete', [PurchaseOrderController::class, 'bulkDestroy']);

    // ——— PO Workflow ———
    Route::put('purchase-order/{purchaseOrder}/kirim', [PurchaseOrderController::class, 'kirim']);
    Route::put('purchase-order/{purchaseOrder}/setujui', [PurchaseOrderController::class, 'setujui']);
    Route::post('purchase-order/{purchaseOrder}/terima', [PurchaseOrderController::class, 'terima']);
    Route::put('purchase-order/{purchaseOrder}/batalkan', [PurchaseOrderController::class, 'batalkan']);
    Route::get('purchase-order/{purchaseOrder}/pdf', [PurchaseOrderController::class, 'pdf']);

    // ——— PO Items ———
    Route::get('purchase-order/{purchaseOrder}/items', [PurchaseOrderItemController::class, 'index']);
    Route::post('purchase-order/{purchaseOrder}/items', [PurchaseOrderItemController::class, 'store']);
    Route::put('purchase-order/{purchaseOrder}/items/{item}', [PurchaseOrderItemController::class, 'update']);
    Route::delete('purchase-order/{purchaseOrder}/items/{item}', [PurchaseOrderItemController::class, 'destroy']);
    Route::put('purchase-order/{purchaseOrder}/items/reorder', [PurchaseOrderItemController::class, 'reorder']);

    // ——— PO Receipts ———
    Route::get('purchase-order/{purchaseOrder}/receipts', [PurchaseOrderReceiptController::class, 'index']);
    Route::get('purchase-order/{purchaseOrder}/receipts/{receipt}', [PurchaseOrderReceiptController::class, 'show']);

    // ——— PO Revisions ———
    Route::get('purchase-order/{purchaseOrder}/revisions', [PurchaseOrderRevisionController::class, 'index']);
    Route::get('purchase-order/{purchaseOrder}/revisions/{revision}', [PurchaseOrderRevisionController::class, 'show']);

    // ——— Pengambilan Barang ———
    Route::get('pengambilan-barang', [PengambilanBarangController::class, 'index']);
    Route::post('pengambilan-barang', [PengambilanBarangController::class, 'store']);
    Route::get('pengambilan-barang/riwayat', [PengambilanBarangController::class, 'riwayat']);
    Route::get('pengambilan-barang/{pengambilanBarang}', [PengambilanBarangController::class, 'show']);
    Route::delete('pengambilan-barang/{pengambilanBarang}', [PengambilanBarangController::class, 'destroy']);
    Route::post('pengambilan-barang/bulk-delete', [PengambilanBarangController::class, 'bulkDestroy']);
    Route::get('pengambilan-barang/{pengambilanBarang}/pdf', [PengambilanBarangController::class, 'pdf']);

    // ——— Inventory ———
    // ——— Dashboard ———
    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('dashboard/aging-po', [DashboardController::class, 'agingPO']);

    Route::get('inventory/mutasi', [InventoryController::class, 'mutasi']);
    Route::get('inventory/stok-minimum', [InventoryController::class, 'stokMinimum']);
    Route::post('inventory/opname', [InventoryController::class, 'opname']);
    Route::get('inventory/laporan-stok', [InventoryController::class, 'laporanStok']);

    // ——— Reports ———
    Route::get('reports/purchase-order/summary', [ReportPurchaseOrderController::class, 'summary']);
    Route::get('reports/purchase-order/per-bulan', [ReportPurchaseOrderController::class, 'perBulan']);
    Route::get('reports/purchase-order/per-vendor', [ReportPurchaseOrderController::class, 'perVendor']);
    Route::get('reports/purchase-order/per-hari', [ReportPurchaseOrderController::class, 'perHari']);
    Route::get('reports/purchase-order/per-status', [ReportPurchaseOrderController::class, 'perStatus']);
    Route::get('reports/purchase-order/top-items', [ReportPurchaseOrderController::class, 'topItems']);

    Route::get('reports/barang/summary', [ReportBarangController::class, 'summary']);
    Route::get('reports/barang/per-kategori', [ReportBarangController::class, 'perKategori']);
    Route::get('reports/barang/per-status', [ReportBarangController::class, 'perStatus']);
    Route::get('reports/barang/stok-terendah', [ReportBarangController::class, 'stokTerendah']);
    Route::get('reports/barang/top-items-nilai', [ReportBarangController::class, 'topItemsByNilai']);
    Route::get('reports/barang/top-by-pengambilan', [ReportBarangController::class, 'topByPengambilan']);

    // ——— Pembelian Langsung ———
    Route::get('pembelian-langsung', [PembelianLangsungController::class, 'index']);
    Route::post('pembelian-langsung', [PembelianLangsungController::class, 'store']);
    Route::get('pembelian-langsung/{pembelianLangsung}', [PembelianLangsungController::class, 'show']);
    Route::put('pembelian-langsung/{pembelianLangsung}', [PembelianLangsungController::class, 'update']);
    Route::delete('pembelian-langsung/{pembelianLangsung}', [PembelianLangsungController::class, 'destroy']);
    Route::delete('pembelian-langsung/{pembelianLangsung}/attachments/{attachment}', [PembelianLangsungController::class, 'destroyAttachment']);

    // ——— Chat ———
    Route::get('conversations', [ChatController::class, 'index']);
    Route::post('conversations', [ChatController::class, 'store']);
    Route::get('conversations/{conversation}', [ChatController::class, 'show']);
    Route::get('conversations/{conversation}/messages', [ChatController::class, 'messages']);
    Route::post('conversations/{conversation}/messages', [ChatController::class, 'storeMessage']);
    Route::get('chat/users', [ChatController::class, 'users']);
    Route::get('chat/unread', [ChatController::class, 'unread']);
});
