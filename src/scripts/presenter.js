import { CONFIG } from './utils/config';
import Home from './views/pages/home';
import Login from './views/pages/login';
import AppShell from './views/app-shell';
import A from './auth-global';

class Presenter {
  constructor({ routes }) {
    this._routes = routes;
    this._currentPage = null;
    this._auth = A; // Use global Auth instance
    window.addEventListener('hashchange', this._handleUrlChange.bind(this));
    window.addEventListener('DOMContentLoaded', this._handleUrlChange.bind(this));
    this._initAuth();
  }
  _initAuth() {
    const isLoggedIn = this._auth.isLoggedIn();
    AppShell.setLoggedInState(isLoggedIn);
  }

  async _handleUrlChange() {
    // Cleanup halaman sebelumnya jika ada
    if (this._currentPage && typeof this._currentPage.cleanup === 'function') {
      this._currentPage.cleanup();
    }
    let page = this._getPage();
    if (!this._isAuthenticated() && this._needsAuth(page)) {
      AppShell.showAlert('Silakan login terlebih dahulu', 'warning');
      page = Login;
      window.location.hash = '/login';
    }

    try {
      AppShell.setContent(await page.render());
      await page.afterRender();

      // Simpan referensi halaman saat ini
      this._currentPage = page;

      // Scroll to top after page change
      AppShell.scrollToTop();
    } catch (error) {
      console.error('Error rendering page:', error);
      AppShell.showAlert('Terjadi kesalahan saat memuat halaman', 'danger');
    }
  }

  _getPage() {
    const hash = window.location.hash || '#/';
    const route = this._routes[hash.slice(1)] || Home;
    return route;
  }
  _isAuthenticated() {
    return this._auth.isLoggedIn();
  }
  _needsAuth(page) {
    // Profile dan AddStory memerlukan autentikasi
    return page === this._routes['/profile'] || page === this._routes['/add'];
  }
}

export default Presenter;
