const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api'; // Vercel routing handles this

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/index.html';
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return { success: false, error: 'Network error or server is unreachable.' };
  }
}

const apiGet = (endpoint) => apiFetch(endpoint);
const apiPost = (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
const apiPut = (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
const apiDelete = (endpoint) => apiFetch(endpoint, { method: 'DELETE' });

window.api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
};
