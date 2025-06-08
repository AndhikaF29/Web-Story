import Utils from '../../utils/utils';
import L from 'leaflet';
import StoryModel from '../../models/storyModel';
import HomePresenter from '../../presenters/homePresenter';
import IndexedDBHelper from '../../utils/idb-helper';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const Home = {
  async render() {
    return `
            <div class="page-transition">
                <h1 class="mb-4">Latest Stories</h1>
                
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div id="offlineNotification" class="text-warning" style="display: none;">
                        <i class="bi bi-exclamation-triangle"></i> Mode Offline: Menampilkan cerita tersimpan
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="offlineToggle">
                        <label class="form-check-label" for="offlineToggle">Mode Offline</label>
                    </div>
                </div>
                
                <div id="map" class="map-container mb-4"></div>
                
                <div id="stories" class="row g-4">
                    <div class="col-12 text-center">
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <p class="mt-2 text-muted">Memuat cerita...</p>
                    </div>
                </div>
                
                <div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
                </div>
            </div>
        `;
  },
  async afterRender() {
    // Inisialisasi Model dan IndexedDB Helper
    this._storyModel = new StoryModel();
    this._indexedDBHelper = IndexedDBHelper;

    // Inisialisasi komponen UI
    this._storiesContainer = document.getElementById('stories');
    this._offlineToggle = document.getElementById('offlineToggle');
    this._offlineNotification = document.getElementById('offlineNotification');
    this._mapContainer = document.getElementById('map');
    this._toastContainer = document.getElementById('toast-container');

    // Inisialisasi Map
    this._map = null;

    // Inisialisasi Presenter
    this._presenter = new HomePresenter({
      view: this,
      storyModel: this._storyModel,
      indexedDBHelper: this._indexedDBHelper,
    });

    // Meminta presenter untuk menampilkan cerita
    await this._presenter.showStories();
  },

  // View methods
  showLoading() {
    Utils.showLoading();
  },

  hideLoading() {
    Utils.hideLoading();
  },

  showError(message) {
    Utils.showAlert(message, 'danger');
  },

  showToast(message) {
    const toastId = 'toast-' + Date.now();
    const toast = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Story App</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

    this._toastContainer.insertAdjacentHTML('beforeend', toast);
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement);
    bsToast.show();

    // Hapus toast setelah ditutup
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  },

  setOfflineNotification(isVisible) {
    this._offlineNotification.style.display = isVisible ? 'block' : 'none';
  },

  // Mengikat fungsi toggle mode offline
  bindOfflineToggle(handler) {
    this._offlineToggle.addEventListener('change', event => {
      handler(event.target.checked);
    });
  },

  // Mengikat fungsi tombol simpan cerita
  bindSaveStoryBtn(handler) {
    document.querySelectorAll('.save-story-btn').forEach(button => {
      button.addEventListener('click', () => {
        const storyId = button.dataset.id;
        handler(storyId);
      });
    });
  },

  // Mengikat fungsi tombol hapus cerita tersimpan
  bindDeleteSavedStoryBtn(handler) {
    document.querySelectorAll('.delete-saved-story-btn').forEach(button => {
      button.addEventListener('click', () => {
        const storyId = button.dataset.id;
        handler(storyId);
      });
    });
  },

  // Memperbarui status tombol simpan
  updateSaveButtonState(storyId, isSaved) {
    const saveButton = document.querySelector(`.save-story-btn[data-id="${storyId}"]`);
    const deleteButton = document.querySelector(`.delete-saved-story-btn[data-id="${storyId}"]`);

    if (saveButton) {
      saveButton.style.display = isSaved ? 'none' : 'inline-block';
    }

    if (deleteButton) {
      deleteButton.style.display = isSaved ? 'inline-block' : 'none';
    }
  },

  // Menampilkan peta
  renderMap(stories) {
    // Bersihkan map sebelumnya jika ada
    if (this._map) {
      this._map.remove();
    }

    // Set default icon untuk marker
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Inisialisasi peta dengan fokus ke Indonesia
    this._map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this._map);

    // Tambahkan marker untuk setiap cerita yang memiliki lokasi
    stories.forEach(story => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .bindPopup(
            `
                          <strong>${Utils.escapeHtml(story.name)}</strong><br>
                          ${Utils.escapeHtml(story.description)}
                      `
          )
          .addTo(this._map);
      }
    });
  }, // Menampilkan daftar cerita
  renderStories(stories) {
    const storiesContainer = document.getElementById('stories');
    storiesContainer.innerHTML = '';

    if (!stories || stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-book fa-3x text-muted mb-3"></i>
            <h3 class="text-muted">Belum ada cerita</h3>
            <p class="text-muted">Mulai berbagi cerita Anda sekarang!</p>
            <a href="#/add" class="btn btn-primary">
              <i class="bi bi-plus me-2"></i>Tambah Cerita
            </a>
          </div>
        </div>
      `;
      return;
    }

    stories.forEach(story => {
      const storyEl = document.createElement('div');
      storyEl.className = 'col-md-4';
      storyEl.innerHTML = `
        <article class="card story-card h-100">
          <img src="${story.photoUrl}" 
               class="story-image card-img-top" 
               alt="Cerita dari ${Utils.escapeHtml(story.name)}"
               loading="lazy"
               onerror="this.onerror=null; this.src='./images/placeholder.svg';">
          <div class="card-body">
            <h2 class="h5 card-title">${Utils.escapeHtml(story.name)}</h2>
            <p class="card-text">${Utils.escapeHtml(story.description)}</p>
            <p class="card-text">
              <small class="text-muted">
                Diposting pada ${Utils.formatDate(story.createdAt)}
              </small>
            </p>
            ${
              Utils.isUserAuthenticated()
                ? `
              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-sm btn-outline-primary save-story-btn me-2" 
                  data-id="${story.id}" 
                  style="display: ${story.isSaved ? 'none' : 'inline-block'}">
                  <i class="bi bi-bookmark"></i> Simpan Offline
                </button>
                <button class="btn btn-sm btn-outline-danger delete-saved-story-btn" 
                  data-id="${story.id}" 
                  style="display: ${story.isSaved ? 'inline-block' : 'none'}">
                  <i class="bi bi-trash"></i> Hapus dari Offline
                </button>
              </div>
            `
                : ''
            }
          </div>
        </article>
      `;
      storiesContainer.appendChild(storyEl);
    });

    // Setelah render, aktifkan binding untuk tombol save dan delete
    if (Utils.isUserAuthenticated()) {
      this.bindSaveStoryBtn(this._presenter._handleSaveStory.bind(this._presenter));
      this.bindDeleteSavedStoryBtn(this._presenter._handleDeleteSavedStory.bind(this._presenter));
    }
  },

  // Method untuk membersihkan resources saat berpindah halaman
  cleanup() {
    // Bersihkan map jika ada
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  },
};

export default Home;
