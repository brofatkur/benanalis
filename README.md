# Dashboard Monitoring Sentimen Sosial Media (ASA Group - Pilot: Pemkot Denpasar)

Aplikasi analitik dan pemantauan sentimen media sosial berbasis kecerdasan buatan untuk instansi pemerintah daerah (pilot: **Pemerintah Kota Denpasar**), dibangun berdasarkan spesifikasi teknis pada `PRD Dashboard Monitoring Sentimen Sosial Media.md`.

---

## 🌟 Fitur Utama Sesuai PRD

1. **Pengambilan Data Terpisah (Post vs Komentar)**:
   - Pengambilan post dan komentar warga dari SocialCrawl API secara independen.
   - Komentar dikaitkan ke post induk melalui `parent_post_id`.
   - Analisis sentimen membuktikan komentar memiliki kecenderungan keluhan/reaksi negatif 2.4x lebih tajam dibanding post utama.

2. **Pipeline Sentimen 2-Tier Berbasis Perspektif Institusi**:
   - **Tier 1**: Klasifikasi cepat kamus sentimen bahasa Indonesia & normalisasi bahasa gaul (`colloquial-indonesian-lexicon`).
   - **Tier 2**: Eskalasi ke LLM (DeepSeek) dengan injeksi konteks *Perspective Profile* Pemkot Denpasar. Kritik fasilitas publik (jalan rusak, tumpukan sampah, antrian RSUD) otomatis diklasifikasikan sebagai sentimen **negatif** bagi institusi pemerintah.
   - Penjelasan (*reasoning*) AI dicatat di setiap item data bersama versi profil (`profile_version`).

3. **Pemodelan Topik (BERTopic Clustering)**:
   - Pengelompokan isu publik otomatis:
     - 🏗️ *Infrastruktur Jalan & Drainase PUPR*
     - 🗑️ *Pengelolaan Sampah & Kebersihan DLHK*
     - 🏥 *Layanan Kesehatan & RSUD Wangaya*
     - 🚦 *Ketertiban Parkir & Lalu Lintas Dishub*
     - 🎭 *Pariwisata, Event & Kebudayaan Denpasar*
     - 🏛️ *Pelayanan Publik & Aplikasi Pro Denpasar*
   - Rasio sentimen negatif dan volume dihitung per topik.

4. **Database Insforge PostgreSQL & RLS Multi-Tenant**:
   - `org_profile`: Pengaturan profil institusi, area fokus dinas, dan aturan konteks berversi.
   - `raw_posts` & `raw_comments`: Data mentah dengan partisi bulanan.
   - `sentiment_scores`: Skor keyakinan, label, model yang digunakan, dan alasan AI.
   - `topics` & `topic_assignments`: Relasi topik ke post/komentar.
   - `daily_rollup`: Agregat harian performa tinggi untuk konsumsi dashboard.
   - `dedup_log`: Filter deduplikasi konten berbasis hash SHA-256.
   - `anomaly_logs`: Riwayat deteksi lonjakan sentimen negatif.

5. **Chatbot WhatsApp (Kirimdev / Kirimdev-hermes)**:
   - Endpoint webhook di `/api/webhook/kirimdev`.
   - **Kontrol Akses Ketat**: Hanya nomor WhatsApp berwenang yang dapat mengakses data analitik dan keluhan internal.
   - Mendukung pertanyaan agregat (*"sentimen hari ini gimana?"*) dan pencarian semantik isu/keluhan warga.

6. **Deteksi Anomali & Notifikasi Otomatis**:
   - Membandingkan rasio negatif harian terhadap baseline rata-rata bergerak 7 hari (*7-day rolling moving average*), menghindari *false alarm* pada volume kecil.
   - Memicu peringatan ke WhatsApp pejabat saat terjadi lonjakan anomali.

7. **Laporan Eksekutif PDF**:
   - Pratinjau dan unduh laporan berkala mingguan/bulanan siap cetak (*print-optimized*) dengan KPI ringkas dan rekomendasi tindak lanjut dinas.

---

## 🚀 Cara Menjalankan

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env.local`)
Konfigurasi Insforge PostgreSQL telah terhubung langsung:
```env
INSFORGE_BASE_URL="https://q4o0g4sk44ss4gwsc4wocgwc.43.134.7.185.sslip.io"
INSFORGE_API_KEY="ik_..."
AUTHORIZED_WHATSAPP_NUMBERS="628123456789,628198765432"
```

### 3. Inisialisasi Database & Seeding
```bash
npm run seed
```

### 4. Menjalankan Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban web.

---

## 📡 Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/analytics/overview` | KPI ringkasan eksekutif, tren 30 hari, sebaran platform |
| `GET` | `/api/analytics/topics` | Daftar klaster topik BERTopic & sentimen per isu |
| `GET` | `/api/analytics/feed` | Feed post & komentar dengan filter platform & sentimen |
| `POST` | `/api/crawl` | Trigger crawler SocialCrawl & ETL pipeline otomatis |
| `GET/POST` | `/api/profile` | Konfigurasi Perspective Profile (auto-bump version) |
| `POST` | `/api/notify/anomaly` | Kalkulasi anomali vs baseline 7 hari & kirim alert |
| `POST` | `/api/webhook/kirimdev` | Webhook Kirimdev WhatsApp Q&A bot (verifikasi nomor) |
| `GET` | `/api/report/pdf` | Data laporan eksekutif berkala |
