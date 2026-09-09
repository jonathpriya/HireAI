// HireAI Progressive Web App Service Worker
const CACHE_NAME = 'hireai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo.png',
  '/images/bg_tech_grid.jpg'
];

// Install Event - Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Non-critical pre-cache miss:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not cache API calls, chrome extensions, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.port === '8000' ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Network-first with cache fallback for navigation / documents
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 📱 Native Device Push Notification & Action Button Listeners
// ─────────────────────────────────────────────────────────────────────────────

// Listen for Push events from server / web push
self.addEventListener('push', (event) => {
  let payload = {
    title: 'HireAI • Career Status Check 🎯',
    body: 'Are you still actively searching for a job? Keep your profile visible to top recruiters.',
    tag: 'hireai-inactivity-check',
    data: { url: '/candidate/dashboard' }
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: payload.tag || 'hireai-inactivity-check',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: payload.data || { url: '/candidate/dashboard' },
    actions: [
      { action: 'yes_active', title: '🟢 Yes, Still Searching' },
      { action: 'no_pause', title: '🔴 No, Placed / Pause' }
    ]
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Listen for Notification click events (both button clicks and banner tap)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const notifData = event.notification.data || {};
  const token = notifData.token;

  // If user clicked either interactive button directly on their phone / system
  if (action === 'yes_active' || action === 'no_pause') {
    const isOpen = (action === 'yes_active');
    const apiUrl = (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000/api/candidate/open-to-work'
      : '/api/candidate/open-to-work';

    const updatePromise = fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ is_open_to_work: isOpen })
    })
    .then((res) => res.json())
    .catch((err) => {
      console.warn('Notification action background sync error:', err);
    })
    .then(() => {
      // Notify all active browser tabs/windows to update UI state immediately
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'STATUS_UPDATED',
            isOpen: isOpen
          });
        });
      });
    })
    .then(() => {
      // Show confirmation toast notification on device
      const confirmTitle = isOpen ? '🟢 Status: Actively Open to Work!' : '🔴 Status: Profile Paused';
      const confirmBody = isOpen
        ? 'Great! Your profile remains active and discoverable by hiring managers.'
        : 'Understood! Your profile is paused. You can re-activate anytime.';

      return self.registration.showNotification(confirmTitle, {
        body: confirmBody,
        icon: '/icons/icon-192x192.png',
        tag: 'hireai-status-confirmation'
      });
    });

    event.waitUntil(updatePromise);
  } else {
    // If user clicked the notification banner (not an action button), focus or open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/candidate') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(notifData.url || '/candidate/dashboard');
        }
      })
    );
  }
});