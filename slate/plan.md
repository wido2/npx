# Purchase Order API — Laravel Backend

## Project Info

- **Location:** `/home/wido2/project/npx/laravel`
- **Framework:** Laravel 13, PHP 8.3+
- **Auth:** Laravel Sanctum (token-based)
- **Primary Keys:** UUID (using `HasUuids` trait)
- **Database:** PostgreSQL
- **Existing Models:** User, Vendor, Barang, KategoriBarang, Unit, Address (polymorphic), Contact (polymorphic)

---

## Existing API Routes (before PO system)

| Method | Endpoint | Controller |
|---|---|---|
| POST | `/api/login` | AuthController@login |
| POST | `/api/logout` | AuthController@logout |
| GET/PUT | `/api/user` | UserController@profile / updateProfile |
| PUT | `/api/user/password` | UserController@changePassword |
| GET/POST | `/api/kategori` | KategoriBarangController |
| GET/POST | `/api/unit` | UnitController |
| CRUD | `/api/vendor` | VendorController |
| CRUD | `/api/vendor/{vendor}/addresses` | VendorAddressController |
| CRUD | `/api/vendor/{vendor}/contacts` | VendorContactController |
| CRUD | `/api/barang` | BarangController (apiResource) |
| CRUD | `/api/alamat` (all addresses) | AlamatController |
| CRUD | `/api/kontak` (all contacts) | KontakController |

Models: Barang has `belongsTo KategoriBarang, Unit, Vendor`
Vendor has `morphMany Address, Contact, hasMany Barang`

---

## New Migrations (9 tables)

### 1. `settings`
```php
Schema::create('settings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('group')->unique(); // 'general', 'purchase_order'
    $table->json('data');
    $table->timestamps();
});
```

**`general` data default:**
```json
{
  "nama_perusahaan": null, "npwp": null, "telepon": null,
  "email": null, "website": null, "logo": null,
  "alamat": null, "provinsi": null, "kota": null,
  "kecamatan": null, "kelurahan": null, "kode_pos": null
}
```

**`purchase_order` data default:**
```json
{
  "format_kode": "PO-{Y}-{M}-{seq}",
  "urutan_terakhir": 0,
  "tahun_bulan_terakhir": ""
}
```

### 2. `jenis_pajak`
```php
Schema::create('jenis_pajak', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('nama');                 // PPN, PPh 23
    $table->decimal('persentase', 5, 2);   // 11.00, 2.00
    $table->text('deskripsi')->nullable();
    $table->boolean('aktif')->default(true);
    $table->timestamps();
});
```

**Seeder data:** PPN 11%, PPh 23 2%

### 3. `clients`
```php
Schema::create('clients', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('kode')->unique();
    $table->string('nama');
    $table->string('npwp')->nullable();
    $table->enum('tipe', ['perusahaan', 'perorangan'])->default('perusahaan');
    $table->string('email')->nullable();
    $table->string('telepon')->nullable();
    $table->string('website')->nullable();
    $table->text('keterangan')->nullable();
    $table->boolean('aktif')->default(true);
    $table->timestamps();
});
```

Polymorphic: `morphMany Address` (addressable), `morphMany Contact` (contactable)

### 4. `projects`
```php
Schema::create('projects', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('kode')->unique();          // input manual free text
    $table->string('nama');
    $table->foreignUuid('client_id')->constrained()->restrictOnDelete();
    $table->foreignUuid('unit_id')->constrained()->restrictOnDelete(); // pakai tabel units yg sudah ada
    $table->text('deskripsi')->nullable();
    $table->decimal('nilai_kontrak', 15, 2)->nullable();
    $table->date('tanggal_mulai')->nullable();
    $table->date('tanggal_selesai')->nullable();
    $table->string('status')->default('aktif');   // aktif, selesai, ditunda, dibatalkan
    $table->boolean('aktif')->default(true);
    $table->timestamps();
});
```

### 5. `purchase_orders` (header)
```php
Schema::create('purchase_orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('kode')->unique()->nullable(); // null saat draft, diisi saat kirim
    $table->foreignUuid('vendor_id')->constrained()->restrictOnDelete();
    $table->foreignUuid('client_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignUuid('project_id')->nullable()->constrained()->nullOnDelete();
    $table->date('tanggal_po');
    $table->date('tanggal_kirim_expected')->nullable();
    $table->string('status')->default('draft');
    $table->decimal('subtotal', 15, 2)->default(0);
    $table->decimal('diskon', 15, 2)->default(0);
    $table->decimal('total', 15, 2)->default(0);
    $table->text('catatan')->nullable();
    $table->string('syarat_pembayaran')->nullable();
    $table->text('alamat_kirim')->nullable();
    $table->foreignUuid('dibuat_oleh')->constrained('users')->restrictOnDelete();
    $table->foreignUuid('disetujui_oleh')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignUuid('diterima_oleh')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('tanggal_disetujui')->nullable();
    $table->timestamp('tanggal_diterima')->nullable();
    $table->timestamps();
});
```

### 6. `purchase_order_items`
```php
Schema::create('purchase_order_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('barang_id')->constrained()->restrictOnDelete();
    $table->integer('jumlah')->default(1);
    $table->decimal('harga_satuan', 15, 2);
    $table->decimal('diskon', 15, 2)->default(0);
    $table->decimal('subtotal', 15, 2)->default(0);
    $table->foreignUuid('jenis_pajak_id')->nullable()->constrained('jenis_pajak')->nullOnDelete();
    $table->decimal('nilai_pajak', 15, 2)->default(0);
    $table->decimal('total_setelah_pajak', 15, 2)->default(0);
    $table->text('keterangan')->nullable();
    $table->timestamps();
});
```

**Compute logic:** `subtotal = (jumlah * harga_satuan) - diskon`, `nilai_pajak = subtotal * persentase_jenis_pajak / 100`, `total_setelah_pajak = subtotal + nilai_pajak`

### 7. `purchase_order_receipts`
```php
Schema::create('purchase_order_receipts', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
    $table->string('nomor')->unique();
    $table->date('tanggal_terima');
    $table->text('catatan')->nullable();
    $table->foreignUuid('diterima_oleh')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();
});
```

### 8. `purchase_order_receipt_items`
```php
Schema::create('purchase_order_receipt_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('purchase_order_receipt_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('purchase_order_item_id')->constrained()->restrictOnDelete();
    $table->foreignUuid('barang_id')->constrained()->restrictOnDelete();
    $table->integer('jumlah_dipesan');
    $table->integer('jumlah_diterima');
    $table->text('keterangan')->nullable();
    $table->timestamps();
});
```

### 9. `purchase_order_revisions`
```php
Schema::create('purchase_order_revisions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('purchase_order_id')->constrained()->cascadeOnDelete();
    $table->integer('version');
    $table->json('data');             // snapshot PO header + items
    $table->json('changed_fields');   // field yang berubah
    $table->foreignUuid('changed_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();
});
```

---

## Models (Eloquent)

| Model | Table | Key Relations |
|---|---|---|
| `Setting` | `settings` | — |
| `JenisPajak` | `jenis_pajak` | — |
| `Client` | `clients` | `morphMany Address`, `morphMany Contact`, `hasMany Project` |
| `Project` | `projects` | `belongsTo Client`, `belongsTo Unit` |
| `PurchaseOrder` | `purchase_orders` | `belongsTo Vendor, Client, Project, User (dibuat/disetujui/diterima)`, `hasMany Items, Receipts, Revisions` |
| `PurchaseOrderItem` | `purchase_order_items` | `belongsTo PurchaseOrder, Barang, JenisPajak`, `hasMany ReceiptItems` |
| `PurchaseOrderReceipt` | `purchase_order_receipts` | `belongsTo PurchaseOrder, User (diterima)`, `hasMany Items` |
| `PurchaseOrderReceiptItem` | `purchase_order_receipt_items` | `belongsTo Receipt, PurchaseOrderItem, Barang` |
| `PurchaseOrderRevision` | `purchase_order_revisions` | `belongsTo PurchaseOrder, User (changed)` |

**PurchaseOrderItem** has computed accessors:
- `getJumlahDiterimaAttribute()` → `receiptItems()->sum('jumlah_diterima')`
- `getSisaAttribute()` → `jumlah - jumlah_diterima`

**PurchaseOrderRevision** casts: `data` and `changed_fields` are `array`

---

## Services

### `KodePOService` (`app/Services/KodePOService.php`)
- Generates PO code using `lockForUpdate()` to prevent race condition
- Format: `PO-{Y}-{M}-{seq}` (e.g., `PO-2026-VII-0001`)
  - `{Y}` = 4-digit year
  - `{M}` = Roman month (I-XII)
  - `{seq}` = 4-digit zero-padded sequential
- Resets `urutan_terakhir` when `tahun_bulan_terakhir` changes
- Code is **generated only when PO is submitted** (`kirim`), not during draft creation

### `PurchaseOrderService` (`app/Services/PurchaseOrderService.php`)
- `recalculate(PurchaseOrder $po)`: sums item subtotals, updates PO subtotal & total
- `recalculateItem(PurchaseOrderItem $item)`: computes item subtotal + tax + total after tax, then recalculates PO header
- `simpanRevisi(PurchaseOrder $po, array $changedFields)`: creates versioned snapshot
- `updateStok(PurchaseOrder $po)`: increments barang.stok by jumlah_diterima

---

## Controllers & Endpoints

### Settings
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/settings/{group}` | `SettingController@show` |
| PUT | `/api/settings/{group}` | `SettingController@update` |
| POST | `/api/settings/upload-logo` | `SettingController@uploadLogo` |

### Jenis Pajak
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/jenis-pajak` | `JenisPajakController@index` |
| POST | `/api/jenis-pajak` | `JenisPajakController@store` |
| GET | `/api/jenis-pajak/{jenisPajak}` | `JenisPajakController@show` |
| PUT | `/api/jenis-pajak/{jenisPajak}` | `JenisPajakController@update` |
| DELETE | `/api/jenis-pajak/{jenisPajak}` | `JenisPajakController@destroy` |
| POST | `/api/jenis-pajak/bulk-delete` | `JenisPajakController@bulkDestroy` |

**Pattern:** search by `nama`, sort by `nama` (asc default)

### Client
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/client` | `ClientController@index` |
| POST | `/api/client` | `ClientController@store` |
| GET | `/api/client/{client}` | `ClientController@show` (loads addresses, contacts) |
| PUT | `/api/client/{client}` | `ClientController@update` |
| DELETE | `/api/client/{client}` | `ClientController@destroy` (cascade deletes contacts, addresses) |
| POST | `/api/client/bulk-delete` | `ClientController@bulkDestroy` |

**Validation:** `tipe` → `in:perusahaan,perorangan`

### Project
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/project` | `ProjectController@index` |
| POST | `/api/project` | `ProjectController@store` |
| GET | `/api/project/{project}` | `ProjectController@show` (loads client, unit) |
| PUT | `/api/project/{project}` | `ProjectController@update` |
| DELETE | `/api/project/{project}` | `ProjectController@destroy` |
| POST | `/api/project/bulk-delete` | `ProjectController@bulkDestroy` |

**Validation:** `kode` free text unique, `status` → `in:aktif,selesai,ditunda,dibatalkan`

### Purchase Order — Main
| Method | Endpoint | Controller@Method | Notes |
|---|---|---|---|
| GET | `/api/purchase-order` | `PurchaseOrderController@index` | search by kode/vendor name, filter by status |
| POST | `/api/purchase-order` | `PurchaseOrderController@store` | creates draft, kode=null |
| GET | `/api/purchase-order/{po}` | `PurchaseOrderController@show` | full detail with all relations |
| PUT | `/api/purchase-order/{po}` | `PurchaseOrderController@update` | only if status=draft |
| DELETE | `/api/purchase-order/{po}` | `PurchaseOrderController@destroy` | only if status=draft |
| POST | `/api/purchase-order/bulk-delete` | `PurchaseOrderController@bulkDestroy` | only drafts |
| PUT | `/api/purchase-order/{po}/kirim` | `PurchaseOrderController@kirim` | draft → dikirim + generate kode |
| PUT | `/api/purchase-order/{po}/setujui` | `PurchaseOrderController@setujui` | dikirim → disetujui + save revision |
| POST | `/api/purchase-order/{po}/terima` | `PurchaseOrderController@terima` | disetujui/diterima_sebagian → diterima/diterima_sebagian |
| PUT | `/api/purchase-order/{po}/batalkan` | `PurchaseOrderController@batalkan` | cancel from any status except diterima/dibatalkan |

### Purchase Order — Items
| Method | Endpoint | Controller@Method | Notes |
|---|---|---|---|
| GET | `/api/purchase-order/{po}/items` | `PurchaseOrderItemController@index` | |
| POST | `/api/purchase-order/{po}/items` | `PurchaseOrderItemController@store` | only if draft, auto recalculate |
| PUT | `/api/purchase-order/{po}/items/{item}` | `PurchaseOrderItemController@update` | only if draft, auto recalculate |
| DELETE | `/api/purchase-order/{po}/items/{item}` | `PurchaseOrderItemController@destroy` | only if draft, auto recalculate |

### Purchase Order — Receipts & Revisions
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/purchase-order/{po}/receipts` | `PurchaseOrderReceiptController@index` |
| GET | `/api/purchase-order/{po}/receipts/{receipt}` | `PurchaseOrderReceiptController@show` |
| GET | `/api/purchase-order/{po}/revisions` | `PurchaseOrderRevisionController@index` |
| GET | `/api/purchase-order/{po}/revisions/{rev}` | `PurchaseOrderRevisionController@show` |

### Reports
| Method | Endpoint | Controller@Method |
|---|---|---|
| GET | `/api/reports/purchase-order/summary` | `ReportPurchaseOrderController@summary` |
| GET | `/api/reports/purchase-order/per-bulan` | `ReportPurchaseOrderController@perBulan` |
| GET | `/api/reports/purchase-order/per-vendor` | `ReportPurchaseOrderController@perVendor` |
| GET | `/api/reports/purchase-order/per-status` | `ReportPurchaseOrderController@perStatus` |
| GET | `/api/reports/purchase-order/top-items` | `ReportPurchaseOrderController@topItems` |

---

## PO Workflow (Status Transitions)

```
                 kirim                  setujui               terima (partial)
draft ──────────────────→ dikirim ─────────────→ disetujui ─────────────→ diterima_sebagian
  │                         │                      │                           │
  │                         │                      │            terima (lunas) │
  │                         │                      ├───────────────────────────→ diterima
  │                         │                      │                           │
  └───── batalkan ─────────┴───── batalkan ────────┘── batalkan ──────────────┘
         ↓                        ↓                  ↓
      dibatalkan              dibatalkan          dibatalkan
```

Rules:
- **draft** → can edit items & header, can delete, **no kode yet**
- **dikirim** → kode generated, no edits allowed
- **disetujui** → approved by user, ready for receiving
- **diterima_sebagian** → some items partially received, can receive more
- **diterima** → all items fully received, stock updated
- **dibatalkan** → terminal status, cannot be changed

`terima` endpoint:
- Request body contains array of `{ purchase_order_item_id, jumlah_diterima, keterangan }`
- Creates a receipt record
- Auto-calculates if PO becomes `diterima` (all sisa=0) or stays `diterima_sebagian`
- Updates `barangs.stok` by `jumlah_diterima`

---

## All Route Definitions (from `routes/api.php`)

```php
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'changePassword']);

    // Master Data
    Route::get('kategori', [KategoriBarangController::class, 'index']);
    Route::post('kategori', [KategoriBarangController::class, 'store']);
    Route::get('unit', [UnitController::class, 'index']);
    Route::post('unit', [UnitController::class, 'store']);
    Route::apiResource('barang', BarangController::class);
    Route::post('barang/bulk-delete', [BarangController::class, 'bulkDestroy']);
    // Vendor + addresses + contacts
    Route::get('vendor', [VendorController::class, 'index']);
    Route::post('vendor', [VendorController::class, 'store']);
    Route::get('vendor/{vendor}', [VendorController::class, 'show']);
    Route::put('vendor/{vendor}', [VendorController::class, 'update']);
    Route::delete('vendor/{vendor}', [VendorController::class, 'destroy']);
    Route::post('vendor/bulk-delete', [VendorController::class, 'bulkDestroy']);
    Route::get('vendor/{vendor}/addresses', [VendorAddressController::class, 'index']);
    Route::post('vendor/{vendor}/addresses', [VendorAddressController::class, 'store']);
    Route::put('addresses/{address}', [VendorAddressController::class, 'update']);
    Route::delete('addresses/{address}', [VendorAddressController::class, 'destroy']);
    Route::get('vendor/{vendor}/contacts', [VendorContactController::class, 'index']);
    Route::post('vendor/{vendor}/contacts', [VendorContactController::class, 'store']);
    Route::put('contacts/{contact}', [VendorContactController::class, 'update']);
    Route::delete('contacts/{contact}', [VendorContactController::class, 'destroy']);
    // Alamat (global addresses)
    Route::get('alamat', [AlamatController::class, 'index']);
    Route::post('alamat', [AlamatController::class, 'store']);
    Route::get('alamat/{address}', [AlamatController::class, 'show']);
    Route::put('alamat/{address}', [AlamatController::class, 'update']);
    Route::delete('alamat/{address}', [AlamatController::class, 'destroy']);
    Route::post('alamat/bulk-delete', [AlamatController::class, 'bulkDestroy']);
    // Kontak (global contacts)
    Route::get('kontak', [KontakController::class, 'index']);
    Route::post('kontak', [KontakController::class, 'store']);
    Route::get('kontak/{contact}', [KontakController::class, 'show']);
    Route::put('kontak/{contact}', [KontakController::class, 'update']);
    Route::delete('kontak/{contact}', [KontakController::class, 'destroy']);
    Route::post('kontak/bulk-delete', [KontakController::class, 'bulkDestroy']);

    // Settings
    Route::get('settings/{group}', [SettingController::class, 'show']);
    Route::put('settings/{group}', [SettingController::class, 'update']);
    Route::post('settings/upload-logo', [SettingController::class, 'uploadLogo']);

    // Jenis Pajak
    Route::get('jenis-pajak', [JenisPajakController::class, 'index']);
    Route::post('jenis-pajak', [JenisPajakController::class, 'store']);
    Route::get('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'show']);
    Route::put('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'update']);
    Route::delete('jenis-pajak/{jenisPajak}', [JenisPajakController::class, 'destroy']);
    Route::post('jenis-pajak/bulk-delete', [JenisPajakController::class, 'bulkDestroy']);

    // Client
    Route::get('client', [ClientController::class, 'index']);
    Route::post('client', [ClientController::class, 'store']);
    Route::get('client/{client}', [ClientController::class, 'show']);
    Route::put('client/{client}', [ClientController::class, 'update']);
    Route::delete('client/{client}', [ClientController::class, 'destroy']);
    Route::post('client/bulk-delete', [ClientController::class, 'bulkDestroy']);

    // Project
    Route::get('project', [ProjectController::class, 'index']);
    Route::post('project', [ProjectController::class, 'store']);
    Route::get('project/{project}', [ProjectController::class, 'show']);
    Route::put('project/{project}', [ProjectController::class, 'update']);
    Route::delete('project/{project}', [ProjectController::class, 'destroy']);
    Route::post('project/bulk-delete', [ProjectController::class, 'bulkDestroy']);

    // Purchase Order
    Route::get('purchase-order', [PurchaseOrderController::class, 'index']);
    Route::post('purchase-order', [PurchaseOrderController::class, 'store']);
    Route::get('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
    Route::put('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
    Route::delete('purchase-order/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
    Route::post('purchase-order/bulk-delete', [PurchaseOrderController::class, 'bulkDestroy']);
    Route::put('purchase-order/{purchaseOrder}/kirim', [PurchaseOrderController::class, 'kirim']);
    Route::put('purchase-order/{purchaseOrder}/setujui', [PurchaseOrderController::class, 'setujui']);
    Route::post('purchase-order/{purchaseOrder}/terima', [PurchaseOrderController::class, 'terima']);
    Route::put('purchase-order/{purchaseOrder}/batalkan', [PurchaseOrderController::class, 'batalkan']);

    // PO Items
    Route::get('purchase-order/{purchaseOrder}/items', [PurchaseOrderItemController::class, 'index']);
    Route::post('purchase-order/{purchaseOrder}/items', [PurchaseOrderItemController::class, 'store']);
    Route::put('purchase-order/{purchaseOrder}/items/{item}', [PurchaseOrderItemController::class, 'update']);
    Route::delete('purchase-order/{purchaseOrder}/items/{item}', [PurchaseOrderItemController::class, 'destroy']);

    // PO Receipts
    Route::get('purchase-order/{purchaseOrder}/receipts', [PurchaseOrderReceiptController::class, 'index']);
    Route::get('purchase-order/{purchaseOrder}/receipts/{receipt}', [PurchaseOrderReceiptController::class, 'show']);

    // PO Revisions
    Route::get('purchase-order/{purchaseOrder}/revisions', [PurchaseOrderRevisionController::class, 'index']);
    Route::get('purchase-order/{purchaseOrder}/revisions/{revision}', [PurchaseOrderRevisionController::class, 'show']);

    // Reports
    Route::get('reports/purchase-order/summary', [ReportPurchaseOrderController::class, 'summary']);
    Route::get('reports/purchase-order/per-bulan', [ReportPurchaseOrderController::class, 'perBulan']);
    Route::get('reports/purchase-order/per-vendor', [ReportPurchaseOrderController::class, 'perVendor']);
    Route::get('reports/purchase-order/per-status', [ReportPurchaseOrderController::class, 'perStatus']);
    Route::get('reports/purchase-order/top-items', [ReportPurchaseOrderController::class, 'topItems']);
});
```

---

## File Structure

```
app/
├── Models/
│   ├── Setting.php
│   ├── JenisPajak.php
│   ├── Client.php
│   ├── Project.php
│   ├── PurchaseOrder.php
│   ├── PurchaseOrderItem.php
│   ├── PurchaseOrderReceipt.php
│   ├── PurchaseOrderReceiptItem.php
│   └── PurchaseOrderRevision.php
├── Services/
│   ├── KodePOService.php
│   └── PurchaseOrderService.php
└── Http/Controllers/
    ├── SettingController.php
    ├── JenisPajakController.php
    ├── ClientController.php
    ├── ProjectController.php
    ├── PurchaseOrderController.php
    ├── PurchaseOrderItemController.php
    ├── PurchaseOrderReceiptController.php
    ├── PurchaseOrderRevisionController.php
    └── ReportPurchaseOrderController.php

database/
├── migrations/
│   ├── 2026_07_14_000001_create_settings_table.php
│   ├── 2026_07_14_000002_create_jenis_pajak_table.php
│   ├── 2026_07_14_000003_create_clients_table.php
│   ├── 2026_07_14_000004_create_projects_table.php
│   ├── 2026_07_14_000005_create_purchase_orders_table.php
│   ├── 2026_07_14_000006_create_purchase_order_items_table.php
│   ├── 2026_07_14_000007_create_purchase_order_receipts_table.php
│   ├── 2026_07_14_000008_create_purchase_order_receipt_items_table.php
│   └── 2026_07_14_000009_create_purchase_order_revisions_table.php
└── seeders/
    ├── SettingSeeder.php
    ├── JenisPajakSeeder.php
    └── DatabaseSeeder.php          (modified — added both seeders)

routes/
└── api.php                         (modified — all PO routes added)
```

---

## Implementation Status

- [x] All migrations created & migrated successfully
- [x] All models created with proper relations & casts
- [x] Both services implemented (KodePOService with lockForUpdate, PurchaseOrderService)
- [x] All controllers implemented (Setting, JenisPajak, Client, Project, PurchaseOrder, PurchaseOrderItem, PurchaseOrderReceipt, PurchaseOrderRevision, Report)
- [x] Routes registered in api.php
- [x] Seeders created & seeded (2 settings records, 2 tax types)
- [x] All PHP syntax errors: NONE

## To Start Development Server

```bash
cd /home/wido2/project/npx/laravel
php artisan serve
php artisan storage:link   # for logo upload access
```

## Login Credentials (from seeder)

- Email: `admin@gmail.com`
- Password: `220716`
