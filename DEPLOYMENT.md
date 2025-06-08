# Langkah-langkah Deployment

Dokumen ini berisi petunjuk untuk men-deploy aplikasi Story App ke berbagai platform hosting.

## 1. GitHub Pages

1. Buat repository GitHub baru
2. Build aplikasi:
   ```
   npm run build
   ```
3. Push folder `dist` ke branch `gh-pages`:
   ```
   git subtree push --prefix dist origin gh-pages
   ```
4. Aktifkan GitHub Pages di repository settings

## 2. Netlify

1. Buat akun di [Netlify](https://netlify.com)
2. Klik "New site from Git"
3. Pilih repository GitHub Anda
4. Konfigurasi build:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Klik "Deploy site"

## 3. Firebase Hosting

1. Buat akun Firebase dan buat project baru
2. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```
3. Login ke Firebase:
   ```
   firebase login
   ```
4. Inisialisasi Firebase di project:
   ```
   firebase init hosting
   ```
   - Pilih project Firebase Anda
   - Tentukan direktori publik: `dist`
   - Konfigurasi sebagai single-page app: `Yes`
5. Build aplikasi:
   ```
   npm run build
   ```
6. Deploy ke Firebase:
   ```
   firebase deploy
   ```

## Catatan Penting

- Pastikan Service Worker dapat berjalan dengan baik pada environment production
- Setelah deployment, isi URL hasil deployment di file `STUDENT.txt`
- Pastikan aplikasi dapat berjalan offline setelah di-deploy
