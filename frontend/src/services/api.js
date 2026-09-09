import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || '';
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}

const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api')
      ? rawApiUrl
      : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
