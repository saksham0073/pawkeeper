// ─────────────────────────────────────────────
//  PawKeeper Service Worker  v1
//  Handles: scheduled push notifications,
//           offline caching, PWA install
// ─────────────────────────────────────────────

const CACHE_NAME = "pawkeeper-v1";
const ASSETS = ["/", "/index.html"];

// ── Install: cache shell ──
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fallback to network ──
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── Push: show notification when push arrives ──
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  const { title = "PawKeeper 🐾", body = "", icon = "/icons/icon-192.png", tag = "pk" } = data;
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/icons/icon-192.png",
      tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: "/" },
    })
  );
});

// ── Notification click: focus or open app ──
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return clients.openWindow("/");
    })
  );
});

// ── Message: schedule a local notification via setTimeout ──
// Used for timed reminders without a backend push server.
// The SW keeps them alive even when the tab is closed.
const scheduled = new Map(); // tag → timeoutId

self.addEventListener("message", e => {
  const { type, notifications } = e.data || {};

  if (type === "SCHEDULE_NOTIFICATIONS") {
    // Cancel all previous timers
    scheduled.forEach(id => clearTimeout(id));
    scheduled.clear();

    const now = Date.now();
    (notifications || []).forEach(n => {
      const delay = n.fireAt - now;
      if (delay < 0) return; // already past

      const id = setTimeout(() => {
        self.registration.showNotification(n.title, {
          body:    n.body,
          icon:    "/icons/icon-192.png",
          badge:   "/icons/icon-192.png",
          tag:     n.tag,
          vibrate: [200, 100, 200],
          data:    { url: "/" },
        });
        scheduled.delete(n.tag);
      }, delay);

      scheduled.set(n.tag, id);
    });

    // Acknowledge
    e.source?.postMessage({ type: "SCHEDULED", count: (notifications||[]).length });
  }

  if (type === "CANCEL_NOTIFICATION") {
    const id = scheduled.get(e.data.tag);
    if (id) { clearTimeout(id); scheduled.delete(e.data.tag); }
  }
});
