import { CONFIG } from './utils/config';
import ApiService from './utils/api';
import Utils from './utils/utils';
import routes from './routes';
import Presenter from './presenter';
import A from './auth-global';

class App {
  constructor() {
    this._presenter = null;
  }
  async init() {
    this._presenter = new Presenter({ routes });

    // Inisialisasi IndexedDB
    await this._initIndexedDB();

    // Register service worker untuk PWA dan push notification
    await this._registerServiceWorker();

    // Setup logout functionality
    document.getElementById('logout')?.addEventListener('click', e => {
      e.preventDefault();
      this._handleLogout();
    });
  }

  async _initIndexedDB() {
    try {
      // Pastikan IndexedDB tersedia
      if (!('indexedDB' in window)) {
        console.warn('Browser tidak mendukung IndexedDB');
        return;
      }

      // Import IndexedDBHelper dan inisialisasi
      const IndexedDBHelper = (await import('./utils/idb-helper')).default;
      await IndexedDBHelper.init();
      console.log('IndexedDB berhasil diinisialisasi');
    } catch (error) {
      console.error('Gagal menginisialisasi IndexedDB:', error);
    }
  }
  async _registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker is not supported in this browser');
      return;
    }

    try {
      // Wrap in a try-catch to handle potential browser compatibility issues
      try {
        // Check if service worker is already registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        let registration;

        if (registrations && registrations.length > 0) {
          // Use existing registration
          registration = registrations[0];
          console.log('Service worker already registered, using existing registration');
        } else {
          // Register new service worker
          registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        }

        // Check if push notification is supported and user is logged in
        if ('PushManager' in window) {
          const token = A.getToken();
          if (token) {
            const subscription = await Utils.subscribeToPushNotifications(registration);
            if (subscription) {
              await ApiService.subscribePushNotification(token, subscription);
              console.log('Push notification subscription successful');
            } else {
              console.warn('Failed to create push notification subscription');
            }
          }
        } else {
          console.warn('Push Manager not supported in this browser');
        }

        return registration;
      } catch (swError) {
        console.error('Error in service worker registration process:', swError);
        // Continue app execution even if service worker fails
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Don't throw error, let the application continue running
    }
  }
  async _handleLogout() {
    try {
      // Use A.getToken() instead of directly accessing localStorage
      const token = A.getToken();

      if (token && 'serviceWorker' in navigator) {
        // Check if serviceWorker is available and registered before accessing 'ready'
        if (navigator.serviceWorker.controller) {
          try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.pushManager) {
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                try {
                  await ApiService.unsubscribePushNotification(token, subscription.endpoint);
                  await subscription.unsubscribe();
                  console.log('Successfully unsubscribed from push notifications');
                } catch (subError) {
                  console.error('Error unsubscribing from push notifications:', subError);
                }
              }
            }
          } catch (swError) {
            console.error('Error accessing service worker during logout:', swError);
          }
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear auth data using Auth instance method
      A.clearAuth();
      document.body.classList.remove('logged-in');
      Utils.showAlert('Berhasil logout');
      window.location.hash = '#/login';
    }
  }
}

export default App;
