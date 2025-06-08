class HomePresenter {
  constructor({ view, storyModel, indexedDBHelper }) {
    this._view = view;
    this._storyModel = storyModel;
    this._indexedDBHelper = indexedDBHelper;
    this._offlineMode = false;

    // Presenter sebagai perantara antara view dan model
    this._bindEvents();
  }

  /**
   * Menghubungkan event dari view dengan method presenter
   */
  _bindEvents() {
    this._view.bindOfflineToggle(this._handleOfflineToggle.bind(this));
    this._view.bindSaveStoryBtn(this._handleSaveStory.bind(this));
    this._view.bindDeleteSavedStoryBtn(this._handleDeleteSavedStory.bind(this));
  }

  /**
   * Handle toggle mode offline
   */
  async _handleOfflineToggle(isOffline) {
    this._offlineMode = isOffline;
    await this.showStories();
  }

  /**
   * Handle aksi menyimpan cerita
   */
  async _handleSaveStory(storyId) {
    try {
      // Mendapatkan detail cerita dari model
      const story = await this._storyModel.getStoryDetail(storyId);

      // Menyimpan ke IndexedDB
      await this._indexedDBHelper.saveStory(story);

      // Update UI
      this._view.updateSaveButtonState(storyId, true);
      this._view.showToast('Cerita berhasil disimpan untuk dibaca offline');
    } catch (error) {
      this._view.showError('Gagal menyimpan cerita: ' + error.message);
    }
  }

  /**
   * Handle aksi menghapus cerita tersimpan
   */
  async _handleDeleteSavedStory(storyId) {
    try {
      // Hapus dari IndexedDB
      await this._indexedDBHelper.deleteStory(storyId);

      // Update UI
      this._view.updateSaveButtonState(storyId, false);

      // Refresh tampilan jika dalam mode offline
      if (this._offlineMode) {
        await this.showStories();
      } else {
        this._view.showToast('Cerita berhasil dihapus dari penyimpanan offline');
      }
    } catch (error) {
      this._view.showError('Gagal menghapus cerita: ' + error.message);
    }
  }

  /**
   * Mengambil dan menampilkan cerita
   */
  async showStories() {
    try {
      this._view.showLoading();
      let stories = [];

      // Cek apakah dalam mode offline atau online
      if (this._offlineMode) {
        // Ambil stories dari IndexedDB
        stories = await this._indexedDBHelper.getAllStories();
        this._view.setOfflineNotification(true);
      } else {
        // Ambil stories dari API
        stories = await this._storyModel.getAllStories({ location: 1 });
        this._view.setOfflineNotification(false);

        // Tandai stories yang sudah disimpan
        const savedStories = await this._indexedDBHelper.getAllStories();
        const savedIds = savedStories.map(story => story.id);
        stories = stories.map(story => ({
          ...story,
          isSaved: savedIds.includes(story.id),
        }));
      }

      // Mengirim data ke view untuk ditampilkan
      this._view.renderStories(stories);

      // Render map jika ada data dengan lokasi
      const storiesWithLocation = stories.filter(story => story.lat && story.lon);
      if (storiesWithLocation.length > 0) {
        this._view.renderMap(storiesWithLocation);
      }
    } catch (error) {
      this._view.showError(error.message);

      // Jika error saat online, coba ambil dari IndexedDB sebagai fallback
      if (!this._offlineMode) {
        try {
          const savedStories = await this._indexedDBHelper.getAllStories();
          if (savedStories.length > 0) {
            this._view.renderStories(savedStories);
            this._view.setOfflineNotification(true);
            this._view.showToast('Menampilkan cerita dari penyimpanan offline');
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      }
    } finally {
      this._view.hideLoading();
    }
  }
}

export default HomePresenter;
