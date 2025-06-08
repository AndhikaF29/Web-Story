import ApiService from '../utils/api';
import { CONFIG } from '../utils/config';

class AuthModel {
  constructor() {
    this._user = null;
    this.TOKEN_KEY = CONFIG.AUTH_KEY; // Use same key as Auth class
    this.USER_KEY = 'dicoding-story-user';
  }

  /**
   * Memeriksa apakah pengguna sudah login
   * @returns {boolean} - Status login pengguna
   */
  isLoggedIn() {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Mengambil token dari localStorage
   * @returns {string|null} - Token autentikasi
   */
  getToken() {
    try {
      const authData = localStorage.getItem(this.TOKEN_KEY);
      if (!authData) return null;

      try {
        // Try to parse as JSON first (new format)
        const { token } = JSON.parse(authData);
        return token;
      } catch (parseError) {
        // Fallback untuk format lama (jika ada)
        return authData;
      }
    } catch (error) {
      console.error('Error mengambil token:', error);
      return null;
    }
  }

  /**
   * Mengambil data autentikasi dari localStorage (legacy support)
   * @returns {Object|null} - Data autentikasi pengguna
   */
  getAuthData() {
    try {
      const token = this.getToken();
      const userStr = localStorage.getItem(this.USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;

      return token ? { token, user } : null;
    } catch (error) {
      console.error('Error mengambil data autentikasi:', error);
      return null;
    }
  }

  /**
   * Menyimpan data autentikasi ke localStorage
   * @param {Object} userData - Data pengguna yang akan disimpan
   */
  setAuthData(userData) {
    try {
      if (userData.token) {
        // Store token in the same format as Auth class
        const authData = JSON.stringify({
          token: userData.token,
          user: userData.user || userData,
        });
        localStorage.setItem(this.TOKEN_KEY, authData);
      }
      if (userData.user || userData.name || userData.email) {
        const user = userData.user || {
          name: userData.name,
          email: userData.email,
          userId: userData.userId || userData.id,
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._user = user;
      }
    } catch (error) {
      console.error('Error menyimpan data autentikasi:', error);
    }
  }

  /**
   * Login pengguna
   * @param {Object} credentials - Kredensial login (email, password)
   * @returns {Promise<Object>} - Data user setelah login
   */
  async login(credentials) {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      const userData = await ApiService.login(credentials);
      console.log('Login response received:', userData);

      this.setAuthData(userData);
      console.log('Auth data saved successfully');

      return userData;
    } catch (error) {
      console.error('Login error in AuthModel:', error);
      throw error;
    }
  }

  /**
   * Register pengguna baru
   * @param {Object} userData - Data registrasi (name, email, password)
   * @returns {Promise<Object>} - Response dari API
   */
  async register(userData) {
    return await ApiService.register(userData);
  }

  /**
   * Logout pengguna
   */
  logout() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this._user = null;
    } catch (error) {
      console.error('Error menghapus data autentikasi:', error);
    }
  }

  /**
   * Mengambil data user
   * @returns {Object|null} - Data user
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error mengambil data user:', error);
      return null;
    }
  }
}

export default AuthModel;
