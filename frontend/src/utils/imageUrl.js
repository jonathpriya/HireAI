export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // If explicitly configured with VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    let backendBase = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    if (!backendBase.startsWith('http://') && !backendBase.startsWith('https://')) {
      backendBase = `https://${backendBase}`;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${backendBase}${cleanPath}`;
  }

  // In local development, default to localhost:8000 if not running through full proxy
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:8000${cleanPath}`;
  }

  // In production without VITE_API_URL, use relative path (works with reverse proxies / rewrites)
  return path.startsWith('/') ? path : `/${path}`;
};
