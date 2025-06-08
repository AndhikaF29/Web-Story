import { CONFIG } from './config';

class ApiService {
  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }
  static async login({ email, password }) {
    try {
      console.log('API: Sending login request to:', `${CONFIG.BASE_URL}/login`);
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('API: Login response status:', response.status);
      const responseJson = await response.json();
      console.log('API: Login response data:', responseJson);

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson.loginResult;
    } catch (error) {
      console.error('API: Login error:', error);
      throw error;
    }
  }

  static async getAllStories(token, { page = 1, size = 10, location = 1 } = {}) {
    const response = await fetch(
      `${CONFIG.BASE_URL}/stories?page=${page}&size=${size}&location=${location}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.listStory;
  }

  static async getStoryDetail(token, id) {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.story;
  }

  static async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static async addStoryAsGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static async subscribePushNotification(subscription) {
    const token = this.getToken();
    if (!token) throw new Error('Token tidak tersedia');

    const response = await fetch(`${CONFIG.BASE_URL}/push-notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  static async unsubscribePushNotification() {
    const token = this.getToken();
    if (!token) throw new Error('Token tidak tersedia');

    const response = await fetch(`${CONFIG.BASE_URL}/push-notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  static getToken() {
    const authData = localStorage.getItem(CONFIG.AUTH_KEY);
    if (!authData) return null;

    try {
      const { token } = JSON.parse(authData);
      return token;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }
}

export default ApiService;
