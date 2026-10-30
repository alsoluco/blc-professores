/* BLC · Professores: cache simples do "casco" do app. Os dados vêm sempre da rede. */
var V = 'blc-v25';
var CASCO = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CASCO); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (resp) {
    var cp = resp.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return resp;
  }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match('index.html'); }); }));
});

/* Avisos (push): mostra a notificacao e atualiza o numero no icone do app. */
self.addEventListener('push', function (e) {
  var d = {};
  try { var j = e.data ? e.data.json() : {}; d = j.data || j.notification || j || {}; } catch (x) {}
  var n = Number(d.badge);
  var tarefas = [self.registration.showNotification(d.title || 'BLC \u00b7 Professores', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || ('blc' + Date.now()), data: { url: './' }
  })];
  try {
    if (isFinite(n) && self.navigator) {
      if (n > 0 && self.navigator.setAppBadge) tarefas.push(self.navigator.setAppBadge(n));
      else if (n <= 0 && self.navigator.clearAppBadge) tarefas.push(self.navigator.clearAppBadge());
    }
  } catch (x) {}
  e.waitUntil(Promise.all(tarefas));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow('./');
  }));
});
