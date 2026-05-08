import axios from 'axios';

// Attach axios to the window object for global access
// @ts-ignore
window.axios = axios;

// Set default headers for Laravel compatibility
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Grab CSRF token from meta tag and set it on axios
const tokenMeta = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
if (tokenMeta) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = tokenMeta.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}
