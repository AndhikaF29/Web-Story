class LoginPresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;

    // Login presenter menghubungkan view dengan model autentikasi
  }

  /**
   * Melakukan proses login
   * @param {Object} credentials - Kredensial login (email, password)
   */
  async login(credentials) {
    try {
      this._view.showLoading();

      // Menggunakan model untuk melakukan login
      await this._authModel.login(credentials);

      // Sukses login, beri tahu view untuk melakukan navigasi
      this._view.navigateToHome();
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default LoginPresenter;
