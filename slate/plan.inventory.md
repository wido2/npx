# Rencana Fitur: Pengambilan Barang (Goods Issue) + Inventory

## Ringkasan
Form transaksi untuk mencatat pengeluaran barang dari gudang, berelasi dengan Client & Project, mengurangi stok otomatis, mencatat mutasi stok, dan memiliki nomor otomatis (PB-XXX) yang bisa dikonfigurasi di Settings tab **"PB - Pengambilan Barang"**.

---

## 1. Database — 3 Tabel Baru + 1 Seeder ✅

### Tabel `pengambilan_barang` (header)
| Kolom | Tipe | Ket |
|---|---|---|
| `id` | UUID | PK |
| `kode` | string | unique, auto-generated: `PB-2026-VII-0001` |
| `tanggal_pengambilan` | date | |
| `client_id` | UUID | FK → clients (nullable) |
| `project_id` | UUID | FK → projects (nullable) |
| `keterangan` | text | nullable |
| `created_by` | UUID | FK → users |
| `created_at` / `updated_at` | timestamp | |

### Tabel `item_pengambilan_barang` (items)
| Kolom | Tipe | Ket |
|---|---|---|
| `id` | UUID | PK |
| `pengambilan_barang_id` | UUID | FK → pengambilan_barang (cascade delete) |
| `barang_id` | UUID | FK → barangs |
| `jumlah` | integer | jumlah yang diambil |
| `keterangan` | text | nullable |
| `created_at` / `updated_at` | timestamp | |

### Tabel `mutasi_stok` (riwayat pergerakan stok)
| Kolom | Tipe | Ket |
|---|---|---|
| `id` | UUID | PK |
| `barang_id` | UUID | FK → barangs |
| `tipe` | enum('masuk','keluar','opname') | |
| `jumlah` | integer | positif untuk masuk, negatif untuk keluar |
| `stok_sebelum` | integer | |
| `stok_sesudah` | integer | |
| `referensi_type` | string | nullable — class model sumber |
| `referensi_id` | UUID | nullable — ID record sumber |
| `keterangan` | text | nullable |
| `created_by` | UUID | FK → users |
| `created_at` | timestamp | |

### Seeder — tambah data settings `pengambilan_barang`
```php
['group' => 'pengambilan_barang', 'data' => [
    'format_kode' => 'PB-{Y}-{M}-{seq}',
    'urutan_terakhir' => 0,
    'tahun_bulan_terakhir' => '',
    'reset_periode' => 'bulanan',
]]
```

---

## 2. Backend — Laravel ✅

| File | Fungsi | Status |
|---|---|---|
| `app/Services/KodePBService.php` | Generate nomor `PB-...` | ✅ |
| `app/Models/PengambilanBarang.php` | Model header | ✅ |
| `app/Models/ItemPengambilanBarang.php` | Model item | ✅ |
| `app/Models/MutasiStok.php` | Model mutasi stok | ✅ |
| `app/Services/StokService.php` | Service increment/decrement stok | ✅ |
| `app/Http/Controllers/PengambilanBarangController.php` | CRUD + kurangi stok | ✅ |
| `app/Http/Controllers/InventoryController.php` | Mutasi, opname, stok minimum, laporan | ✅ |
| `app/Http/Controllers/PurchaseOrderController.php` | Modifikasi `terima()` | ✅ |
| `routes/api.php` | Tambah routes PB + inventory | ✅ |

### Routes baru ✅
```
GET    /api/pengambilan-barang
POST   /api/pengambilan-barang
GET    /api/pengambilan-barang/{pengambilanBarang}
DELETE /api/pengambilan-barang/{pengambilanBarang}
POST   /api/pengambilan-barang/bulk-delete
GET    /api/inventory/mutasi?barang_id=&page=
GET    /api/inventory/stok-minimum
POST   /api/inventory/opname
GET    /api/inventory/laporan-stok
```

### Alur `store` (buat PB baru) ✅
1. Generate kode via `KodePBService`
2. Simpan header `pengambilan_barang`
3. Loop items → panggil `StokService::kurangi(barang_id, jumlah, referensi)`
4. `StokService::kurangi()` → kurangi `barangs.stok` + insert `mutasi_stok` (tipe='keluar')

### Modifikasi `PurchaseOrderController@terima` ✅
- Ganti `$barang->increment('stok', ...)` langsung → panggil `StokService::tambah()`

---

## 3. Frontend — Halaman ✅

| File | Konten | Status |
|---|---|---|
| `app/pengambilan-barang/page.tsx` | Daftar PB (tabel dengan pencarian, sorting) | ✅ |
| `app/pengambilan-barang/create/page.tsx` | Form wizard (Header → Items → Review) | ✅ |
| `app/pengambilan-barang/[id]/page.tsx` | Detail PB | ✅ |
| `components/pengambilan-barang-table.tsx` | Tabel daftar (Kode, Tanggal, Client, Project, Total Item) | ✅ |
| `components/pengambilan-barang-wizard.tsx` | Wizard 3 step (Header, Items, Review) | ✅ |
| `components/pengambilan-barang-detail.tsx` | Detail PB | ✅ |
| `lib/pengambilan-barang-api.ts` | API layer PB | ✅ |
| `lib/inventory-api.ts` | API layer inventory (mutasi, stok minimum, opname, laporan) | ✅ |

### Form wizard fields
Step 1 — Header:
- Tanggal Pengambilan (date input)
- Client (Combobox)
- Project (Combobox — filter by client)
- Keterangan (textarea)

Step 2 — Items:
- Pilih Barang (Combobox — tampilkan stok tersisa)
- Jumlah (number input, max = stok)
- Keterangan opsional
- Tabel ringkasan items

Step 3 — Review (ringkasan + submit)

---

## 4. UI — Settings Tab Baru ✅

**`settings-form.tsx`** — tambah tab **"PB - Pengambilan Barang"** ✅

Group `pengambilan_barang` dengan fields:
- `format_kode` — text (default `PB-{Y}-{M}-{seq}`) ✅
- `reset_periode` — select (Tidak pernah / Bulanan / Jan–Des) ✅

---

## 5. UI — Navigasi ✅

- Desktop: item menu ditambahkan di **top bar** (Transaksi → "Pengambilan Barang") ✅
- Mobile: item menu ditambahkan di **hamburger menu** ✅

| Tempat | Item | Status |
|---|---|---|
| `top-menu.tsx` (Transaksi) | "Pengambilan Barang" → `/pengambilan-barang` | ✅ |
| `site-header.tsx` (hamburger sheet) | "Pengambilan Barang" → `/pengambilan-barang` | ✅ |

---

## 6. UI — Indikator Stok Minimum ✅

- `barang-table.tsx` — jika `stok ≤ stok_minimum` → teks merah + icon warning ✅
- Wizard PB — validasi `jumlah ≤ stok` sebelum submit ✅

---

## 7. Daftar Lengkap File

### Backend (Laravel) — 13 file ✅
| # | File | Aksi | Status |
|---|---|---|---|
| 1 | `database/migrations/2026_07_15_030000_create_mutasi_stok_table.php` | Baru | ✅ |
| 2 | `database/migrations/2026_07_15_030001_create_pengambilan_barang_table.php` | Baru | ✅ |
| 3 | `database/migrations/2026_07_15_030002_create_item_pengambilan_barang_table.php` | Baru | ✅ |
| 4 | `database/seeders/SettingSeeder.php` | Update | ✅ |
| 5 | `app/Models/PengambilanBarang.php` | Baru | ✅ |
| 6 | `app/Models/ItemPengambilanBarang.php` | Baru | ✅ |
| 7 | `app/Models/MutasiStok.php` | Baru | ✅ |
| 8 | `app/Services/KodePBService.php` | Baru | ✅ |
| 9 | `app/Services/StokService.php` | Baru | ✅ |
| 10 | `app/Http/Controllers/PengambilanBarangController.php` | Baru | ✅ |
| 11 | `app/Http/Controllers/InventoryController.php` | Baru | ✅ |
| 12 | `app/Http/Controllers/PurchaseOrderController.php` | Modifikasi | ✅ |
| 13 | `routes/api.php` | Update | ✅ |

### Frontend (Next.js) — 12 file ✅
| # | File | Aksi | Status |
|---|---|---|---|
| 1 | `lib/pengambilan-barang-api.ts` | Baru | ✅ |
| 2 | `lib/inventory-api.ts` | Baru | ✅ |
| 3 | `components/pengambilan-barang-table.tsx` | Baru | ✅ |
| 4 | `components/pengambilan-barang-wizard.tsx` | Baru | ✅ |
| 5 | `components/pengambilan-barang-detail.tsx` | Baru | ✅ |
| 6 | `app/pengambilan-barang/page.tsx` | Baru | ✅ |
| 7 | `app/pengambilan-barang/create/page.tsx` | Baru | ✅ |
| 8 | `app/pengambilan-barang/[id]/page.tsx` | Baru | ✅ |
| 9 | `components/settings-form.tsx` | Update — tab "PB" | ✅ |
| 10 | `components/site-header.tsx` | Update — hamburger sheet | ✅ |
| 11 | `components/top-menu.tsx` | Update — menu item | ✅ |
| 12 | `components/barang-table.tsx` | Update — indikator stok minimum | ✅ |

---

## 8. Role Manager / Permissions ✅

### Permission baru (Seeder)
| Permission | Guard |
|---|---|
| `pb.create` | web |
| `pb.view_own` | web |
| `pb.view_all` | web |
| `pb.delete` | web |
| `inventory.view` | web |
| `inventory.opname` | web |

### Permission checks backend
| Controller | Method | Permission |
|---|---|---|
| `PengambilanBarangController` | `index` | `pb.view_all` (jika tidak punya → lihat milik sendiri) |
| `PengambilanBarangController` | `store` | `pb.create` |
| `PengambilanBarangController` | `show` | `pb.view_all` atau `created_by` sendiri |
| `PengambilanBarangController` | `destroy` | `pb.delete` |
| `PengambilanBarangController` | `bulkDestroy` | `pb.delete` |
| `InventoryController` | `mutasi` | `inventory.view` |
| `InventoryController` | `stokMinimum` | `inventory.view` |
| `InventoryController` | `opname` | `inventory.opname` |
| `InventoryController` | `laporanStok` | `inventory.view` |

### Frontend — `can()` checks
| Komponen | Guard |
|---|---|
| `pengambilan-barang-table.tsx` | Tombol New PB → `pb.create`; Delete → `pb.delete` |
| `pengambilan-barang-detail.tsx` | Tombol Delete → `pb.delete` |
| `pengambilan-barang-wizard.tsx` | Redirect jika tidak punya `pb.create` |
