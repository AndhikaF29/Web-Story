// Import styles
import './styles/main.css';

// Use Leaflet from the global scope (loaded via CDN)
const L = window.L;

// Fix Leaflet's icon path issues when it's available
if (L && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Import app modules
import App from './scripts/app';
import Home from './scripts/views/pages/home';
import AddStory from './scripts/views/pages/add-story';
import Login from './scripts/views/pages/login';
import Register from './scripts/views/pages/register';
import Profile from './scripts/views/pages/profile';
import { CONFIG } from './scripts/utils/config';
import Utils from './scripts/utils/utils';
import ApiService from './scripts/utils/api';
// Import Auth global instance
import A from './scripts/auth-global';

// Fix Leaflet's icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'images/marker-icon-2x.png',
  iconUrl: 'images/marker-icon.png',
  shadowUrl: 'images/marker-shadow.png',
});

// Make Auth instance available globally
window.A = A;

// Initialize the app
const app = new App({
  home: Home,
  addStory: AddStory,
  login: Login,
  register: Register,
  profile: Profile,
  config: CONFIG,
  utils: Utils,
  api: ApiService,
});

// Register service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Check if service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        // Return the first registration if already registered
        console.log('Service worker already registered, using existing registration');
        return registrations[0];
      }

      // Register a new service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      // Don't throw error, let the application continue
    }
  } else {
    console.log('Service worker is not supported in this browser');
  }
  return null;
};

// Initialize push notification - hanya pada konteks yang mendukung
const initializePushNotification = async () => {
  // Pastikan user sudah login dan browser mendukung Service Worker & Push API
  if (
    !Utils.isUserAuthenticated() ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    console.log(
      'Push notification tidak dapat dijalankan: tidak login atau browser tidak mendukung'
    );
    return;
  }
  try {
    // Wait for service worker to be ready (important!)
    const registration = await navigator.serviceWorker.ready;

    // Check apakah subscription sudah ada
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Push notification subscription sudah ada');
      return;
    }

    try {
      // Buat subscription baru
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: CONFIG.VAPID_KEY,
      });

      console.log('Push notification subscription berhasil:', subscription);

      // Kirim subscription ke server hanya jika user sudah login
      if (Utils.isUserAuthenticated()) {
        try {
          const response = await ApiService.subscribePushNotification(subscription);
          console.log('Push notification terdaftar di server:', response);
        } catch (apiError) {
          console.error('Gagal mendaftarkan push notification ke server:', apiError);
        }
      }
    } catch (subscriptionError) {
      console.error('Failed to subscribe to push notifications:', subscriptionError);
      Utils.showAlert('Gagal mengaktifkan notifikasi: ' + subscriptionError.message, 'warning');
    }
  } catch (error) {
    // Handle error tapi jangan gagalkan inisialisasi aplikasi
    console.error('Gagal mendaftar push notification:', error.message);
  }
};

window.addEventListener('load', async () => {
  try {
    // Inisialisasi aplikasi terlebih dahulu
    await app.init();

    // Register service worker setelah aplikasi siap
    const swRegistration = await registerServiceWorker();

    // Hanya mencoba push notification jika SW berhasil diregistrasi
    if (swRegistration && Utils.isUserAuthenticated()) {
      // Jangan tunggu proses ini selesai, jalankan di background
      initializePushNotification().catch(err => {
        console.log(
          'Push notification tidak dapat diinisialisasi, tapi aplikasi tetap berjalan:',
          err.message
        );
      });
    }
  } catch (error) {
    // Log error tapi masih biarkan aplikasi berjalan
    console.error('Error saat inisialisasi aplikasi:', error.message);

    // Meskipun ada error, pastikan UI tidak menampilkan loading screen
    Utils.hideLoading();
    Utils.showAlert(
      'Aplikasi berjalan dalam mode terbatas. Beberapa fitur mungkin tidak berfungsi.',
      'warning'
    );
  }
});
