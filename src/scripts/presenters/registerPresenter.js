class RegisterPresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;
  }

  /**
   * Melakukan proses pendaftaran
   * @param {Object} userData - Data pengguna untuk registrasi (name, email, password)
   */
  async register(userData) {
    try {
      this._view.showLoading();

      // Menggunakan model untuk melakukan registrasi
      await this._authModel.register(userData);

      // Sukses registrasi
      this._view.showSuccess('Registration successful! Please login.');
      this._view.navigateToLogin();
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default RegisterPresenter;
