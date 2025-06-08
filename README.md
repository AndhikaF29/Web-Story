# Story App - PWA Edition

Aplikasi modern untuk berbagi cerita dengan foto dan lokasi. Dibangun dengan JavaScript vanilla dan mengimplementasikan arsitektur Single Page Application (SPA).

## Fitur Utama

- **Autentikasi Pengguna:** Login dan register
- **Berbagi Cerita:** Melihat dan mengunggah cerita dengan foto dan lokasi
- **Progressive Web App (PWA):** Dapat diinstal di homescreen dan berfungsi offline
- **Push Notification:** Mendapatkan notifikasi ketika ada cerita baru
- **Mode Offline:** Menyimpan dan membaca cerita secara offline dengan IndexedDB
- **Integrasi Peta:** Menampilkan lokasi cerita menggunakan Leaflet
- **Responsive Design:** Tampilan yang menyesuaikan berbagai perangkat

## Detail Teknis

- **Single Page Application:** Menggunakan hash-based routing
- **Arsitektur MVP:** Model-View-Presenter untuk pemisahan logika dan tampilan
- **Service Worker:** Untuk mendukung fungsi offline dan caching
- **IndexedDB:** Penyimpanan lokal untuk cerita offline
- **WebPush API:** Implementasi push notification
- **Leaflet Maps:** Untuk menampilkan lokasi pada peta interaktif
- **Camera API:** Untuk mengambil foto dari kamera perangkat

## Cara Menjalankan Aplikasi

### Mode Development

1. Clone repository (atau download)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm start
   ```
4. Buka http://localhost:8080 di browser Anda

### Build Production

```bash
# Build untuk production
npm run build

# Jalankan server untuk testing
npm run serve
```

## Deployment

Aplikasi ini dapat di-deploy menggunakan:

- **GitHub Pages** - Untuk hosting statis
- **Netlify** - Untuk continuous deployment
- **Firebase Hosting** - Solusi hosting dari Google

## Dokumentasi API

Aplikasi ini menggunakan Story API dari Dicoding. Dokumentasi dapat ditemukan di:
https://story-api.dicoding.dev/v1

## Progressive Web App (PWA)

Aplikasi ini dapat diinstal sebagai PWA pada perangkat yang didukung. Fitur-fitur meliputi:

- **Offline Mode:** Dapat digunakan tanpa internet
- **Add to Home Screen:** Dapat diinstal di homescreen seperti aplikasi native
- **Push Notifications:** Menerima notifikasi untuk cerita baru
- **Responsif:** Tampilan yang menyesuaikan dengan berbagai ukuran layar

## Kriteria Submission

- ✅ Menggunakan API dari Dicoding sebagai sumber data
- ✅ Arsitektur single-page application
- ✅ Fitur menampilkan dan menambah data
- ✅ Aksesibilitas web sesuai standar
- ✅ Transisi halaman yang halus
- ✅ Push notification dengan VAPID key
- ✅ PWA yang installable dan offline-capable
- ✅ Menggunakan IndexedDB untuk penyimpanan offline
- ✅ Tersedia secara publik melalui deployment
- Responsive design

## Browser Support

The application supports modern browsers that implement the following features:

- Service Workers
- Cache API
- IndexedDB
- Push API
- Camera API
- Geolocation API

## Development

The project follows these key principles:

1. Single Page Application architecture
2. MVP pattern for state management
3. Semantic HTML and accessibility standards
4. Progressive enhancement
5. Responsive design

## License

This project is educational in nature and is part of Dicoding's coursework.
