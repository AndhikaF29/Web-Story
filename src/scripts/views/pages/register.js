import Utils from '../../utils/utils';
import AuthModel from '../../models/authModel';
import RegisterPresenter from '../../presenters/registerPresenter';

const Register = {
  async render() {
    return `
            <div class="page-transition">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <h1 class="mb-4">Register</h1>
                        <form id="registerForm" class="needs-validation" novalidate>
                            <div class="mb-3">
                                <label for="name" class="form-label">Name</label>
                                <input type="text" class="form-control" id="name" required>
                                <div class="invalid-feedback">
                                    Please provide your name.
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" required>
                                <div class="invalid-feedback">
                                    Please provide a valid email.
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input type="password" class="form-control" id="password" 
                                       required minlength="8">
                                <div class="invalid-feedback">
                                    Password must be at least 8 characters.
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">Register</button>
                        </form>
                        <p class="mt-3">
                            Already have an account? 
                            <a href="#/login">Login here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
  },
  async afterRender() {
    // Inisialisasi Model dan Presenter
    this._authModel = new AuthModel();
    this._presenter = new RegisterPresenter({
      view: this,
      authModel: this._authModel,
    });

    // Setup event listeners
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Form validation
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      // Get form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Ask presenter to perform registration
      await this._presenter.register({ name, email, password });
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
    Utils.showAlert(message, 'danger');
  },

  showSuccess(message) {
    Utils.showAlert(message, 'success');
  },

  navigateToLogin() {
    window.location.hash = '#/login';
  },
};

export default Register;
