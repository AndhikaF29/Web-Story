# Petunjuk Submission

Dokumen ini berisi langkah-langkah untuk menyelesaikan submission Dicoding.

## Langkah 1: Pastikan Kriteria Wajib Terpenuhi

- ✅ **PWA (Progressive Web App)**:

  - Aplikasi memiliki Application Shell
  - Dapat diinstal ke homescreen
  - Dapat diakses offline
  - Service worker berfungsi dengan baik

- ✅ **Push Notification**:

  - Menggunakan VAPID key yang disediakan
  - Berhasil subscribe dan unsubscribe

- ✅ **IndexedDB**:
  - Dapat menyimpan data secara lokal
  - Dapat menampilkan data tersimpan
  - Dapat menghapus data tersimpan

## Langkah 2: Build dan Deploy Aplikasi

1. **Build aplikasi:**

   ```
   npm run build
   ```

2. **Deploy ke salah satu platform:**

   - GitHub Pages
   - Netlify
   - Firebase Hosting

   Ikuti petunjuk di file `DEPLOYMENT.md`

3. **Isi STUDENT.txt:**
   - Nama lengkap
   - ID Dicoding
   - URL hasil deploy

## Langkah 3: Kirim Submission

1. **Zipkan folder proyek**

   - Jangan lupa untuk menghapus node_modules (jika ada)
   - Pastikan file STUDENT.txt telah diisi

2. **Unggah zip** ke platform Dicoding

## Checklist Sebelum Mengirim

- [ ] Aplikasi dapat diinstal di homescreen
- [ ] Aplikasi dapat diakses offline
- [ ] Push notification berfungsi
- [ ] IndexedDB dapat digunakan untuk menyimpan dan menampilkan data
- [ ] URL deployment sudah diisi di STUDENT.txt
- [ ] Semua kriteria wajib submission sebelumnya masih terpenuhi
