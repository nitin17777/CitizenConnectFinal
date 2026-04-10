import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token or demo role header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  const demoRole = localStorage.getItem('cc_demo_role');
  const demoMode = localStorage.getItem('cc_demo_mode') === 'true';

  if (demoMode && demoRole) {
    config.headers['x-demo-role'] = demoRole;
  } else if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
