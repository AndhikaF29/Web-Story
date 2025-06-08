import ApiService from '../utils/api';
import A from '../auth-global';

class StoryModel {
  constructor() {
    // Model menyimpan data yang diakses dari API
    this._stories = [];
    this._auth = A; // Use global Auth instance
  }

  /**
   * Mengambil token autentikasi
   */
  getToken() {
    return this._auth.getToken();
  }

  /**
   * Mengambil seluruh cerita dari API
   * @param {Object} options - Parameter opsional untuk pengambilan data
   * @returns {Promise<Array>} - Array berisi data cerita
   */
  async getAllStories(options = {}) {
    const token = this.getToken();
    this._stories = await ApiService.getAllStories(token, options);
    return this._stories;
  }

  /**
   * Menambahkan cerita baru
   * @param {Object} storyData - Data cerita yang akan ditambahkan
   * @returns {Promise<Object>} - Respons dari API setelah menambahkan cerita
   */
  async addStory(storyData) {
    const token = this.getToken();
    const response = await ApiService.addStory({
      token,
      ...storyData,
    });
    return response;
  }

  /**
   * Menambahkan cerita sebagai tamu (jika fitur ini tersedia)
   * @param {Object} storyData - Data cerita yang akan ditambahkan
   * @returns {Promise<Object>} - Respons dari API setelah menambahkan cerita
   */
  async addStoryAsGuest(storyData) {
    const response = await ApiService.addStoryAsGuest(storyData);
    return response;
  }

  /**
   * Mendapatkan detail cerita
   * @param {string} id - ID cerita yang ingin diambil detailnya
   * @returns {Promise<Object>} - Detail cerita
   */
  async getStoryDetail(id) {
    const token = this.getToken();
    return await ApiService.getStoryDetail(token, id);
  }
}

export default StoryModel;
