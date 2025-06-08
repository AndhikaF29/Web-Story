import { CONFIG } from './config';

const IndexedDBHelper = {
  /**
   * Inisialisasi IndexedDB berdasarkan konfigurasi yang ada
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION);

      // Event ketika database perlu diupgrade (misal: pertama kali dibuat)
      request.onupgradeneeded = event => {
        const db = event.target.result;

        // Buat object store jika belum ada
        if (!db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)) {
          db.createObjectStore(CONFIG.OBJECT_STORE_NAME, { keyPath: 'id' });
          console.log('IndexedDB: Object store berhasil dibuat');
        }
      };

      // Event ketika koneksi database berhasil
      request.onsuccess = event => {
        const db = event.target.result;
        console.log('IndexedDB: Koneksi berhasil');
        resolve(db);
      };

      // Event jika terjadi error
      request.onerror = event => {
        console.error('IndexedDB: Error saat membuka database', event.target.error);
        reject(event.target.error);
      };
    });
  },

  /**
   * Menyimpan story ke IndexedDB
   * @param {Object} story - Story object untuk disimpan
   */
  async saveStory(story) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.init();
        const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);

        // Tambahkan flag untuk menandai story disimpan offline
        const storyToSave = { ...story, isSaved: true };
        const request = store.put(storyToSave);

        request.onsuccess = () => {
          console.log('IndexedDB: Story berhasil disimpan', story.id);
          resolve(true);
        };

        request.onerror = event => {
          console.error('IndexedDB: Gagal menyimpan story', event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error('IndexedDB: Error saat menyimpan story', error);
        reject(error);
      }
    });
  },

  /**
   * Mengambil semua story tersimpan dari IndexedDB
   * @returns {Promise<Array>} - List story yang tersimpan
   */
  async getAllStories() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.init();
        const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readonly');
        const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = event => {
          console.error('IndexedDB: Gagal mengambil stories', event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error('IndexedDB: Error saat mengambil stories', error);
        reject(error);
      }
    });
  },

  /**
   * Menghapus story dari IndexedDB berdasarkan ID
   * @param {string} id - ID story yang akan dihapus
   */
  async deleteStory(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.init();
        const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          console.log('IndexedDB: Story berhasil dihapus', id);
          resolve(true);
        };

        request.onerror = event => {
          console.error('IndexedDB: Gagal menghapus story', event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error('IndexedDB: Error saat menghapus story', error);
        reject(error);
      }
    });
  },

  /**
   * Memeriksa apakah story dengan ID tertentu sudah tersimpan
   * @param {string} id - ID story yang akan dicek
   * @returns {Promise<boolean>} - True jika story tersimpan
   */
  async isStoryExists(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.init();
        const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readonly');
        const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(!!request.result);
        };

        request.onerror = event => {
          console.error('IndexedDB: Error saat memeriksa story', event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error('IndexedDB: Error saat memeriksa story', error);
        reject(error);
      }
    });
  },

  /**
   * Menghapus semua story dari IndexedDB
   */
  async deleteAllStories() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.init();
        const tx = db.transaction(CONFIG.OBJECT_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CONFIG.OBJECT_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('IndexedDB: Semua story berhasil dihapus');
          resolve(true);
        };

        request.onerror = event => {
          console.error('IndexedDB: Gagal menghapus semua story', event.target.error);
          reject(event.target.error);
        };

        tx.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error('IndexedDB: Error saat menghapus semua story', error);
        reject(error);
      }
    });
  },
};

export default IndexedDBHelper;
