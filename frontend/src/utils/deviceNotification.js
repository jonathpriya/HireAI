// Device Push & System Notification Utility for HireAI
export const checkNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
};

export const triggerDeviceInactivityNotification = async ({
  candidateName = 'there',
  daysInactive = 7,
  token = null
} = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported on this browser/device.');
    return false;
  }

  // If permission is not granted yet, ask for it
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await requestNotificationPermission();
  }

  if (perm !== 'granted') {
    console.warn('Notification permission not granted:', perm);
    return false;
  }

  const title = 'HireAI • Career Status Check 🎯';
  const authToken = token || localStorage.getItem('token') || '';
  const options = {
    body: `Hi ${candidateName}, it's been ${daysInactive}+ days! Are you still actively searching for a job? Choose below to update your recruiter visibility:`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'hireai-inactivity-check',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/candidate/dashboard',
      token: authToken
    },
    actions: [
      { action: 'yes_active', title: '🟢 Yes, Still Searching' },
      { action: 'no_pause', title: '🔴 No, Placed / Pause' }
    ]
  };

  try {
    // Prefer showing via Service Worker registration so native actions work
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }
    // Fallback to Window Notification if SW not ready
    new Notification(title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag
    });
    return true;
  } catch (err) {
    console.error('Failed to dispatch device notification:', err);
    return false;
  }
};
