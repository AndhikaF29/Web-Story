class AppShell {
  static setContent(content) {
    const mainContent = document.querySelector('#pageContent');
    if (mainContent) {
      mainContent.innerHTML = content;
    }
  }

  static setLoggedInState(isLoggedIn) {
    if (isLoggedIn) {
      document.body.classList.add('logged-in');
    } else {
      document.body.classList.remove('logged-in');
    }
  }

  static scrollToTop() {
    window.scrollTo(0, 0);
  }

  static showAlert(message, type = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertContainer.setAttribute('role', 'alert');
    alertContainer.style.zIndex = '9999';
    alertContainer.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertContainer);

    setTimeout(() => {
      if (alertContainer.parentNode) {
        alertContainer.remove();
      }
    }, 5000);
  }

  static showLoading() {
    const loading = document.createElement('div');
    loading.className =
      'loading-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
    loading.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loading.style.zIndex = '9999';
    loading.innerHTML = `
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    `;
    document.body.appendChild(loading);
  }

  static hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
      loading.remove();
    }
  }
}

export default AppShell;
