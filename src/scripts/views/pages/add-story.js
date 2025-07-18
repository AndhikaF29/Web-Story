// filepath: d:\Kuliah\Dicoding\tugas Intermidiate\20250603165950a53afbc93665b37102a9588267b6da0b\src\scripts\views\pages\add-story.js
import Utils from '../../utils/utils';
import L from 'leaflet';
import StoryModel from '../../models/storyModel';
import AddStoryPresenter from '../../presenters/addStoryPresenter';

// Use Bootstrap from global scope (loaded via CDN)
const bootstrap = window.bootstrap;

const AddStory = {
  async render() {
    return `
            <div class="page-transition">
                <h1 class="mb-4">Add New Story</h1>
                <div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 11"></div>
                <form id="addStoryForm" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" rows="3" required></textarea>
                        <div class="invalid-feedback">Please provide a description.</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Photo</label>
                        <div class="d-flex flex-column align-items-start gap-3">
                            <div class="btn-group" role="group" aria-label="Photo upload options">
                                <button type="button" class="btn btn-primary" id="startCamera">
                                    <i class="bi bi-camera"></i> Use Camera
                                </button>
                                <label class="btn btn-primary" for="fileInput">
                                    <i class="bi bi-upload"></i> Upload Photo
                                </label>
                            </div>
                            <input type="file" 
                                   class="d-none" 
                                   id="fileInput" 
                                   accept="image/*"
                                   aria-label="Upload photo">
                            <video id="cameraPreview" class="camera-preview d-none"></video>
                            <button type="button" class="btn btn-success d-none" id="capturePhoto">
                                <i class="bi bi-camera"></i> Take Photo
                            </button>
                            <img id="photoPreview" class="img-fluid d-none mb-2" 
                                 alt="Photo preview" style="max-width: 300px">
                            <button type="button" 
                                    class="btn btn-outline-danger btn-sm d-none" 
                                    id="removePhoto">
                                <i class="bi bi-trash"></i> Remove Photo
                            </button>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Location</label>
                        <div id="locationMap" class="map-container"></div>
                        <p class="text-muted small">Click on the map to set your location</p>
                    </div>

                    <button type="submit" class="btn btn-primary">Submit Story</button>
                </form>
            </div>
        `;
  },
  async afterRender() {
    // Inisialisasi Model dan Presenter
    this._storyModel = new StoryModel();
    this._presenter = new AddStoryPresenter({
      view: this,
      storyModel: this._storyModel,
    });

    // State untuk view
    this._mediaStream = null;
    this._photoBlob = null;
    this._selectedLocation = null;
    this._photoSource = null; // 'camera' or 'upload'

    // Initialize UI components
    this._toastContainer = document.getElementById('toast-container');

    // Initialize map
    const map = L.map('locationMap').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker = null;
    map.on('click', e => {
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker(e.latlng).addTo(map);
      this._selectedLocation = e.latlng;
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          // Add a marker at user's location if none exists yet
          if (!this._selectedLocation) {
            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map);
            this._selectedLocation = { lat: latitude, lng: longitude };
          }
        },
        error => {
          // Handle GeolocationPositionError properly
          let errorMessage = 'Unable to get your location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = 'An unknown error occurred while getting location';
              break;
          }

          console.warn('Geolocation error:', errorMessage);
          // Just show a small notification instead of an intrusive alert
          this.showToast(`${errorMessage}. You can still select location manually on the map.`);

          // Center map to default location (Indonesia)
          map.setView([-2.5, 118], 5);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    // Photo handling elements
    const startCameraBtn = document.getElementById('startCamera');
    const capturePhotoBtn = document.getElementById('capturePhoto');
    const cameraPreview = document.getElementById('cameraPreview');
    const photoPreview = document.getElementById('photoPreview');
    const fileInput = document.getElementById('fileInput');
    const removePhotoBtn = document.getElementById('removePhoto');

    // File upload handling
    fileInput.addEventListener('change', async event => {
      const file = event.target.files[0];
      if (file) {
        try {
          // Stop any active camera stream
          Utils.stopMediaStream(this._mediaStream);
          cameraPreview.classList.add('d-none');
          capturePhotoBtn.classList.add('d-none');

          // Display and store the uploaded photo
          this._photoBlob = file;
          photoPreview.src = URL.createObjectURL(file);
          photoPreview.classList.remove('d-none');
          removePhotoBtn.classList.remove('d-none');
          this._photoSource = 'upload';
        } catch (error) {
          this.showError('Failed to load photo: ' + error.message);
        }
      }
    });

    // Photo removal handling
    removePhotoBtn.addEventListener('click', () => {
      this._photoBlob = null;
      this._photoSource = null;
      photoPreview.classList.add('d-none');
      removePhotoBtn.classList.add('d-none');
      fileInput.value = ''; // Reset file input
    });

    // Camera handling
    startCameraBtn.addEventListener('click', async () => {
      try {
        // Reset file input when switching to camera
        fileInput.value = '';
        this._photoSource = 'camera';

        this._mediaStream = await Utils.initCamera();
        if (!this._mediaStream) {
          // Jika kamera tidak tersedia, tampilkan error dan exit
          this.showError(
            'Kamera tidak tersedia atau ijin ditolak. Silakan upload foto sebagai gantinya.'
          );
          return;
        }

        cameraPreview.srcObject = this._mediaStream;
        cameraPreview.classList.remove('d-none');
        capturePhotoBtn.classList.remove('d-none');
        removePhotoBtn.classList.add('d-none');
        photoPreview.classList.add('d-none');
        await cameraPreview.play();
      } catch (error) {
        this.showError(
          'Gagal mengakses kamera: ' +
            (error.message || 'Unknown error') +
            '. Silakan upload foto sebagai gantinya.'
        );
      }
    });

    // Photo capture button event handler
    capturePhotoBtn.addEventListener('click', async () => {
      try {
        this._photoBlob = await Utils.capturePhoto(cameraPreview);
        photoPreview.src = URL.createObjectURL(this._photoBlob);
        photoPreview.classList.remove('d-none');
        removePhotoBtn.classList.remove('d-none');
        Utils.stopMediaStream(this._mediaStream);
        cameraPreview.classList.add('d-none');
        capturePhotoBtn.classList.add('d-none');
      } catch (error) {
        this.showError('Failed to capture photo: ' + error.message);
      }
    });

    // Form submission handler
    const form = document.getElementById('addStoryForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      if (!this._photoBlob) {
        this.showError('Please take a photo first');
        return;
      }

      // Siapkan data cerita
      const description = document.getElementById('description').value;
      const storyData = {
        description,
        photo: this._photoBlob,
      };

      if (this._selectedLocation) {
        storyData.lat = this._selectedLocation.lat;
        storyData.lon = this._selectedLocation.lng;
      }

      // Gunakan presenter untuk menambah cerita
      await this._presenter.addStory(storyData);
    });
  },

  // View methods yang dipanggil oleh presenter
  showLoading() {
    Utils.showLoading();
  },

  hideLoading() {
    Utils.hideLoading();
  },

  showError(message) {
    Utils.showAlert(message, 'warning');
  },

  showSuccess(message) {
    Utils.showAlert(message, 'success');
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

  navigateToHome() {
    window.location.hash = '#/home';
  },

  // Method untuk membersihkan resources saat berpindah halaman
  cleanup() {
    if (this._mediaStream) {
      Utils.stopMediaStream(this._mediaStream);
      this._mediaStream = null;
    }

    // Bersihkan photo preview URLs untuk mencegah memory leaks
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview && photoPreview.src && photoPreview.src.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview.src);
    }
  },
};

export default AddStory;
