import Utils from '../../utils/utils';
import AuthModel from '../../models/authModel';
import LoginPresenter from '../../presenters/loginPresenter';

const Login = {
  async render() {
    return `
            <div class="page-transition">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <h1 class="mb-4">Login</h1>
                        <form id="loginForm" class="needs-validation" novalidate>
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
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                        <p class="mt-3">
                            Don't have an account? 
                            <a href="#/register">Register here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
  },
  async afterRender() {
    // Inisialisasi Model dan Presenter
    this._authModel = new AuthModel();
    this._presenter = new LoginPresenter({
      view: this,
      authModel: this._authModel,
    });

    // Setup event listeners
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Form validation
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      // Get form data
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Ask presenter to perform login
      await this._presenter.login({ email, password });
    });
  },

  // View methods that are called by presenter
  showLoading() {
    Utils.showLoading();
  },

  hideLoading() {
    Utils.hideLoading();
  },

  showError(message) {
    Utils.showAlert(message, 'danger');
  },

  navigateToHome() {
    document.body.classList.add('logged-in');
    Utils.showAlert('Login successful!');
    window.location.hash = '#/home';

    // Initialize push notifications if needed
    this._initPushNotifications();
  },

  async _initPushNotifications() {
    try {
      const registration = await Utils.initializeServiceWorker();
      const subscription = await Utils.subscribeToPushNotifications(registration);
      const authData = this._authModel.getAuthData();
      // Implement a method in AuthModel to handle this if needed
      // await this._authModel.subscribePushNotification(subscription);
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  },
};

export default Login;
