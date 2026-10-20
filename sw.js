/* BLC · Professores: cache simples do "casco" do app. Os dados vêm sempre da rede. */
var V = 'blc-v1';
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
