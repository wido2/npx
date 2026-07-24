# Fitur Permintaan Barang

## Ringkasan

Sistem permintaan barang yang ditujukan ke bagian **purchasing**, dengan relasi ke **Client** dan **Project**. Pihak gudang akan mengecek setiap item dan memutuskan apakah barang perlu **dibeli baru** atau bisa **pakai stok yang ada**.

---

## Alur Bisnis

### Status Workflow

```
draft → diajukan → diproses → selesai
                ↘ ditolak
```

| Status | Owner | Deskripsi |
|--------|-------|-----------|
| `draft` | Originator | Sedang mengisi form permintaan |
| `diajukan` | Gudang | Permintaan masuk, gudang cek stok per item |
| `diproses` | Purchasing | Gudang sudah tentukan sumber, purchasing tinggal fulfill |
| `selesai` | - | Semua item terpenuhi |
| `ditolak` | Gudang | Permintaan ditolak (dengan alasan) |

### Langkah-langkah

1. **Originator** membuat permintaan dengan memilih Client + Project, daftar barang yang diminta (draft → diajukan)
2. **Gudang** membuka detail permintaan, untuk setiap item:
   - Mengecek stop (stok saat ini)
   - Memutuskan: **"Gunakan Stok"** (sumber = stok) atau **"Beli Baru"** (sumber = beli)
   - Menentukan jumlah yang disetujui
3. **Purchasing** memproses fulfillment:
   - Item `sumber = stok` → klik "Ambil Stok" → auto-create **Pengambilan Barang (PB)**, stok otomatis berkurang
   - Item `sumber = beli` → klik "Buat PO" → redirect ke **PO Wizard** dengan data pre-filled, atau **PL** untuk pembelian langsung
4. Ketika semua item fulfilled → status otomatis menjadi `selesai`

---

## Database

### Tabel `permintaan_barang`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | uuid (PK) | |
| `kode` | string (unique) | Auto-generated: `PR-{Y}-{M}-{seq}` |
| `client_id` | uuid FK → clients | nullable |
| `project_id` | uuid FK → projects | nullable |
| `tanggal_diminta` | date | |
| `tanggal_dibutuhkan` | date | nullable |
| `status` | string | draft / diajukan / diproses / selesai / ditolak |
| `catatan` | text | nullable |
| `created_by` | uuid FK → users | Originator |
| `diproses_oleh` | uuid FK → users | nullable (gudang yang proses) |
| timestamps | | created_at, updated_at |

### Tabel `item_permintaan_barang`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | uuid (PK) | |
| `permintaan_id` | uuid FK → permintaan_barang (cascade) | |
| `barang_id` | uuid FK → barangs | |
| `jumlah_diminta` | integer | |
| `jumlah_disetujui` | integer | nullable (ditetapkan gudang) |
| `sumber` | string | nullable: `stok` / `beli` |
| `status` | string | pending / terpenuhi |
| `keterangan` | text | nullable |
| timestamps | | created_at, updated_at |

---

## Backend

### Models

- `PermintaanBarang` — fillable, casts, relations ke Client/Project/Items/User
- `ItemPermintaanBarang` — fillable, relations ke PermintaanBarang/Barang

### Service

- `KodePermintaanService` — generate kode `PR-{Y}-{M}-{seq}` (ikuti pattern `KodePOService`/`KodePLService`/`KodePBService`)

### Controller & Routes

| Method | URI | Action |
|--------|-----|--------|
| GET | `/permintaan-barang` | index (list dengan search/filter) |
| POST | `/permintaan-barang` | store |
| GET | `/permintaan-barang/{id}` | show |
| PUT | `/permintaan-barang/{id}` | update |
| DELETE | `/permintaan-barang/{id}` | destroy |
| POST | `/permintaan-barang/bulk-delete` | bulkDestroy |
| GET | `/permintaan-barang/{id}/pdf` | pdf |
| PUT | `/permintaan-barang/{id}/ajukan` | ajukan (draft → diajukan) |
| PUT | `/permintaan-barang/{id}/proses` | proses (diajukan → diproses, gudang set sumber per item) |
| PUT | `/permintaan-barang/{id}/tolak` | tolak |
| POST | `/permintaan-barang/{id}/fulfill-stok` | Buat PB untuk item stok |
| POST | `/permintaan-barang/{id}/fulfill-beli` | Buat PO untuk item beli |

### Permissions

- `pr.create` — membuat permintaan
- `pr.edit` — edit permintaan (hanya draft)
- `pr.delete` — hapus permintaan
- `pr.proses` — gudang: cek stok, tentukan sumber
- `pr.fulfill` — purchasing: buat PO/PB

### Notifications

- `notification.pr_submitted` — saat permintaan diajukan
- `notification.pr_processed` — saat gudang selesai proses
- `notification.pr_fulfilled` — saat item terpenuhi
- `notification.pr_rejected` — saat ditolak

### Stock Fulfillment

- Item `sumber = stok`:
  - Panggil `StokService::kurangi()` (sama seperti PB)
  - Catat `mutasi_stok` dengan `referensi` ke permintaan_barang
  - Atau buat `PengambilanBarang` otomatis
- Item `sumber = beli`:
  - Tidak ada perubahan stok
  - Purchasing akan buat PO/PL secara manual (redirect dengan prefill)

---

## Frontend

### File Structure

```
slate/components/
├── permintaan-barang-table.tsx
├── permintaan-barang-wizard.tsx
├── permintaan-barang-detail.tsx
├── widgets/
│   └── permintaan-barang-terbaru.tsx   (widget dashboard)
slate/lib/
├── permintaan-barang-api.ts
slate/app/
└── permintaan-barang/
    ├── page.tsx
    ├── create/page.tsx
    └── [id]/page.tsx
```

### Component Patterns (ikuti existing)

| Komponen | Pattern |
|----------|---------|
| **Table** | `@tanstack/react-table` + search + filter status + column visibility |
| **Wizard** | Multi-step (Header → Items → Review) + Progress bar |
| **Detail** | Cards info + tabs (items, timeline) |

### Halaman Detail untuk Gudang

- Tabel items dengan kolom:
  - Barang (nama + kode)
  - Stok saat ini (live)
  - Jumlah diminta
  - Jumlah disetujui (input)
  - Sumber (dropdown: "Gunakan Stok" / "Beli Baru")
  - Keterangan
- Tombol "Simpan & Proses" → simpan sumber + jumlah disetujui, ubah status ke `diproses`
- Tombol "Tolak" → alasan, status ke `ditolak`

### Halaman Detail untuk Purchasing

- Tabel items dikelompokkan berdasarkan sumber
- Tab "Gunakan Stok": tombol "Ambil Stok" → create PB
- Tab "Beli Baru": tombol "Buat PO" → redirect ke create PO dengan data prefill

---

## Daftar Referensi (Existing Code)

### Backend (Laravel)

| File | Keterangan |
|------|-----------|
| `app/Models/PurchaseOrder.php` | Contoh model dengan workflow status |
| `app/Models/PengambilanBarang.php` | Contoh model dengan relasi client/project |
| `app/Models/Barang.php` | Model barang dengan stok |
| `app/Http/Controllers/PurchaseOrderController.php` | Contoh CRUD + workflow |
| `app/Http/Controllers/PengambilanBarangController.php` | Contoh controller terkait client/project |
| `app/Services/KodePOService.php` | Pattern auto-generate kode |
| `app/Services/StokService.php` | Service stok (tambah/kurangi) |
| `app/Services/HargaService.php` | Service harga |
| `database/migrations/` | Pattern migrasi UUID + relasi |

### Frontend (Slate)

| File | Keterangan |
|------|-----------|
| `components/purchase-order-wizard.tsx` | Pattern wizard 3 langkah |
| `components/purchase-order-table.tsx` | Pattern tabel dengan toolbar |
| `components/purchase-order-detail.tsx` | Pattern detail dengan tabs |
| `components/pengambilan-barang-table.tsx` | Pattern tabel terkait PB |
| `lib/purchase-order-api.ts` | Pattern API client |
| `app/purchase-order/create/page.tsx` | Pattern create page |
