# Rangkuman Progres PediaVet (NutriSmart Pro)

Dokumen ini merangkum seluruh pekerjaan yang telah diselesaikan sejak awal pembangunan proyek **PediaVet** berdasarkan arsitektur **Zero-Trust**, serta mencatat fitur-fitur yang masih tertunda atau belum diimplementasikan.

---

## ✅ Apa yang Telah Diselesaikan (Completed)

### 1. Inisiasi Proyek & Infrastruktur Dasar
- [x] **Setup Monorepo**: Membuat struktur direktori terpisah untuk `frontend` (Next.js) dan `backend` (NestJS).
- [x] **Database & ORM**: Setup PostgreSQL menggunakan **Prisma ORM**.
- [x] **Skema Database (Zero-Trust)**: Membangun skema `schema.prisma` yang mewajibkan `tenantId` pada setiap entitas operasional (Livestock, Transaction) dilengkapi *composite index* `@@index([tenantId, id])` untuk mencegah kebocoran data antar-tenant.
- [x] **Model Data Utama**: Entity `Tenant`, `User`, `Role`, `Permission`, `ApiKey`, `Livestock`, `Transaction`, `SystemLog`, dan `ActivityLog`.

### Current Objectives
- [x] Performa Audit: Koreksi kesalahan unit Energi NRC pada `seed.ts`
- [x] Performa Audit: Batasi input Jenis Hewan dengan Validasi Enum di backend DTO
- [x] Atasi Pesan Kesalahan Kompilasi Prisma dengan utilitas Axios sentral (`@lib/api`)
- [x] Integrasi ADG: Menyertakan relasi `WeightRecord` untuk histori penimbangan berat profil ternak
- [x] Fungsi Export Identitas Kandang (`Enclosures`) & Ternak (`Livestock`) dalam format CSV
- [x] Sinkronisasi Atomik Transaksi Prisma antara perpindahan Ternak dan pergeseran Kapasitas Kandang (`currentLoad`)
- [x] Persiapan Migrasi Skema Face 2: Nutrition, Billing, Inventory, dan Medical Record.
- [x] Mengatasi error Build Node_Env `Exit Code 127` NestJS dengan mengubah dev environment di Dockerfile.
- [x] Memperbaiki *Type Inference* TypeScript Export CSV (Enclosures & Livestock) dengan `@Type` explicit (*Exit Code 1* Coolify Build).
- [x] **Audit Billing API & Frontend End-to-End**: Telah membaca kode `billing.service.ts` dan `billing.controller.ts`. Terdapat Endpoint pembuatan Invoice `createInvoice` yang mengeksekusi *Prisma Transaction* (`$transaction`) untuk membuat *Invoice*, membuat *Ledger/Transaction*, dan men-set status hewan (*Livestock*) menjadi terjual jika jenisnya *SALE*. Selanjutnya saya memvalidasi *Frontend*.
- [x] Melakukan audit pada Modul Billing (Controller, Service, Prisma) beserta integrasinya di *Frontend* untuk memastikan tidak ada cacat integrasi sebelum melakukan pelaporan sesuai panduan pengguna.
- [ ] Push skema Prisma Face 2 ke production server via SSH (Coolify)

### 2. Backend (NestJS API Layer)
- [x] **Sistem Autentikasi (IAM)**: Implementasi Auth JWT (Passport) dan Bcrypt untuk hash password.
- [x] **Zero-Trust Access Control**: 
  - Pembuatan **Custom Decorators**: `@CurrentTenant()` dan `@RequirePermissions()`.
  - Pembuatan **Security Guards**: `JwtAuthGuard`, `TenantGuard` (memastikan akses data hanya berlaku pada *tenant* sang peminta), dan `PermissionGuard` (RBAC).
- [x] **Modul Livestock & Transactions**: Pembuatan operasi CRUD internal dengan injeksi paksa `tenantId` dari token JWT (tidak percaya input user).
- [x] **Dashboard Aggregation**: Pembuatan modul `Dashboard` untuk menyajikan metrik statistik gabungan (total hewan, staf, pendapatan bulanan) berbasis *tenant isolation*.
- [x] **Public API Gateway**: Membuka jalur akses publik (untuk integrasi Market) menggunakan `ApiKeyGuard` (Header `x-api-key`). Tersedia fitur "Data Masking" agar informasi sensitif tidak bocor.
- [x] **Proteksi Rate Limiting**: Limit global API (*100 request/menit*) menggunakan modul `@nestjs/throttler`.
- [x] **AI Service Adapter**: Membangun modul AI dengan *Context Builder* (memberi LLM data yang sudah di-*sanitize*) dan *Output Filter* (melindungi dari injeksi perintah berbahaya).

### 3. Frontend (Next.js 14/15)
- [x] **Desain Sistem Neumorphic + OTOHUB Style**: Menggabungkan estetika *soft UI* Neumorphic dengan fungsionalitas profesional alat manajemen.
- [x] **Komponen UI Reusable**: Membuat `NeuCard`, `NeuButton`, `NeuInput`, `NeuStatCard` (untuk dashboard), dan `NeuDataTable`.
- [x] **Halaman Autentikasi**: Desain UI halaman Login dan Setup/Pendaftaran Tenant baru.
- [x] **Halaman Superadmin**: Desain direktori untuk mengawasi seluruh aktivitas tenant secara *high-level*.
- [x] **Integrasi Frontend -> Backend (Axios)**:
  - Konfigurasi file utility `api.ts` yang menangani intersepsi HTTP dan *redirect* otomatis saat `401 Unauthorized`.
  - Sinkronisasi halaman spesifik ke database betulan: **Halaman Dashboard** dan **Halaman Livestock** sekarang sudah memanggil `fetch` dari API NestJS.

---

## ⏳ Apa yang Belum Dikerjakan / Dilewatkan (Pending / Skipped)

Ada beberapa pengerjaan yang belum sempat dirampungkan, disengaja di-skip (untuk mempercepat *Proof of Concept*), atau yang memang butuh penanganan khusus selanjutnya:

### 1. Keamanan Lanjut & E2E Testing
- [ ] **Automated Security E2E Test (Sedang berjalan terakhir)**: Uji coba keamanan lintas-*tenant* menggunakan Jest tadi sempat *crash* di konfigurasi dan belum lulus 100%. Uji coba penyerangan simulasi wajib diluluskan.
- [ ] **Rotasi & Pencabutan JWT**: Pembuatan dan penyimpanan "Refresh Token" yang kokoh ke database. Saat ini fokus pada mekanisme *Access Token*.

### 2. Fitur Modul Bisnis (Detail)
- [ ] **Modul Crop/Farming**: Entitas fase tanam (`CropPhase`) belum diimplementasikan controller dan servisnya secara spesifik.
- [ ] **Seeding Default RBAC**: Meskipun tabel Role dan Permission sudah jadi, skrip pendistribusian awal otomatis (seperti Role 'STAFF' otomatis punya id izin XY) belum dijalankan.
- [ ] **Fitur Pencatatan Log Sistem**: Entity `SystemLog` dan `ActivityLog` sudah ada di skema, namun **Interceptor** di NestJS untuk mencatat setiap klik/aksi pengguna belum disisipkan ke semua _endpoint_.

### 3. Fungsionalitas Eksternal
- [ ] **Integrasi AI Asli**: Modul AI `AiService` saat ini mengandalkan fungsi tiruan (*mock process*). Koneksi asli ke OpenAI/Gemini SDK masih diputus (belum _live_).
- [ ] **Upload Gambar / Media**: Fungsionalitas *storage* berkas, misalnya S3 atau penyimpanan gambar ternak, belum dibahas atau dibuat.
- [ ] **Secret / Env Management**: Standardisasi produksi (*docker-compose*, penyesuaian host `.env`) untuk tahap rilis masih menggunakan konfigurasi *localhost*.

---

Rangkuman ini mencandra bahwa fondasi utama *(MVP Core)* **Zero-Trust Backend dan integrasi UI secara penuh** sudah berdiri, meskipun *polishing* fungsi lanjutan seperti pencatatan jejak audit (Log), integrasi server AI murni, dan skenario *Testing Security otomatis* masih membutuhkan eksekusi lebih lanjut.
