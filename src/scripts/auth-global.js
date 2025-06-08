// Global Auth instance untuk kompatibilitas dengan kode yang menggunakan A.isUserAuthenticated
import Auth from './models/auth';

// Buat singleton Auth instance
const A = new Auth();

// Jadikan variabel A tersedia secara global
window.A = A;

// Export untuk penggunaan di seluruh aplikasi
export default A;
