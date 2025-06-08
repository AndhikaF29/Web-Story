class ProfilePresenter {
  constructor({ view, authModel }) {
    this._view = view;
    this._authModel = authModel;
  }

  /**
   * Mendapatkan data profil pengguna
   */
  getUserProfile() {
    const userData = this._authModel.getAuthData();
    if (!userData) {
      this._view.redirectToLogin();
      return null;
    }
    return userData;
  }

  /**
   * Melakukan logout
   */
  async logout() {
    try {
      await this._view.unsubscribeNotifications();
      this._authModel.logout();
      this._view.showSuccess('Logged out successfully');
      this._view.redirectToLogin();
    } catch (error) {
      this._view.showError('Error during logout: ' + error.message);
    }
  }
}

export default ProfilePresenter;
