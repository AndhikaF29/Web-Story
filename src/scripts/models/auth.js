import { CONFIG } from '../utils/config';

class Auth {
  constructor() {
    this.TOKEN_KEY = CONFIG.AUTH_KEY;
    this.USER_KEY = 'dicoding-story-user';
  }

  setAuth(token, user) {
    try {
      // Menyimpan token dalam format yang kompatibel dengan ApiService
      const authData = JSON.stringify({ token, user });
      localStorage.setItem(this.TOKEN_KEY, authData);
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
      return true;
    } catch (error) {
      console.error('Error menyimpan data autentikasi:', error);
      return false;
    }
  }

  getAuth() {
    try {
      const token = this.getToken();
      const userStr = localStorage.getItem(this.USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;

      return {
        token,
        user,
        isAuthenticated: !!token,
      };
    } catch (error) {
      console.error('Error mengambil data autentikasi:', error);
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    }
  }

  getToken() {
    try {
      const authData = localStorage.getItem(this.TOKEN_KEY);
      if (!authData) return null;

      try {
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

  isLoggedIn() {
    const token = this.getToken();
    return !!token;
  }

  // Add isUserAuthenticated method for compatibility
  isUserAuthenticated() {
    return this.isLoggedIn();
  }

  clearAuth() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      return true;
    } catch (error) {
      console.error('Error menghapus data autentikasi:', error);
      return false;
    }
  }

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

export default Auth;
