// キャッシュ名（バージョンを上げると全員に更新が届く）
const CACHE = 'genki-note-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

// インストール：アセットをキャッシュに保存
self.addEventListener('install', e => {
    self.skipWaiting(); // 即座に新バージョンを有効化
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS))
    );
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// フェッチ：HTMLはネットワーク優先（更新をすぐ反映）、他はキャッシュ優先
self.addEventListener('fetch', e => {
    if (e.request.mode === 'navigate') {
        // ページ本体：ネットから取得→失敗したらキャッシュ（オフライン対応）
        e.respondWith(
            fetch(e.request).catch(() => caches.match('./index.html'))
        );
        return;
    }
    // アイコン等：キャッシュ優先
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
