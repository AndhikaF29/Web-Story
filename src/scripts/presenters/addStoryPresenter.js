class AddStoryPresenter {
  constructor({ view, storyModel }) {
    this._view = view;
    this._storyModel = storyModel;
  }

  /**
   * Menambahkan cerita baru
   * @param {Object} storyData - Data cerita yang akan ditambahkan
   */
  async addStory(storyData) {
    try {
      this._view.showLoading();

      // Menggunakan model untuk menambah cerita
      await this._storyModel.addStory(storyData);

      // Sukses menambahkan cerita
      this._view.showSuccess('Story added successfully');
      this._view.navigateToHome();
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default AddStoryPresenter;
