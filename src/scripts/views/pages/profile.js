import Utils from '../../utils/utils';
import AuthModel from '../../models/authModel';
import ProfilePresenter from '../../presenters/profilePresenter';
import IndexedDBHelper from '../../utils/idb-helper';

const Profile = {
  async render() {
    this._authModel = new AuthModel();
    this._presenter = new ProfilePresenter({
      view: this,
      authModel: this._authModel,
    });
    const userData = this._presenter.getUserProfile();
    if (!userData) {
      return ''; // Redirect will be handled in getUserProfile
    }

    // Validasi data user dengan fallback values
    const safeUserData = {
      name: userData.name || userData.user?.name || 'Tidak tersedia',
      userId: userData.userId || userData.user?.userId || userData.id || 'Tidak tersedia',
    };
    return `
            <div class="page-transition">
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h1 class="card-title">Profile</h1>
                                <div class="mb-3">
                                    <strong>Name:</strong>
                                    <p>${Utils.escapeHtml(safeUserData.name)}</p>
                                </div>
                                <div class="mb-3">
                                    <strong>User ID:</strong>
                                    <p>${Utils.escapeHtml(safeUserData.userId)}</p>
                                </div>
                                <button id="logoutBtn" class="btn btn-danger">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h2 class="card-title">Cerita Tersimpan</h2>
                                    <button id="clearAllSavedBtn" class="btn btn-sm btn-outline-danger">
                                        <i class="bi bi-trash"></i> Hapus Semua
                                    </button>
                                </div>
                                <div id="savedStories" class="row g-4">
                                    <div class="col-12 text-center py-5">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2 text-muted">Memuat cerita tersimpan...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>        `;
  },

  async afterRender() {
    // Setup event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    const clearAllSavedBtn = document.getElementById('clearAllSavedBtn');
    this._savedStoriesContainer = document.getElementById('savedStories');

    // Check if the container exists before proceeding
    if (!this._savedStoriesContainer) {
      console.error('savedStories container not found');
      return;
    }

    // Load saved stories
    this.loadSavedStories();

    logoutBtn.addEventListener('click', async () => {
      // Gunakan presenter untuk melakukan logout
      await this._presenter.logout();
    });

    clearAllSavedBtn.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin menghapus semua cerita tersimpan?')) {
        try {
          await IndexedDBHelper.deleteAllStories();
          this.loadSavedStories(); // Reload after deletion
          Utils.showAlert('Semua cerita tersimpan berhasil dihapus', 'success');
        } catch (error) {
          Utils.showAlert('Gagal menghapus cerita: ' + error.message, 'danger');
        }
      }
    });
  },

  // View methods yang dipanggil oleh presenter
  async unsubscribeNotifications() {
    try {
      const userData = this._authModel.getAuthData();
      if (userData?.token) {
        // Unsubscribe from push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Ini masih memanggil API langsung, idealnya dipindah ke AuthModel
          // tapi memerlukan modifikasi API service
          // await this._authModel.unsubscribePushNotification(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }
    } catch (error) {
      console.error('Error during unsubscribe:', error);
    }
  },

  showSuccess(message) {
    Utils.showAlert(message, 'success');
  },

  showError(message) {
    Utils.showAlert(message, 'danger');
  },

  redirectToLogin() {
    document.body.classList.remove('logged-in');
    window.location.hash = '#/login';
  },

  // Fungsi untuk memuat cerita yang tersimpan
  async loadSavedStories() {
    try {
      this._savedStoriesContainer.innerHTML = `
        <div class="col-12 text-center">
          <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <p class="mt-2 text-muted">Memuat cerita tersimpan...</p>
        </div>
      `;

      const stories = await IndexedDBHelper.getAllStories();

      if (!stories || stories.length === 0) {
        this._savedStoriesContainer.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="bi bi-bookmark fa-3x text-muted mb-3"></i>
            <h3 class="text-muted">Tidak ada cerita tersimpan</h3>
            <p class="text-muted">Simpan cerita untuk dibaca offline di halaman utama</p>
            <a href="#/home" class="btn btn-primary">
              <i class="bi bi-house me-2"></i>Kembali ke Home
            </a>
          </div>
        `;
        return;
      }

      this._savedStoriesContainer.innerHTML = '';

      stories.forEach(story => {
        const storyEl = document.createElement('div');
        storyEl.className = 'col-md-6 mb-4';
        storyEl.innerHTML = `
          <div class="card h-100">
            <img src="${story.photoUrl}" 
                 class="card-img-top" 
                 alt="Cerita dari ${Utils.escapeHtml(story.name)}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='./images/placeholder.svg';">
            <div class="card-body">
              <h5 class="card-title">${Utils.escapeHtml(story.name)}</h5>
              <p class="card-text">${Utils.escapeHtml(story.description)}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">
                  Diposting pada ${Utils.formatDate(story.createdAt)}
                </small>
                <button class="btn btn-sm btn-outline-danger delete-story-btn" 
                  data-id="${story.id}">
                  <i class="bi bi-trash"></i> Hapus
                </button>
              </div>
            </div>
          </div>
        `;
        this._savedStoriesContainer.appendChild(storyEl);
      });

      // Bind delete buttons
      document.querySelectorAll('.delete-story-btn').forEach(button => {
        button.addEventListener('click', async event => {
          const storyId = event.currentTarget.dataset.id;
          if (confirm('Apakah Anda yakin ingin menghapus cerita ini dari penyimpanan offline?')) {
            try {
              await IndexedDBHelper.deleteStory(storyId);
              this.loadSavedStories(); // Refresh list
              Utils.showAlert('Cerita berhasil dihapus', 'success');
            } catch (error) {
              Utils.showAlert('Gagal menghapus cerita: ' + error.message, 'danger');
            }
          }
        });
      });
    } catch (error) {
      this._savedStoriesContainer.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-danger" role="alert">
            Gagal memuat cerita tersimpan: ${error.message}
          </div>
        </div>
      `;
    }
  },
};

export default Profile;
