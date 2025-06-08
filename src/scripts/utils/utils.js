import { CONFIG } from './config';
import AppShell from '../views/app-shell';

class Utils {
  static escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
      return '';
    }
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(CONFIG.DEFAULT_LANGUAGE, options);
  }
  static async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Check if service worker is already registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          console.log('Service worker already registered, using existing registration');
          return registrations[0];
        }

        // Register a new service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Return null instead of throwing error to prevent app from crashing
        return null;
      }
    }
    console.warn('Service Worker is not supported in this browser');
    return null;
  }
  static async subscribeToPushNotifications(registration) {
    if (!registration) {
      console.warn(
        'Cannot subscribe to push notifications: Service worker registration is not available'
      );
      return null;
    }

    try {
      // Check if browser supports push manager
      if (!registration.pushManager) {
        console.warn('Push manager is not available in this browser');
        return null;
      }

      // Check if we already have a subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Using existing push notification subscription');
        return existingSubscription;
      }

      // Create a new subscription with proper error handling
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: CONFIG.VAPID_KEY,
        });
        return subscription;
      } catch (subscribeError) {
        // Handle common push subscription errors
        if (subscribeError.name === 'NotAllowedError') {
          console.warn('Push notification permission was denied by user');
        } else if (subscribeError.name === 'AbortError') {
          console.warn('Push notification subscription was aborted');
        } else {
          console.error('Failed to subscribe to push notifications:', subscribeError);
        }
        return null;
      }
    } catch (error) {
      console.error('General error in push notification setup:', error);
      // Return null instead of throwing to prevent app from crashing
      return null;
    }
  }
  static async initCamera() {
    // 1. Periksa apakah navigator tersedia
    if (!navigator) {
      console.error('Navigator API tidak tersedia');
      return null;
    }

    // 2. Periksa apakah mediaDevices tersedia
    if (!navigator.mediaDevices) {
      console.error('MediaDevices API tidak tersedia di browser ini');
      return null;
    }

    // 3. Periksa apakah getUserMedia tersedia
    if (!navigator.mediaDevices.getUserMedia) {
      console.error('Browser tidak mendukung getUserMedia');
      return null;
    }

    // 4. Coba akses kamera dengan error handling yang baik
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return null; // Return null instead of throwing error
    }
  }

  static stopMediaStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  static capturePhoto(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg');
    });
  }
  static showLoading() {
    AppShell.showLoading();
  }
  static hideLoading() {
    AppShell.hideLoading();
  }
  static showAlert(message, type = 'success') {
    AppShell.showAlert(message, type);
  }

  static isUserAuthenticated() {
    // Use the global Auth instance for consistency
    if (window.A && typeof window.A.isUserAuthenticated === 'function') {
      return window.A.isUserAuthenticated();
    }
    // Fallback to original implementation
    const authData = localStorage.getItem(CONFIG.AUTH_KEY);
    return !!authData;
  }
}

export default Utils;
