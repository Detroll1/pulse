/* Pulse v3 — настоящий каталог: превью iTunes, обложки Apple Music, био Wikipedia.
 * Без зависимостей. Сгенерированные картинки — только для пользовательских
 * плейлистов/аватаров и как запасной вариант при недоступности обложки. */
(function () {
  "use strict";

  var DB = window.PULSE_DATA;
  var ARTISTS = DB.ARTISTS, ALBUMS = DB.ALBUMS, TRACKS = DB.TRACKS;
  var Art = window.PulseArt;

  /* ---------- utils ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function fmtFull(ms) { if (!ms) return "—"; return fmtTime(ms / 1000); }
  function fmtDur(sec) {
    sec = Math.floor(sec || 0);
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    if (h <= 0) return m + " мин";
    return h + " ч " + m + " мин";
  }
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return ""; }
  }
  function monthKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1);
  }
  function monthLabel(key) {
    try {
      var p = key.split("-");
      var s = new Date(+p[0], +p[1] - 1, 1).toLocaleString("ru-RU", { month: "long", year: "numeric" });
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch (e) { return key; }
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  var ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h4l10 12h4m0 0l-3-3m3 3l-3 3M3 18h4l2.5-3M13.5 9L17 6h4m0 0l-3-3m3 3l-3 3"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3"/></svg>',
    repeat1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3"/><text x="11" y="16" font-size="9" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20.5C7 16.5 3 13.2 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 3.9-4 7.2-9 11.2z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5C7 16.5 3 13.2 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 3.9-4 7.2-9 11.2z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6v6M20 4L10 14"/></svg>'
  };

  /* ---------- lookups ---------- */
  var localTracks = []; // полные треки пользователя (IndexedDB + object URL)
  function artistById(id) { return ARTISTS.find(function (a) { return a.id === id; }); }
  function albumById(id) { return ALBUMS.find(function (a) { return a.id === id; }); }
  function trackById(id) { return TRACKS.find(function (t) { return t.id === id; }) || localTracks.find(function (t) { return t.id === id; }); }
  function allTracks() { return TRACKS.concat(localTracks); }
  function tracksOfArtist(id) { return TRACKS.filter(function (t) { return t.artistId === id; }); }
  function albumsOfArtist(id) { return ALBUMS.filter(function (a) { return a.artistId === id; }); }
  // Проверенные официальные каналы. Нет канала — поиск по имени (честный фолбэк).
  var TUBE = {
    kishlak: "https://www.youtube.com/@kishlak1111",
    jahkhalib: "https://www.youtube.com/@JahKhalibOfficial",
    madk1d: "https://www.youtube.com/@madk1d_dynasty",
    basta: "https://www.youtube.com/@gaz_live",
    zivert: "https://www.youtube.com/@Zivert",
    jony: "https://www.youtube.com/@jony"
  };
  function artistTube(a) {
    if (!a) return null;
    if (TUBE[a.id]) return TUBE[a.id];
    return "https://www.youtube.com/results?search_query=" + encodeURIComponent(a.name);
  }

  /* Резолвер прямых ссылок: поиск → конкретное видео (кэш в localStorage).
   * Ссылки остаются обычными youtube.com/watch — никакого скачивания. */
  var YT_CACHE_KEY = "pulse.ytids";
  var ytCache = {};
  try { ytCache = JSON.parse(localStorage.getItem(YT_CACHE_KEY) || "{}") || {}; } catch (e) { ytCache = {}; }
  function ytCacheSave() { try { localStorage.setItem(YT_CACHE_KEY, JSON.stringify(ytCache)); } catch (e) {} }
  function normStr(s) {
    return String(s || "").toLowerCase().replace(/[^a-zа-яё0-9]+/gi, " ").replace(/\s+/g, " ").trim();
  }
  function ytResolve(t, cb) {
    if (!t || t.local) { cb(null); return; }
    if (ytCache[t.id]) { cb("https://www.youtube.com/watch?v=" + ytCache[t.id]); return; }
    var q = encodeURIComponent(t.credit + " " + t.title);
    fetch("https://pipedapi.kavin.rocks/search?q=" + q + "&filter=videos").then(function (r) {
      if (!r.ok) throw new Error("api");
      return r.json();
    }).then(function (j) {
      var items = (j && j.items) || [];
      var words = normStr(t.title).split(" ").filter(function (w) { return w.length > 2; });
      var an = "";
      try { an = normStr(artistById(t.artistId).name); } catch (e) {}
      var best = null, bestScore = -1;
      items.slice(0, 8).forEach(function (v) {
        if (!v || v.type === "stream" || !v.url) return;
        var m = String(v.url).match(/v=([\w-]{6,})/);
        if (!m) return;
        var title = normStr(v.title);
        var score = 0;
        words.forEach(function (w) { if (title.indexOf(w) !== -1) score += 2; });
        var up = normStr(v.uploaderName);
        if (up && an && (up.indexOf(an) !== -1 || an.indexOf(up) !== -1)) score += 5;
        if (/topic/i.test(v.uploaderName || "") || /official/i.test(v.uploaderName || "")) score += 3;
        if ((v.duration || 0) > 600) score -= 3;
        if (score > bestScore) { bestScore = score; best = m[1]; }
      });
      if (best && bestScore >= 2) {
        ytCache[t.id] = best;
        ytCacheSave();
        cb("https://www.youtube.com/watch?v=" + best);
      } else cb(null);
    }).catch(function () { cb(null); });
  }
  var ytChain = 0;
  function upgradeYTLinks(root) {
    if (!root || !root.querySelectorAll) return;
    var my = ++ytChain;
    var links = Array.prototype.slice.call(root.querySelectorAll("a[data-ytneed]")).slice(0, 14);
    var i = 0;
    var step = function () {
      if (my !== ytChain || i >= links.length) return;
      var a = links[i++];
      var t = trackById(a.getAttribute("data-ytneed"));
      if (!t || t.yt || t.local || a.getAttribute("data-ytdone")) { step(); return; }
      a.setAttribute("data-ytdone", "1");
      ytResolve(t, function (url) {
        if (url && document.body.contains(a)) {
          a.href = url;
          a.setAttribute("aria-label", "Смотреть оригинал на YouTube: " + t.title);
        }
        setTimeout(step, 350);
      });
    };
    step();
  }
  function artistAvatarTrack(id) { // оригинальная обложка для аватара: сначала альбомная, иначе первая
    var ts = tracksOfArtist(id), i;
    for (i = 0; i < ts.length; i++) if (ts[i].art && ts[i].albumId) return ts[i];
    for (i = 0; i < ts.length; i++) if (ts[i].art) return ts[i];
    return null;
  }
  function artistImg(a, size, cls) { // настоящее фото, иначе обложка, иначе генерация
    var s = size || 320, c = cls || "cover round";
    var fb = "";
    try { fb = Art.avatar(a.name, a.seed || 7, 2, 160); } catch (e) {}
    var url = (DB.PHOTOS || {})[a.id];
    if (url) return imgTag(url, c, s, fb);
    var t = artistAvatarTrack(a.id);
    return t ? imgTag(t.art, c, s, fallbackUrl(t)) : (fb ? imgTag(fb, c, s, "") : "");
  }
  function getLineup(t) {
    var custom = (DB.LINEUP || {})[t.id];
    if (custom) return custom;
    return [[t.credit, t.artistId]];
  }

  /* ---------- store ---------- */
  var LS_KEY = "pulse.v3";
  var store = { likes: [], likedAlbums: [], playlists: null, history: [], volume: 0.8, muted: false, shuffle: false, repeat: "off", profile: null, stats: {} };
  function loadStore() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && typeof p === "object") {
          ["likes", "likedAlbums", "playlists", "history"].forEach(function (k) { if (Array.isArray(p[k])) store[k] = p[k]; });
          if (typeof p.volume === "number") store.volume = p.volume;
          if (typeof p.muted === "boolean") store.muted = p.muted;
          if (typeof p.shuffle === "boolean") store.shuffle = p.shuffle;
          if (typeof p.repeat === "string") store.repeat = p.repeat;
          if (p.profile && typeof p.profile === "object") store.profile = p.profile;
          if (p.stats && typeof p.stats === "object") store.stats = p.stats;
        }
      }
    } catch (e) {}
    if (!store.playlists) {
      store.playlists = JSON.parse(JSON.stringify(DB.PLAYLISTS));
    } else {
      // чистка битых ссылок от старых схем
      store.playlists.forEach(function (pl) {
        pl.trackIds = (pl.trackIds || []).filter(function (id) { return !!trackById(id); });
      });
    }
    if (!store.profile) {
      try {
        var old = JSON.parse(localStorage.getItem("pulse.v2") || "null");
        if (old && old.profile && old.profile.name) store.profile = old.profile;
      } catch (e) {}
    }
    if (!store.profile) store.profile = { name: "", variant: 2, seed: 1000 + Math.floor(Math.random() * 9000), fresh: true };
    store.likes = store.likes.filter(function (id) { return !!trackById(id); });
    store.likedAlbums = store.likedAlbums.filter(function (id) { return !!albumById(id); });
    if (store.history.length > 1) { // схлопываем старые подряд-повторы
      var ded = [store.history[0]];
      for (var hi = 1; hi < store.history.length; hi++) {
        if (store.history[hi].trackId !== ded[ded.length - 1].trackId) ded.push(store.history[hi]);
      }
      store.history = ded;
    }
    ensureThisPlaylists();
  }
  function ensureThisPlaylists() {
    ARTISTS.forEach(function (a, i) {
      var id = DB.THIS_PREFIX + a.id;
      var ids = tracksOfArtist(a.id).map(function (t) { return t.id; });
      if (!ids.length) return;
      var ex = playlistById(id);
      if (ex) { ex.trackIds = ids; return; } // автоплейлист всегда отражает каталог
      var first = trackById(ids[0]);
      store.playlists.push({
        id: id, title: "Это: " + a.name,
        description: "Все треки " + a.name + " в Pulse.",
        seed: a.seed, pal: a.pal, coverArt: first ? first.art : null,
        editorial: true, auto: true, updated: "Автоплейлист",
        trackIds: ids
      });
    });
  }
  function saveStore() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        likes: store.likes, likedAlbums: store.likedAlbums, playlists: store.playlists,
        history: store.history.slice(0, 100), volume: store.volume, muted: store.muted,
        shuffle: store.shuffle, repeat: store.repeat, profile: store.profile, stats: store.stats
      }));
    } catch (e) {}
  }
  function playlistById(id) { return store.playlists.find(function (p) { return p.id === id; }); }
  function isLiked(id) { return store.likes.indexOf(id) !== -1; }
  function profileName() { return (store.profile && store.profile.name) || "Гость"; }
  function canEditPlaylist(p) { return p && !p.editorial; }

  /* ---------- статистика (честные секунды) ---------- */
  var statAcc = {};
  function flushStats() {
    var keys = Object.keys(statAcc);
    if (!keys.length) return;
    keys.forEach(function (mk) {
      if (!store.stats[mk]) store.stats[mk] = {};
      Object.keys(statAcc[mk]).forEach(function (aid) {
        store.stats[mk][aid] = Math.round(((store.stats[mk][aid] || 0) + statAcc[mk][aid]) * 10) / 10;
      });
    });
    statAcc = {};
    saveStore();
  }
  function monthStats(key) { return store.stats[key] || {}; }
  function monthTotal(key) {
    var s = monthStats(key), tot = 0;
    Object.keys(s).forEach(function (k) { tot += s[k]; });
    return tot;
  }
  function topArtists(key, n) {
    var s = monthStats(key);
    return Object.keys(s).map(function (aid) { return { artist: artistById(aid), sec: s[aid] }; })
      .filter(function (x) { return x.artist && x.sec > 0; })
      .sort(function (a, b) { return b.sec - a.sec; })
      .slice(0, n || 5);
  }
  function monthPlays(key) {
    return store.history.filter(function (h) { return monthKey(h.at) === key; }).length;
  }

  /* ---------- playback ---------- */
  var queue = [], queueIndex = -1, currentId = null;
  var searchFilter = "all", statsOffset = 0;
  var expandedLists = {}, routeToken = 0;

  var engine = window.PulseEngine.create({
    onTick: function (pos, dur) { paintProgress(pos, dur); },
    onMeta: function (dur) { paintProgress(engine.position(), dur); },
    onEnded: function () { flushStats(); nextTrack(true); },
    onPlay: function () { paintPlayState(); },
    onPause: function () { flushStats(); paintPlayState(); },
    onTrack: function () { paintPlayState(); },
    onError: function (t, streak) {
      if (streak >= 3) {
        engine.pause();
        toast("Нет связи с аудио-сервером. Проверьте интернет.");
      } else {
        toast("Не загрузилось — следующий трек");
        nextTrack(false);
      }
      paintPlayState();
    },
    onBlocked: function () { toast("Нажмите play — браузер ждёт вашего жеста"); }
  });

  var ytMode = false;
  var ytEng = window.PulseYT.create({
    onPlay: function () { paintPlayState(); },
    onPause: function () { paintPlayState(); },
    onEnded: function () { flushStats(); nextTrack(true); },
    onError: function () { ytFallback(); }
  });
  function AE() { return ytMode ? ytEng : engine; }
  function activeDur() { return ytMode ? (ytEng.duration() || 0) : previewLen(); }
  function ytFallback() {
    if (!ytMode) return;
    ytMode = false;
    try { ytEng.stop(); } catch (e) {}
    var t = currentTrack();
    toast("YouTube недоступен — включаю превью");
    if (t) engine.load(t, true);
    updatePlayerChrome();
  }

  function currentTrack() { return currentId ? trackById(currentId) : null; }
  function previewLen() { return engine.duration() || 30; }
  function pushHistory(id) {
    if (store.history.length && store.history[0].trackId === id) {
      store.history[0].at = Date.now(); // повтор без переключения — одна запись
      saveStore();
      return;
    }
    store.history.unshift({ trackId: id, at: Date.now() });
    store.history = store.history.slice(0, 100);
    saveStore();
  }

  function setQueueAndPlay(ids, startIdx) {
    queue = ids.filter(function (id) { return !!trackById(id); });
    queueIndex = Math.max(0, startIdx || 0);
    if (!queue.length) return;
    playAt(queueIndex);
  }
  function playTrack(id, contextIds) {
    var t = trackById(id);
    if (!t) return;
    engine.unlock();
    ytMode = false;
    try { ytEng.stop(); } catch (e) {}
    flushStats();
    if (contextIds && contextIds.length) {
      queue = contextIds.filter(function (x) { return !!trackById(x); });
      queueIndex = queue.indexOf(id);
      if (queueIndex === -1) { queue.unshift(id); queueIndex = 0; }
    } else if (queue.indexOf(id) === -1) {
      queue = [id].concat(queue).slice(0, 200);
      queueIndex = 0;
    } else {
      queueIndex = queue.indexOf(id);
    }
    currentId = id;
    engine.load(t, true);
    preloadNext();
    pushHistory(id);
    updatePlayerChrome();
    renderQueue();
  }
  var preloader = null;
  function preloadNext() {
    if (ytMode) return;
    try {
      var t = trackById(queue[queueIndex + 1]);
      if (!t) return;
      preloader = new Audio();
      preloader.preload = "auto";
      preloader.src = t.preview;
      try { preloader.load(); } catch (e) {}
    } catch (e) {}
  }
  function playAt(i) {
    if (i < 0 || i >= queue.length) return;
    queueIndex = i;
    if (ytMode) playFullAt(i);
    else {
      playTrack(queue[i]);
      queueIndex = queue.indexOf(currentId);
      renderQueue();
    }
  }
  function playFullAt(i) {
    if (i < 0 || i >= queue.length) return;
    queueIndex = i;
    var t = trackById(queue[i]);
    if (!t) return;
    if (!t.yt) {
      ytMode = false;
      try { ytEng.stop(); } catch (e) {}
      playTrack(t.id);
      return;
    }
    currentId = t.id;
    try { engine.pause(); } catch (e) {}
    ytEng.load(t.yt, true);
    pushHistory(t.id);
    updatePlayerChrome();
    renderQueue();
  }
  function playFull(id, contextIds) {
    var t = trackById(id);
    if (!t || !t.yt) { toast("Для этого трека полной версии пока нет"); return; }
    engine.unlock();
    flushStats();
    var src = contextIds && contextIds.length ? contextIds : [id];
    var ids = src.filter(function (x) { var tt = trackById(x); return tt && tt.yt; });
    if (!ids.length) { toast("Для этого трека полной версии пока нет"); return; }
    var skipped = src.length - ids.length;
    queue = ids;
    queueIndex = Math.max(0, ids.indexOf(id));
    ytMode = true;
    try { engine.pause(); } catch (e) {}
    playFullAt(queueIndex);
    if (skipped > 0) toast("Без полной версии пропущено: " + skipped);
  }
  function nextTrack(auto) {
    if (!queue.length && currentId) {
      if (store.repeat === "one") { AE().seek(0); AE().play(); return; }
      return;
    }
    if (store.repeat === "one" && auto) { AE().seek(0); AE().play(); return; }
    if (store.shuffle && queue.length > 1) {
      var n;
      do { n = Math.floor(Math.random() * queue.length); } while (n === queueIndex);
      playAt(n); return;
    }
    var nx = queueIndex + 1;
    if (nx >= queue.length) {
      if (store.repeat === "all") playAt(0);
      else { engine.pause(); paintPlayState(); }
      return;
    }
    playAt(nx);
  }
  function prevTrack() {
    if (AE().position() > 3) { AE().seek(0); return; }
    if (store.shuffle && queue.length > 1) { playAt(Math.floor(Math.random() * queue.length)); return; }
    if (queueIndex > 0) playAt(queueIndex - 1);
    else AE().seek(0);
  }

  /* ---------- картинки ---------- */
  function fallbackUrl(t) {
    try { return Art.cover({ pal: t.pal || 0, seed: t.seed || 7, title: t.title || "Pulse" }, 320); }
    catch (e) { return ""; }
  }
  function imgTag(url, cls, size, fb) {
    if (!url) return '<span class="' + cls + ' img-empty" aria-hidden="true"></span>';
    var onerr = fb ? " onerror=\"this.onerror=null;this.src='" + fb + "'\"" : " onerror=\"this.style.visibility='hidden'\"";
    return '<img class="' + cls + '" src="' + url + '" alt="" loading="lazy" decoding="async"' + onerr + " />";
  }
  function trackImg(t, size) { return imgTag(t.art, "track-cover", size || 112, fallbackUrl(t)); }
  function plCover(p) {
    if (p.coverArt) return p.coverArt;
    try { return Art.cover({ pal: p.pal || 0, seed: p.seed || 7, title: p.title }, 320); }
    catch (e) { return ""; }
  }
  function plImages(p, n) { // обложки первых треков для мозаики
    var out = [];
    (p.trackIds || []).forEach(function (id) {
      if (out.length >= (n || 4)) return;
      var t = trackById(id);
      if (t && t.art && out.indexOf(t.art) === -1) out.push(t.art);
    });
    return out;
  }
  function plMosaic(p, cls) { // мозаика 2x2 из настоящих обложек, иначе одиночка
    var imgs = plImages(p, 4);
    if (imgs.length < 4) return imgTag(plCover(p), cls, 320, "");
    return '<span class="cover-mosaic ' + cls + '" aria-hidden="true">' + imgs.map(function (u) {
      return '<img src="' + u + '" alt="" loading="lazy" decoding="async" onerror="this.style.visibility=\'hidden\'" />';
    }).join("") + "</span>";
  }

  /* ---------- player chrome ---------- */
  function updatePlayerChrome() {
    var t = currentTrack();
    var cover = $("#pCover"), title = $("#pTitle"), artist = $("#pArtist"), badge = $("#pBadge");
    if (!t) {
      title.textContent = "Ничего не играет";
      artist.textContent = "Выберите трек из подборки";
      cover.removeAttribute("src");
      badge.textContent = "превью";
      $("#tDur").textContent = "0:30";
      $("#btnPlay").innerHTML = ICONS.play;
      return;
    }
    cover.onerror = function () { this.onerror = null; this.src = fallbackUrl(t); };
    cover.src = t.art;
    cover.setAttribute("aria-label", "Обложка: " + t.title);
    title.textContent = t.title;
    artist.textContent = t.credit;
    badge.textContent = t.local ? "ваш файл · полная версия" : ytMode ? "YouTube · полная " + fmtFull(t.fullMs) : "превью · полная " + fmtFull(t.fullMs);
    badge.title = t.local
      ? "Полный трек с вашего устройства"
      : ytMode
        ? "Полная версия с официального YouTube-канала"
        : "Играет 30-секундное превью iTunes. Полная версия — " + fmtFull(t.fullMs) + " (ссылки — в меню исполнителей)";
    $("#tDur").textContent = ytMode ? fmtFull(t.fullMs) : fmtTime(previewLen());
    updatePlayerLike();
    paintPlayState();
  }
  function updatePlayerLike() {
    var b = $("#pLike");
    if (!currentId) { b.setAttribute("aria-pressed", "false"); b.innerHTML = ICONS.heart; return; }
    var liked = isLiked(currentId);
    b.setAttribute("aria-pressed", liked ? "true" : "false");
    b.setAttribute("aria-label", liked ? "Убрать из «Мне нравится»" : "Добавить в «Мне нравится»");
    b.innerHTML = liked ? ICONS.heartFill : ICONS.heart;
  }
  function paintPlayState() {
    var playing = AE().isPlaying();
    var btn = $("#btnPlay");
    btn.innerHTML = playing ? ICONS.pause : ICONS.play;
    btn.setAttribute("aria-label", playing ? "Пауза" : "Слушать");
    $all(".track-row").forEach(function (row) {
      var id = row.getAttribute("data-track");
      var isCur = id === currentId;
      row.classList.toggle("active", isCur);
      row.classList.toggle("playing", isCur && playing);
    });
    $all(".chart-row").forEach(function (row) {
      row.classList.toggle("playing", row.getAttribute("data-track") === currentId && playing);
    });
    var sh = $("#btnShuffle"), rp = $("#btnRepeat");
    sh.setAttribute("aria-pressed", store.shuffle ? "true" : "false");
    rp.setAttribute("aria-pressed", store.repeat !== "off" ? "true" : "false");
    rp.innerHTML = store.repeat === "one" ? ICONS.repeat1 : ICONS.repeat;
    rp.setAttribute("aria-label", store.repeat === "off" ? "Повтор выключен" : store.repeat === "all" ? "Повтор очереди включён" : "Повтор трека включён");
    var mu = $("#btnMute");
    mu.innerHTML = (store.muted || store.volume === 0) ? ICONS.mute : ICONS.vol;
    mu.setAttribute("aria-label", store.muted ? "Включить звук" : "Выключить звук");
    $("#queueCount").textContent = queue.length ? String(queue.length) : "";
  }

  var seeking = false;
  function paintProgress(pos, dur) {
    if (seeking) return;
    var d = dur || previewLen() || 30;
    var p = pos == null ? engine.position() : pos;
    $("#tCur").textContent = fmtTime(p);
    $("#tDur").textContent = fmtTime(d);
    var r = $("#seek");
    r.value = d ? String(Math.round((p / d) * 1000)) : "0";
    r.setAttribute("aria-valuetext", fmtTime(p) + " из " + fmtTime(d) + ", превью");
  }

  /* ---------- toast / modal ---------- */
  function toast(msg) {
    var box = $("#toasts");
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }
  var lastFocus = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    $("#modalRoot").innerHTML = '<div class="scrim show" data-action="close-modal"></div><div class="modal-card" role="dialog" aria-modal="true">' + html + "</div>";
    var first = $("#modalRoot").querySelector("input, select, button");
    if (first) first.focus();
    upgradeYTLinks($("#modalRoot"));
  }
  function closeModal() {
    $("#modalRoot").innerHTML = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function modalCreatePlaylist() {
    openModal(
      '<h2>Новый плейлист</h2><p>Название — сейчас, треки — кнопкой «+» из любого списка.</p>' +
      '<div class="field"><label for="plName">Название</label><input class="text-input" id="plName" maxlength="60" placeholder="Например: Утро в городе" /></div>' +
      '<div class="field"><label for="plDesc">Описание (необязательно)</label><input class="text-input" id="plDesc" maxlength="120" placeholder="Настроение, занятие, жанр" /></div>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Отмена</button>' +
      '<button class="btn btn-primary" data-action="do-create-pl">Создать</button></div>'
    );
  }
  function modalRenamePlaylist(id) {
    var p = playlistById(id);
    if (!p || !canEditPlaylist(p)) return;
    openModal(
      '<h2>Переименовать</h2><p>' + esc(p.title) + "</p>" +
      '<div class="field"><label for="plName">Название</label><input class="text-input" id="plName" maxlength="60" value="' + esc(p.title) + '" /></div>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Отмена</button>' +
      '<button class="btn btn-primary" data-action="do-rename-pl" data-id="' + esc(id) + '">Сохранить</button></div>'
    );
  }
  function modalDeletePlaylist(id) {
    var p = playlistById(id);
    if (!p || !canEditPlaylist(p)) return;
    openModal(
      '<h2>Удалить плейлист?</h2><p>«' + esc(p.title) + "» исчезнет из библиотеки. Треки и лайки останутся.</p>" +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Отмена</button>' +
      '<button class="btn btn-danger" data-action="do-delete-pl" data-id="' + esc(id) + '">Удалить</button></div>'
    );
  }
  function modalAddToPlaylist(trackId) {
    var t = trackById(trackId);
    if (!t) return;
    var items = store.playlists.map(function (p) {
      var has = p.trackIds.indexOf(trackId) !== -1;
      return '<button class="add-item" data-action="do-add-to-pl" data-pl="' + esc(p.id) + '" data-track="' + esc(trackId) + '"' + (has ? " disabled" : "") + ">" +
        imgTag(plCover(p), "mini-cover", 96, "") +
        "<span><b>" + esc(p.title) + "</b><br><span class='kv'>" + p.trackIds.length + " " + plural(p.trackIds.length, "трек", "трека", "треков") + (has ? " · уже добавлен" : "") + "</span></span></button>";
    }).join("");
    openModal(
      '<h2>Добавить в плейлист</h2><p>' + esc(t.title) + " — " + esc(t.credit) + "</p>" +
      '<div class="add-list">' + items + "</div>" +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Готово</button></div>'
    );
  }

  /* ---------- components ---------- */
  function likeBtn(id) {
    var t = trackById(id);
    var liked = isLiked(id);
    return '<button class="icon-btn" data-action="toggle-like" data-id="' + esc(id) + '" data-like="' + esc(id) + '" aria-pressed="' + (liked ? "true" : "false") + '" aria-label="' + (liked ? "Убрать из «Мне нравится»: " : "Нравится: ") + esc(t ? t.title : "") + '">' + (liked ? ICONS.heartFill : ICONS.heart) + "</button>";
  }
  function syncLikeButtons(id) {
    var t = trackById(id);
    $all('[data-like="' + id + '"]').forEach(function (b) {
      var liked = isLiked(id);
      b.setAttribute("aria-pressed", liked ? "true" : "false");
      b.setAttribute("aria-label", (liked ? "Убрать из «Мне нравится»: " : "Нравится: ") + (t ? t.title : ""));
      b.innerHTML = liked ? ICONS.heartFill : ICONS.heart;
    });
  }

  function subLine(t) {
    var a = artistById(t.artistId);
    if (t.local) return esc(t.credit) + " · Мой файл";
    var multi = getLineup(t).length > 1;
    var left = multi
      ? '<button class="artist-btn" data-action="artists-menu" data-id="' + esc(t.id) + '" aria-label="Исполнители трека ' + esc(t.title) + ": " + esc(t.credit) + '" title="Выбрать исполнителя">' + esc(t.credit) + ' <span aria-hidden="true">›</span></button>'
      : '<a href="#/artist/' + esc(t.artistId) + '" data-link>' + esc(a ? a.name : t.credit) + "</a>";
    var right = t.albumId && albumById(t.albumId)
      ? '<a href="#/album/' + esc(t.albumId) + '" data-link>' + esc(albumById(t.albumId).title) + "</a>"
      : esc(t.rel || "");
    return left + " · " + right;
  }

  function modalArtistsMenu(trackId) {
    var t = trackById(trackId);
    if (!t) return;
    var rows = getLineup(t).map(function (e) {
      var name = e[0], aid = e[1];
      var a = aid ? artistById(aid) : null;
      var av;
      if (a) {
        av = artistImg(a, 96, "mini-cover");
        return '<button class="add-item" data-action="go-artist" data-id="' + esc(aid) + '">' + av +
          "<span><b>" + esc(name) + "</b><br><span class='kv'>" + esc(a.genre) + " · открыть профиль</span></span></button>";
      }
      av = imgTag(Art.avatar(name, name.length * 977 + 13, 2, 96), "mini-cover", 96, "");
      return '<span class="add-item" aria-disabled="true">' + av +
        "<span><b>" + esc(name) + "</b><br><span class='kv'>Нет в Pulse — только фит</span></span></span>";
    }).join("");
    var q = encodeURIComponent(t.credit + " " + t.title);
    var watch = t.yt ? "https://www.youtube.com/watch?v=" + t.yt : "https://www.youtube.com/results?search_query=" + q;
    openModal('<h2>' + esc(t.title) + '</h2><p>Кто исполняет этот трек</p><div class="add-list">' + rows + "</div>" +
      '<div class="modal-actions">' + (t.yt ? '<button class="btn btn-primary" data-action="play-full" data-id="' + esc(t.id) + '">Слушать полностью</button>' : "") + '<a class="btn btn-ghost" data-ytneed="' + esc(t.id) + '" href="' + watch + '" target="_blank" rel="noopener" aria-label="Слушать бесплатно на YouTube">Бесплатно: YouTube ' + ICONS.ext + "</a>" +
      '<button class="btn btn-primary" data-action="close-modal">Закрыть</button></div>');
  }

  function trackRow(t, i, contextIds, charted) {
    var ctx = (contextIds || []).join(",");
    var num = charted
      ? '<span class="track-num chart-num">' + (i + 1 < 10 ? "0" : "") + (i + 1) + '</span><span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>'
      : '<span class="track-num">' + (i + 1) + '</span><span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>';
    return '<div class="track-row' + (charted ? " chart-row" : "") + '" data-track="' + esc(t.id) + '">' +
      num + '<span class="track-cover-wrap">' + trackImg(t, 112) + '<button class="track-play" data-action="play-track" data-id="' + esc(t.id) + '" data-context="' + esc(ctx) + '" aria-label="Слушать: ' + esc(t.title) + '">' + ICONS.play + "</button></span>" +
      '<div class="track-main">' +
      '<button class="track-title-btn" data-action="play-track" data-id="' + esc(t.id) + '" data-context="' + esc(ctx) + '" aria-label="Слушать превью: ' + esc(t.title) + ", " + esc(t.credit) + '" title="' + esc(t.credit) + " · полная версия " + fmtFull(t.fullMs) + '">' +
      esc(t.title) + "</button>" +
      '<span class="track-artist">' + subLine(t) + "</span>" +
      "</div>" +
      '<span class="track-side">' + likeBtn(t.id) +
      '<button class="icon-btn" data-action="add-to-pl" data-id="' + esc(t.id) + '" aria-label="В плейлист: ' + esc(t.title) + '">' + ICONS.plus + "</button>" +
      (t.yt ? '<button class="full-btn" data-action="play-full" data-id="' + esc(t.id) + '" data-context="' + esc(ctx) + '" aria-label="Слушать полную версию: ' + esc(t.title) + '">FULL</button>' : '<a class="full-btn" data-ytneed="' + esc(t.id) + '" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(t.credit + " " + t.title) + '" target="_blank" rel="noopener" aria-label="Бесплатно на YouTube: ' + esc(t.title) + '">YT</a>') +
      '<span title="Полная версия">' + fmtFull(t.fullMs) + "</span></span></div>";
  }

  function emptyBox(title, text, cta) {
    return '<div class="empty">' + imgTag(Art.cover({ pal: 4, seed: 42, title: title }, 240), "empty-art", 240, "") +
      "<h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" + (cta || "") + "</div>";
  }

  function trackListHtml(tracks, key, contextIds, charted) {
    if (!tracks.length) {
      return emptyBox("Здесь пока пусто", "Треки появятся, как только вы добавите их в этот раздел.", '<a class="btn" href="#/home">Перейти на главную</a>');
    }
    var limit = expandedLists[key] ? tracks.length : 12;
    var ctx = contextIds || tracks.map(function (t) { return t.id; });
    var rows = tracks.slice(0, limit).map(function (t, i) { return trackRow(t, i, ctx, charted); }).join("");
    var more = tracks.length > limit
      ? '<button class="btn btn-ghost btn-block" data-action="expand" data-key="' + esc(key) + '">Показать ещё (' + (tracks.length - limit) + ")</button>"
      : "";
    return '<div class="track-list" role="list">' + rows + "</div>" + (more ? '<div style="margin-top:10px">' + more + "</div>" : "");
  }

  function playlistCard(p) {
    return '<a class="card lazy" href="#/playlist/' + esc(p.id) + '" aria-label="Плейлист: ' + esc(p.title) + '">' +
      '<span class="cover-wrap">' + plMosaic(p, "cover") +
      '<button class="play-fab" data-action="play-pl" data-id="' + esc(p.id) + '" aria-label="Слушать плейлист ' + esc(p.title) + '">' + ICONS.play + "</button></span>" +
      '<span class="card-title">' + esc(p.title) + '</span><span class="card-sub">' + esc(p.description || "") + "</span>" +
      '<span class="card-meta">' + p.trackIds.length + " " + plural(p.trackIds.length, "трек", "трека", "треков") + "</span></a>";
  }
  function albumCard(al) {
    var a = artistById(al.artistId);
    var first = al.trackIds.map(trackById).filter(Boolean)[0];
    var art = first ? first.art : "";
    return '<a class="card lazy" href="#/album/' + esc(al.id) + '" aria-label="Альбом: ' + esc(al.title) + '">' +
      '<span class="cover-wrap">' + imgTag(art, "cover", 320, first ? fallbackUrl(first) : "") +
      '<button class="play-fab" data-action="play-album" data-id="' + esc(al.id) + '" aria-label="Слушать альбом ' + esc(al.title) + '">' + ICONS.play + "</button></span>" +
      '<span class="card-title">' + esc(al.title) + '</span><span class="card-sub">' + esc(a ? a.name : "") + " · " + al.year + "</span></a>";
  }
  function artistCard(a) {
    return '<a class="card lazy" href="#/artist/' + esc(a.id) + '" aria-label="Исполнитель: ' + esc(a.name) + '">' +
      '<span class="cover-wrap">' + artistImg(a, 320) + "</span>" +
      '<span class="card-title">' + esc(a.name) + "</span>" +
      '<span class="card-sub">' + esc(a.genre) + "</span>" +
      '<span class="card-meta">' + tracksOfArtist(a.id).length + " " + plural(tracksOfArtist(a.id).length, "трек", "трека", "треков") + " в Pulse</span></a>";
  }

  function skeletonCards(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += '<div class="card"><div class="cover skeleton"></div><div class="skeleton" style="height:14px"></div><div class="skeleton" style="height:12px;width:70%"></div></div>';
    return '<div class="grid cards" aria-hidden="true">' + s + "</div>";
  }
  function skeletonRows(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += '<div class="skeleton" style="height:64px"></div>';
    return '<div class="track-list" aria-hidden="true">' + s + "</div>";
  }
  function errorBox(msg) {
    return '<div class="error-box" role="alert"><h3>Что-то пошло не так</h3><p>' + esc(msg || "Не удалось загрузить раздел.") + '</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/home">На главную</a><button class="btn" data-action="retry">Попробовать снова</button></div></div>';
  }

  /* ---------- views ---------- */
  function chartTracks() { return DB.CHART.map(trackById).filter(Boolean); }
  function newReleases() { return ALBUMS.slice().sort(function (a, b) { return b.year - a.year; }); }
  function editorialPlaylists() { return store.playlists.filter(function (p) { return p.editorial && p.id.indexOf(DB.THIS_PREFIX) !== 0; }); }

  function viewHome() {
    var chart = chartTracks().slice(0, 8);
    var fresh = newReleases().slice(0, 6);
    var mk = monthKey(Date.now());
    return '<div class="hero"><p class="hero-tag">ГЛАВНАЯ · ' + TRACKS.length + " " + plural(TRACKS.length, "ЗАПИСЬ", "ЗАПИСИ", "ЗАПИСЕЙ") + " · " + ARTISTS.length + " " + plural(ARTISTS.length, "ИСПОЛНИТЕЛЬ", "ИСПОЛНИТЕЛЯ", "ИСПОЛНИТЕЛЕЙ") + " · НАСТОЯЩИЕ ТРЕКИ</p>" +
      "<h1>Чарт СНГ: слушайте оригинал</h1>" +
      "<p>Кишлак, Big Baby Tape, Баста, Zivert и другие — настоящие записи и обложки. В Pulse играют 30-секундные превью, а полные версии — через YouTube прямо в плеере.</p>" +
      '<div class="hero-actions"><button class="btn btn-primary" data-action="play-pop">' + ICONS.play + ' Слушать чарт</button>' +
      '<button class="btn" data-action="shuffle-all">' + ICONS.shuffle + ' Мне повезёт</button>' +
      '<button class="btn btn-ghost" data-action="stop-all" aria-label="Остановить воспроизведение">Стоп</button>' +
      '<a class="btn btn-ghost" href="#/stats">Моя статистика</a></div>' +
      '<div class="hero-stats"><div><b>' + TRACKS.length + '</b><span>' + plural(TRACKS.length, "трек", "трека", "треков") + '</span></div><div><b>' + ARTISTS.length + '</b><span>' + plural(ARTISTS.length, "исполнитель", "исполнителя", "исполнителей") + '</span></div><div><b>' + ALBUMS.length + '</b><span>' + plural(ALBUMS.length, "альбом", "альбома", "альбомов") + '</span></div><div><b>' + fmtDur(monthTotal(mk)) + '</b><span>вы слушали в этом месяце</span></div></div></div>' +
      '<section class="section" aria-labelledby="h-picks"><div class="section-head"><h2 id="h-picks">Подборки</h2><p>редакция Pulse</p></div>' +
      '<div class="grid cards">' + editorialPlaylists().slice(0, 4).map(playlistCard).join("") + "</div></section>" +
      '<section class="section" aria-labelledby="h-new"><div class="section-head"><h2 id="h-new">Альбомы</h2><p>от нового к старому</p></div>' +
      '<div class="grid cards">' + fresh.map(albumCard).join("") + "</div></section>" +
      '<section class="section" aria-labelledby="h-pop"><div class="section-head"><h2 id="h-pop">Чарт: топ-8</h2><p>выбор редакции</p><span class="spacer"></span><button class="btn btn-sm" data-action="play-pop">Слушать все</button> <button class="btn btn-sm btn-ghost" data-action="stop-all" aria-label="Остановить воспроизведение">Стоп</button></div>' +
      trackListHtml(chart, "home-pop", null, true) + "</section>" +
      '<section class="section" aria-labelledby="h-art"><div class="section-head"><h2 id="h-art">Исполнители</h2><p>' + ARTISTS.length + "</p></div>" +
      '<div class="grid artists">' + ARTISTS.map(artistCard).join("") + "</div></section>";
  }

  function viewSearch(q) {
    q = (q || "").trim();
    var chips = [["all", "Всё"], ["tracks", "Треки"], ["artists", "Исполнители"], ["albums", "Альбомы"], ["playlists", "Плейлисты"]]
      .map(function (c) { return '<button class="chip" data-action="search-filter" data-f="' + c[0] + '" aria-pressed="' + (searchFilter === c[0] ? "true" : "false") + '">' + c[1] + "</button>"; }).join("");
    if (!q) {
      return '<h1 tabindex="-1">Поиск</h1><p class="kv">По каталогу Pulse: треки, исполнители, альбомы и плейлисты.</p>' +
        '<div class="chips" role="group" aria-label="Фильтр поиска">' + chips + "</div>" +
        emptyBox("Пустой запрос", "Попробуйте «Вьюга», «Сансара», «Zivert» или «дорога».", "");
    }
    var nq = q.toLowerCase();
    var ft = allTracks().filter(function (t) {
      var a = artistById(t.artistId);
      return t.title.toLowerCase().indexOf(nq) !== -1 || (t.credit || "").toLowerCase().indexOf(nq) !== -1 ||
        (a && a.name.toLowerCase().indexOf(nq) !== -1) || (t.genre || "").toLowerCase().indexOf(nq) !== -1 ||
        (t.rel || "").toLowerCase().indexOf(nq) !== -1;
    });
    var fa = ARTISTS.filter(function (a) { return a.name.toLowerCase().indexOf(nq) !== -1 || (a.genre || "").toLowerCase().indexOf(nq) !== -1; });
    var fal = ALBUMS.filter(function (al) { return al.title.toLowerCase().indexOf(nq) !== -1 || (artistById(al.artistId) || {}).name && artistById(al.artistId).name.toLowerCase().indexOf(nq) !== -1; });
    var fp = store.playlists.filter(function (p) { return p.title.toLowerCase().indexOf(nq) !== -1 || (p.description || "").toLowerCase().indexOf(nq) !== -1; });
    var total = ft.length + fa.length + fal.length + fp.length;
    var out = '<h1 tabindex="-1">Поиск</h1><p class="kv">По запросу «' + esc(q) + "» найдено: " + total + "</p>" +
      '<div class="chips" role="group" aria-label="Фильтр поиска">' + chips + "</div>";
    if (!total) {
      return out + emptyBox("Ничего не нашлось", "В каталоге " + TRACKS.length + " " + plural(TRACKS.length, "трек", "трека", "треков") + ". Попробуйте «Miyagi», «Баста», «поп».", '<button class="btn" data-action="clear-search">Очистить поиск</button>');
    }
    if (searchFilter === "all" || searchFilter === "tracks") out += '<section class="section"><div class="section-head"><h2>Треки</h2><p>' + ft.length + "</p></div>" + trackListHtml(ft.slice(0, 20), "search-tracks", ft.map(function (t) { return t.id; })) + "</section>";
    if ((searchFilter === "all" || searchFilter === "artists") && fa.length) out += '<section class="section"><div class="section-head"><h2>Исполнители</h2><p>' + fa.length + "</p></div>" + '<div class="grid artists">' + fa.map(artistCard).join("") + "</div></section>";
    if ((searchFilter === "all" || searchFilter === "albums") && fal.length) out += '<section class="section"><div class="section-head"><h2>Альбомы</h2><p>' + fal.length + "</p></div>" + '<div class="grid cards">' + fal.map(albumCard).join("") + "</div></section>";
    if ((searchFilter === "all" || searchFilter === "playlists") && fp.length) out += '<section class="section"><div class="section-head"><h2>Плейлисты</h2><p>' + fp.length + "</p></div>" + '<div class="grid cards">' + fp.map(playlistCard).join("") + "</div></section>";
    return out;
  }

  function viewLibrary() {
    var mine = store.playlists.filter(function (p) { return canEditPlaylist(p); });
    var autos = store.playlists.filter(function (p) { return p.auto; });
    var liked = store.likes.map(trackById).filter(Boolean);
    var als = ALBUMS.filter(function (a) { return store.likedAlbums.indexOf(a.id) !== -1; });
    var hist = store.history.slice(0, 5).map(function (h) { return trackById(h.trackId); }).filter(Boolean);
    return '<h1 tabindex="-1">Библиотека</h1><p class="kv">Ваше избранное: плейлисты, лайки и альбомы. Всё хранится в этом браузере.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0"><button class="btn btn-primary btn-sm" data-action="create-pl">' + ICONS.plus + ' Новый плейлист</button>' +
      '<a class="btn btn-sm" href="#/files">Мои файлы (' + localTracks.length + ")</a>" +
      '<a class="btn btn-sm" href="#/history">' + ICONS.clock + ' История (' + store.history.length + ')</a>' +
      '<a class="btn btn-sm btn-ghost" href="#/stats">Статистика месяца</a></div>' +
      '<section class="section"><div class="section-head"><h2>Мои плейлисты</h2><p>' + mine.length + '</p><span class="spacer"></span><button class="btn btn-sm" data-action="create-pl">+ Новый</button></div>' +
      (mine.length ? '<div class="grid cards">' + mine.map(playlistCard).join("") + "</div>" : '<p class="kv">Пока пусто — соберите первый плейлист под своё настроение.</p>') + "</section>" +
      '<section class="section"><div class="section-head"><h2>Подборки исполнителей</h2><p>' + autos.length + "</p></div>" +
      '<div class="grid cards">' + autos.map(playlistCard).join("") + "</div></section>" +
      '<section class="section"><div class="section-head"><h2>Мне нравится</h2><p>' + liked.length + '</p><span class="spacer"></span><a class="link-more" href="#/liked">Все треки</a></div>' +
      (liked.length ? trackListHtml(liked.slice(0, 5), "lib-liked", liked.map(function (t) { return t.id; })) : '<p class="kv">Жмите на сердечко у трека — любимое соберётся здесь.</p>') + "</section>" +
      '<section class="section"><div class="section-head"><h2>Сохранённые альбомы</h2><p>' + als.length + "</p></div>" +
      (als.length ? '<div class="grid cards">' + als.map(albumCard).join("") + "</div>" : '<p class="kv">Откройте альбом и нажмите «Сохранить».</p>') + "</section>" +
      (hist.length ? '<section class="section"><div class="section-head"><h2>Недавно слушали</h2><span class="spacer"></span><a class="link-more" href="#/history">Вся история</a></div>' + trackListHtml(hist, "lib-hist", hist.map(function (t) { return t.id; })) + "</section>" : "");
  }

  function viewLiked() {
    var liked = store.likes.map(trackById).filter(Boolean);
    return '<h1 tabindex="-1">Мне нравится</h1><p class="kv">' + liked.length + " " + plural(liked.length, "трек", "трека", "треков") + " · только ваше</p>" +
      (liked.length ? '<div class="entity-actions"><button class="btn btn-primary" data-action="play-ids" data-ids="' + esc(liked.map(function (t) { return t.id; }).join(",")) + '">' + ICONS.play + ' Слушать</button></div><div class="divider"></div>' + trackListHtml(liked, "liked", liked.map(function (t) { return t.id; }))
        : emptyBox("Пока без лайков", "Нажимайте на сердечко у трека — всё любимое соберётся здесь.", '<a class="btn btn-primary" href="#/home">Найти любимое</a>'));
  }

  function viewHistory() {
    var items = store.history.map(function (h) { return { t: trackById(h.trackId), at: h.at }; }).filter(function (x) { return x.t; });
    if (!items.length) return '<h1 tabindex="-1">История</h1>' + emptyBox("Вы ещё ничего не слушали", "Включите любой трек — он появится здесь с точным временем.", '<a class="btn btn-primary" href="#/home">К музыке</a>');
    var rows = items.slice(0, 40).map(function (x, i) {
      return trackRow(x.t, i, items.map(function (y) { return y.t.id; }), false).replace("<span>" + fmtFull(x.t.fullMs) + "</span>", "<span>" + fmtFull(x.t.fullMs) + "<br>" + fmtDate(x.at) + "</span>");
    }).join("");
    return '<h1 tabindex="-1">История</h1><p class="kv">' + items.length + " " + plural(items.length, "запись", "записи", "записей") + " · последние 100 хранятся локально</p>" +
      '<div class="entity-actions"><button class="btn btn-sm btn-danger" data-action="clear-history">Очистить историю</button></div><div class="divider"></div>' +
      '<div class="track-list">' + rows + "</div>";
  }

  function viewArtist(id) {
    var a = artistById(id);
    if (!a) return errorBox("Исполнитель не найден. Возможно, ссылка устарела.");
    var tracks = tracksOfArtist(id);
    var albums = albumsOfArtist(id);
    var ids = tracks.map(function (t) { return t.id; });
    var thisPl = playlistById(DB.THIS_PREFIX + id);
    return '<div class="entity-head">' + artistImg(a, 480, "entity-cover round") +
      '<div><p class="entity-kicker">ИСПОЛНИТЕЛЬ' + (a.verified ? " · ПРОВЕРЕН" : "") + '</p><h1 class="entity-title" tabindex="-1">' + esc(a.name) + "</h1>" +
      '<p class="entity-sub">' + esc(a.genre) + " · " + tracks.length + " " + plural(tracks.length, "трек", "трека", "треков") + " · " + albums.length + " " + plural(albums.length, "альбом", "альбома", "альбомов") + " в Pulse</p><p class='kv'>" + esc(a.bio) + "</p>" +
      '<div class="entity-actions"><button class="btn btn-primary" data-action="play-ids" data-ids="' + esc(ids.join(",")) + '">' + ICONS.play + ' Слушать</button>' +
      '<button class="btn" data-action="shuffle-ids" data-ids="' + esc(ids.join(",")) + '">' + ICONS.shuffle + ' Перемешать</button>' +
      '<a class="btn btn-sm" href="' + artistTube(a) + '" target="_blank" rel="noopener" aria-label="Профиль ' + esc(a.name) + ' на YouTube">Профиль на YouTube ' + ICONS.ext + "</a></div></div></div>" +
      (thisPl ? '<section class="section"><div class="section-head"><h2>Плейлист исполнителя</h2></div><div class="grid cards">' + playlistCard(thisPl) + "</div></section>" : "") +
      (albums.length ? '<section class="section"><div class="section-head"><h2>Альбомы</h2><p>' + albums.length + "</p></div>" + '<div class="grid cards">' + albums.map(albumCard).join("") + "</div></section>" : "") +
      '<section class="section"><div class="section-head"><h2>Треки</h2><p>' + tracks.length + " · играют превью 30 сек</p></div>" + trackListHtml(tracks, "artist-" + id, ids) + "</section>";
  }

  function viewAlbum(id) {
    var al = albumById(id);
    if (!al) return errorBox("Альбом не найден.");
    var a = artistById(al.artistId);
    var tracks = al.trackIds.map(trackById).filter(Boolean);
    var ids = tracks.map(function (t) { return t.id; });
    var saved = store.likedAlbums.indexOf(id) !== -1;
    var total = tracks.reduce(function (s, t) { return s + (t.fullMs || 0); }, 0);
    var art = tracks[0] ? tracks[0].art : "";
    var fb = tracks[0] ? fallbackUrl(tracks[0]) : "";
    return '<div class="entity-head">' + imgTag(art, "entity-cover", 480, fb) +
      '<div><p class="entity-kicker">АЛЬБОМ · ' + al.year + "</p>" + '<h1 class="entity-title" tabindex="-1">' + esc(al.title) + "</h1>" +
      '<p class="entity-sub"><a href="#/artist/' + esc(al.artistId) + '">' + esc(a ? a.name : "") + "</a> · " + tracks.length + " " + plural(tracks.length, "трек", "трека", "треков") + " · полная версия " + fmtFull(total) + "</p>" +
      '<div class="entity-actions"><button class="btn btn-primary" data-action="play-ids" data-ids="' + esc(ids.join(",")) + '">' + ICONS.play + ' Слушать превью</button>' +
      '<button class="btn" data-action="save-album" data-id="' + esc(id) + '" aria-pressed="' + (saved ? "true" : "false") + '">' + (saved ? "✓ Сохранено" : "+ Сохранить") + "</button></div>" +
      '<p style="margin:12px 0 0"><a class="text-link" href="https://www.youtube.com/results?search_query=' + encodeURIComponent((a ? a.name : "") + " " + al.title) + '" target="_blank" rel="noopener">Слушать бесплатно на YouTube ' + ICONS.ext + "</a></p></div></div>" +
      '<p class="kv" style="margin-bottom:12px">В Pulse играют 30-секундные превью. Полные версии — через YouTube (кнопка FULL у трека).</p>' +
      trackListHtml(tracks, "album-" + id, ids);
  }

  function viewPlaylist(id) {
    var p = playlistById(id);
    if (!p) return errorBox("Плейлист не найден или был удалён.");
    var tracks = p.trackIds.map(trackById).filter(Boolean);
    var ids = tracks.map(function (t) { return t.id; });
    var total = tracks.reduce(function (s, t) { return s + (t.fullMs || 0); }, 0);
    var editable = canEditPlaylist(p);
    var rows = tracks.length ? tracks.map(function (t, i) {
      var extra = editable ? '<button class="icon-btn" data-action="remove-from-pl" data-pl="' + esc(p.id) + '" data-track="' + esc(t.id) + '" aria-label="Убрать ' + esc(t.title) + ' из плейлиста">' + ICONS.close + "</button>" : "";
      return trackRow(t, i, ids, false).replace('<span title="Полная версия">', extra + '<span title="Полная версия">');
    }).join("") : emptyBox("Плейлист пустой", "Добавьте треки кнопкой «+» в любом списке.", '<a class="btn" href="#/home">Найти треки</a>');
    return '<div class="entity-head">' + plMosaic(p, "entity-cover") +
      '<div><p class="entity-kicker">' + (p.auto ? "ПЛЕЙЛИСТ ИСПОЛНИТЕЛЯ" : p.editorial ? "ПОДБОРКА РЕДАКЦИИ" : "ВАШ ПЛЕЙЛИСТ") + " · " + esc(p.updated || "") + "</p>" +
      '<h1 class="entity-title" tabindex="-1">' + esc(p.title) + "</h1>" +
      '<p class="entity-sub">' + esc(p.description || "") + "</p><p class='kv'>" + tracks.length + " " + plural(tracks.length, "трек", "трека", "треков") + " · полная версия " + fmtFull(total) + "</p>" +
      '<div class="entity-actions"><button class="btn btn-primary" data-action="play-ids" data-ids="' + esc(ids.join(",")) + '"' + (tracks.length ? "" : " disabled") + ">" + ICONS.play + ' Слушать</button>' +
      (editable
        ? '<button class="btn" data-action="rename-pl" data-id="' + esc(p.id) + '">Переименовать</button>' +
          '<button class="btn btn-danger" data-action="delete-pl" data-id="' + esc(p.id) + '">Удалить</button>'
        : "") + "</div></div></div>" +
      '<div class="track-list">' + rows + "</div>";
  }

  function viewFiles() {
    var ids = localTracks.map(function (x) { return x.id; });
    var list = localTracks.length ? localTracks.map(function (t, i) {
      return trackRow(t, i, ids, false).replace('<span title="Полная версия">',
        '<button class="icon-btn" data-action="delete-file" data-id="' + esc(t.id) + '" aria-label="Удалить файл: ' + esc(t.title) + '">' + ICONS.close + '</button><span title="Полная версия">');
    }).join("") : emptyBox("Пока нет файлов", "Добавьте музыку с устройства — она заиграет целиком, даже без интернета, и останется после перезапуска.", "");
    return '<h1 tabindex="-1">Мои файлы</h1><p class="kv">Полные версии с вашего устройства. Файлы никуда не отправляются и хранятся только в этом браузере.</p>' +
      '<div class="entity-actions"><label class="btn btn-primary" for="filePick">' + ICONS.plus + ' Добавить файлы<input type="file" id="filePick" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac" multiple hidden /></label></div>' +
      '<div class="divider"></div><div class="track-list">' + list + "</div>";
  }

  function statRows(top, max) {
    return top.map(function (x, i) {
      var pct = max > 0 ? Math.round((x.sec / max) * 100) : 0;
      return '<a class="stat-row" href="#/artist/' + esc(x.artist.id) + '" aria-label="' + esc(x.artist.name) + ", " + fmtDur(x.sec) + '">' +
        '<span class="stat-num">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>" +
        artistImg(x.artist, 96, "mini-cover") +
        '<span><b>' + esc(x.artist.name) + '</b><br><span class="kv">' + esc(x.artist.genre) + '</span><span class="stat-bar"><i style="width:' + pct + '%"></i></span></span>' +
        '<span class="stat-time">' + fmtDur(x.sec) + "</span></a>";
    }).join("");
  }

  function viewStats() {
    var d = new Date();
    d.setMonth(d.getMonth() + statsOffset);
    var key = d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1);
    var top = topArtists(key, 5);
    var total = monthTotal(key);
    var plays = monthPlays(key);
    var max = top.length ? top[0].sec : 0;
    var nav = '<div class="month-nav"><button class="btn btn-sm" data-action="month-nav" data-d="-1"' + (statsOffset <= -2 ? " disabled" : "") + ' aria-label="Предыдущий месяц">←</button>' +
      "<b>" + monthLabel(key) + (statsOffset === 0 ? " · текущий" : "") + "</b>" +
      '<button class="btn btn-sm" data-action="month-nav" data-d="1"' + (statsOffset >= 0 ? " disabled" : "") + ' aria-label="Следующий месяц">→</button></div>';
    var body = top.length
      ? '<div class="hero-stats" style="border:none;margin:6px 0 4px;padding:0"><div><b>' + fmtDur(total) + '</b><span>всего за месяц</span></div><div><b>' + plays + '</b><span>' + plural(plays, "включение", "включения", "включений") + " " + plural(plays, "трека", "треков", "треков") + '</span></div><div><b>' + top.length + '</b><span>' + plural(top.length, "исполнитель", "исполнителя", "исполнителей") + ' в топе</span></div></div>' +
        '<div class="divider"></div>' + statRows(top, max)
      : emptyBox("В этом месяце тихо", "Включите что-нибудь — счётчик считает только реальное время прослушивания.", '<a class="btn btn-primary" href="#/home">Включить музыку</a>');
    return '<h1 tabindex="-1">Статистика</h1><p class="kv">Сколько часов и кого вы слушали. Считаются только секунды реального воспроизведения превью.</p>' + nav + body;
  }

  function variantGrid(sel) {
    var name = profileName();
    var seed = store.profile.seed;
    var out = "";
    for (var v = 0; v < 6; v++) {
      out += '<button class="variant-pick' + (sel === v ? " sel" : "") + '" data-action="pick-variant" data-v="' + v + '" aria-label="Аватар вариант ' + (v + 1) + '" aria-pressed="' + (sel === v ? "true" : "false") + '">' +
        imgTag(Art.avatar(name === "Гость" && !store.profile.name ? "Pulse" : name, seed, v, 160), "", 160, "") + "</button>";
    }
    return '<div class="variant-grid" role="group" aria-label="Выбор аватара">' + out + "</div>";
  }

  function profileAvatar(size) {
    var pf = store.profile;
    if (pf.avatar) return pf.avatar;
    return Art.avatar(pf.name || "Pulse", pf.seed, pf.variant, size || 240);
  }
  function avatarUploadRow() {
    return '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center">' +
      '<label class="btn btn-sm" for="avatarPick">Загрузить фото</label><input type="file" id="avatarPick" accept="image/*" hidden />' +
      (store.profile.avatar ? '<button class="btn btn-sm btn-ghost" data-action="avatar-clear">Убрать фото</button>' : "") +
      '<span class="kv">или выберите вариант ниже</span></div>';
  }

  function viewProfile() {
    var pf = store.profile;
    var av = profileAvatar(240);
    if (pf.fresh && !pf.name) {
      return '<p class="entity-kicker">ПРОФИЛЬ</p><h1 tabindex="-1">Создайте профиль</h1><p class="kv">Имя и аватар хранятся только в вашем браузере.</p>' +
        '<div class="profile-card">' + imgTag(av, "", 240, "") +
        '<div><div class="field"><label for="pfName">Как вас зовут?</label><input class="text-input" id="pfName" maxlength="30" placeholder="Например: Тимур" /></div>' +
        avatarUploadRow() +
        variantGrid(pf.variant) +
        '<button class="btn btn-primary" data-action="save-profile">Создать профиль</button></div></div>';
    }
    var mk = monthKey(Date.now());
    var top = topArtists(mk, 3);
    var mine = store.playlists.filter(function (p) { return canEditPlaylist(p); });
    return '<p class="entity-kicker">ПРОФИЛЬ</p><h1 tabindex="-1">' + esc(pf.name) + "</h1>" +
      '<div class="profile-card">' + imgTag(av, "", 240, "") +
      '<div><div class="field"><label for="pfName">Имя</label><input class="text-input" id="pfName" maxlength="30" value="' + esc(pf.name) + '" /></div>' +
      avatarUploadRow() +
      variantGrid(pf.variant) +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" data-action="save-profile">Сохранить</button>' +
      '<button class="btn btn-sm btn-ghost" data-action="reset-demo">Сбросить демо-данные</button></div></div></div>' +
      '<section class="section"><div class="section-head"><h2>Этот месяц</h2><p>' + monthLabel(mk) + '</p><span class="spacer"></span><a class="link-more" href="#/stats">Вся статистика</a></div>' +
      (top.length ? '<p class="kv">Вы слушали <b style="color:var(--text)">' + fmtDur(monthTotal(mk)) + "</b>. Чаще всего:</p>" + statRows(top, top[0].sec)
        : '<p class="kv">Пока тихо — включите музыку, и здесь появится ваш топ.</p>') + "</section>" +
      '<section class="section"><div class="section-head"><h2>Мои плейлисты</h2><p>' + mine.length + '</p><span class="spacer"></span><button class="btn btn-sm" data-action="create-pl">+ Новый</button></div>' +
      (mine.length ? '<div class="grid cards">' + mine.map(playlistCard).join("") + "</div>" : '<p class="kv">Создайте первый плейлист — он появится здесь.</p>') + "</section>";
  }

  /* ---------- router ---------- */
  function currentRoute() {
    var h = location.hash || "#/home";
    var m;
    if ((m = h.match(/^#\/artist\/([\w-]+)/))) return { name: "artist", id: m[1] };
    if ((m = h.match(/^#\/album\/([\w-]+)/))) return { name: "album", id: m[1] };
    if ((m = h.match(/^#\/playlist\/([\w-]+)/))) return { name: "playlist", id: m[1] };
    if (h.indexOf("#/search") === 0) {
      var q = "";
      var qm = h.match(/[?&]q=([^&]*)/);
      if (qm) { try { q = decodeURIComponent(qm[1]); } catch (e) { q = ""; } }
      return { name: "search", q: q };
    }
    if (h === "#/library") return { name: "library" };
    if (h === "#/files") return { name: "files" };
    if (h === "#/liked") return { name: "liked" };
    if (h === "#/history") return { name: "history" };
    if (h === "#/profile") return { name: "profile" };
    if (h === "#/stats") return { name: "stats" };
    return { name: "home" };
  }

  var TITLES = { home: "Главная", search: "Поиск", library: "Библиотека", files: "Мои файлы", liked: "Мне нравится", history: "История", profile: "Профиль", stats: "Статистика" };

  function render(instant) {
    var r = currentRoute();
    var view = $("#view");
    var my = ++routeToken;
    paintNav(r);
    if (!instant) {
      view.innerHTML = '<div aria-hidden="true">' + skeletonCards(4) + '</div><div style="height:14px"></div>' + skeletonRows(5) + '<p class="kv" role="status">Загружаем музыку…</p>';
    }
    var build = function () {
      if (my !== routeToken) return;
      var html = "";
      try {
        if (r.name === "home") html = viewHome();
        else if (r.name === "search") html = viewSearch(r.q);
        else if (r.name === "library") html = viewLibrary();
        else if (r.name === "files") html = viewFiles();
        else if (r.name === "liked") html = viewLiked();
        else if (r.name === "history") html = viewHistory();
        else if (r.name === "artist") { var a = artistById(r.id); html = viewArtist(r.id); document.title = (a ? a.name : "Исполнитель") + " — Pulse"; }
        else if (r.name === "album") { var al = albumById(r.id); html = viewAlbum(r.id); document.title = (al ? al.title : "Альбом") + " — Pulse"; }
        else if (r.name === "playlist") { var pl = playlistById(r.id); html = viewPlaylist(r.id); document.title = (pl ? pl.title : "Плейлист") + " — Pulse"; }
        else if (r.name === "profile") html = viewProfile();
        else if (r.name === "stats") html = viewStats();
        else html = viewHome();
        if (TITLES[r.name]) document.title = TITLES[r.name] + " — Pulse";
      } catch (e) {
        html = errorBox("Не удалось отрисовать страницу.");
      }
      view.innerHTML = html;
      observeLazy();
      paintPlayState();
      upgradeYTLinks(view);
    };
    if (instant) build();
    else setTimeout(build, 300);
  }

  function paintNav(r) {
    $all("[data-nav]").forEach(function (a) {
      var key = a.getAttribute("data-nav");
      var active = (key === r.name) ||
        (key === "library" && (r.name === "library" || r.name === "liked")) ||
        (key === "history" && r.name === "history");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function observeLazy() {
    $all(".card").forEach(function (c) { c.classList.add("visible"); });
  }

  /* ---------- очередь ---------- */
  function renderQueue() {
    var body = $("#queueBody");
    if (!body) return;
    if (!queue.length) {
      body.innerHTML = '<div class="empty"><h3>Очередь пуста</h3><p>Включите любой трек — следующие появятся здесь.</p></div>';
      paintPlayState();
      return;
    }
    body.innerHTML = queue.map(function (id, i) {
      var t = trackById(id);
      if (!t) return "";
      var cur = id === currentId;
      return '<div class="track-row' + (cur ? " active" : "") + '" data-track="' + esc(id) + '">' +
        '<span class="track-num">' + (i + 1) + "</span>" + imgTag(t.art, "track-cover", 96, fallbackUrl(t)) +
        '<div class="track-main"><button class="track-title-btn" data-action="queue-jump" data-i="' + i + '" aria-label="Слушать из очереди: ' + esc(t.title) + '">' +
        esc(t.title) + (cur ? " · сейчас играет" : "") + '</button><span class="track-artist">' + esc(t.credit) + "</span></div>" +
        '<span class="track-side"><button class="icon-btn" data-action="queue-remove" data-i="' + i + '" aria-label="Убрать из очереди: ' + esc(t.title) + '">' + ICONS.close + "</button></span></div>";
    }).join("");
    paintPlayState();
  }
  function openQueue() { $("#queueDrawer").classList.add("open"); $("#scrim").classList.add("show"); $("#queueClose").focus(); renderQueue(); }
  function closeQueue() { $("#queueDrawer").classList.remove("open"); $("#scrim").classList.remove("show"); }

  /* ---------- профиль в шапке ---------- */
  function renderProfileSlots() {
    var pf = store.profile;
    var url = profileAvatar(96);
    var sp = $("#sideProfile");
    if (sp) sp.innerHTML = '<img class="side-avatar" src="' + url + '" alt="" aria-hidden="true" /><span><b>' + esc(profileName()) + "</b><span>Профиль · статистика</span></span>";
    var tp = $("#topProfile");
    if (tp) {
      tp.innerHTML = '<img src="' + url + '" alt="" aria-hidden="true" /><span>' + esc(profileName()) + "</span>";
      tp.setAttribute("aria-label", "Профиль: " + profileName());
    }
  }

  function refreshSide() {
    var box = $("#sidePlaylists");
    if (!box) return;
    box.innerHTML = store.playlists.slice(0, 8).map(function (p) {
      return '<a class="side-pl" href="#/playlist/' + esc(p.id) + '">' +
        imgTag(plCover(p), "mini-cover", 96, "") +
        "<span>" + esc(p.title) + "</span></a>";
    }).join("");
  }

  /* ---------- мои файлы (IndexedDB) ---------- */
  var IDB = {
    db: null,
    open: function () {
      return new Promise(function (res, rej) {
        try {
          var q = indexedDB.open("pulse-files", 1);
          q.onupgradeneeded = function (e) { e.target.result.createObjectStore("tracks", { keyPath: "id" }); };
          q.onsuccess = function (e) { IDB.db = e.target.result; res(); };
          q.onerror = function () { rej(new Error("idb")); };
        } catch (e) { rej(e); }
      });
    },
    all: function () {
      return new Promise(function (res) {
        try {
          var tx = IDB.db.transaction("tracks").objectStore("tracks").getAll();
          tx.onsuccess = function () { res(tx.result || []); };
          tx.onerror = function () { res([]); };
        } catch (e) { res([]); }
      });
    },
    put: function (rec) {
      return new Promise(function (res) {
        try {
          var tx = IDB.db.transaction("tracks", "readwrite").objectStore("tracks").put(rec);
          tx.onsuccess = function () { res(true); };
          tx.onerror = function () { res(false); };
        } catch (e) { res(false); }
      });
    },
    del: function (id) {
      return new Promise(function (res) {
        try {
          var tx = IDB.db.transaction("tracks", "readwrite").objectStore("tracks").delete(id);
          tx.onsuccess = function () { res(true); };
          tx.onerror = function () { res(false); };
        } catch (e) { res(false); }
      });
    }
  };

  function localArt(pal, seed, title) {
    try { return Art.cover({ pal: pal, seed: seed, title: title }, 320); }
    catch (e) { return ""; }
  }

  function loadLocalFiles() {
    return IDB.open().then(IDB.all).then(function (recs) {
      localTracks = [];
      (recs || []).forEach(function (r) {
        try {
          if (!r.blob) return;
          localTracks.push({
            id: r.id, title: r.title, credit: r.credit, artistId: "local", albumId: null,
            rel: "Мой файл", fullMs: r.fullMs || 0, year: r.year || new Date().getFullYear(),
            genre: "Мой файл", seed: r.seed, pal: r.pal, art: localArt(r.pal, r.seed, r.title),
            preview: URL.createObjectURL(r.blob), apple: null, local: true
          });
        } catch (e) {}
      });
    }).catch(function () {});
  }

  function addLocalFile(f) {
    return new Promise(function (res) {
      var base = String(f.name || "трек").replace(/\.[^.]+$/, "");
      var title = base, credit = "Мой файл";
      var m = base.match(/^(.*?)\s*-\s*(.+)$/);
      if (m) { credit = (m[1] || "").trim() || credit; title = (m[2] || "").trim() || title; }
      var rec = {
        id: "f" + Date.now() + Math.floor(Math.random() * 10000),
        title: title.slice(0, 80), credit: credit.slice(0, 80),
        seed: 1000 + Math.floor(Math.random() * 9000), pal: Math.floor(Math.random() * 8),
        fullMs: 0, year: new Date().getFullYear()
      };
      var url = null;
      try { url = URL.createObjectURL(f); } catch (e) {}
      var finished = false;
      var done = function () {
        if (finished) return;
        finished = true;
        IDB.put({ id: rec.id, title: rec.title, credit: rec.credit, seed: rec.seed, pal: rec.pal, fullMs: rec.fullMs, year: rec.year, blob: f }).then(function (ok) {
          if (ok && url) {
            localTracks.push({
              id: rec.id, title: rec.title, credit: rec.credit, artistId: "local", albumId: null,
              rel: "Мой файл", fullMs: rec.fullMs, year: rec.year, genre: "Мой файл",
              seed: rec.seed, pal: rec.pal, art: localArt(rec.pal, rec.seed, rec.title),
              preview: url, apple: null, local: true
            });
          }
          res(ok);
        });
      };
      if (url) {
        try {
          var a = new Audio();
          a.preload = "metadata";
          var to = setTimeout(done, 5000);
          a.onloadedmetadata = function () { clearTimeout(to); rec.fullMs = Math.round((a.duration || 0) * 1000); done(); };
          a.onerror = function () { clearTimeout(to); done(); };
          a.src = url;
          return;
        } catch (e) {}
      }
      done();
    });
  }

  function importFiles(files) {
    var arr = Array.prototype.slice.call(files || []).filter(function (f) {
      return /^audio\//.test(f.type || "") || /\.(mp3|m4a|wav|ogg|flac|aac|opus)$/i.test(f.name || "");
    });
    if (!arr.length) { toast("Выберите аудиофайлы"); return; }
    toast("Добавляем: " + arr.length);
    var chain = Promise.resolve(), okCount = 0;
    arr.slice(0, 100).forEach(function (f) {
      chain = chain.then(function () { return addLocalFile(f).then(function (ok) { if (ok) okCount++; }); });
    });
    chain.then(function () { saveStore(); render(true); toast(okCount ? "Добавлено в «Мои файлы»: " + okCount : "Не удалось сохранить файлы"); });
  }

  function importAvatar(f) {
    if (!f || !/^image\//.test(f.type || "")) { toast("Выберите картинку"); return; }
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var img = new Image();
        img.onload = function () {
          try {
            var S = 256;
            var cv = document.createElement("canvas");
            cv.width = S; cv.height = S;
            var g = cv.getContext("2d");
            var side = Math.min(img.width || S, img.height || S);
            g.drawImage(img, ((img.width || S) - side) / 2, ((img.height || S) - side) / 2, side, side, 0, 0, S, S);
            store.profile.avatar = cv.toDataURL("image/jpeg", 0.85);
            saveStore(); renderProfileSlots(); render(true);
            toast("Аватар обновлён");
          } catch (e) { toast("Не удалось прочитать файл"); }
        };
        img.onerror = function () { toast("Не удалось прочитать файл"); };
        img.src = rd.result;
      } catch (e) { toast("Не удалось прочитать файл"); }
    };
    rd.onerror = function () { toast("Не удалось прочитать файл"); };
    try { rd.readAsDataURL(f); } catch (e) { toast("Не удалось прочитать файл"); }
  }

  /* ---------- events ---------- */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a[data-link]")) { e.stopPropagation(); return; }
      var fab = e.target.closest && e.target.closest(".play-fab");
      if (fab) {
        e.preventDefault(); e.stopPropagation();
        var kind = fab.getAttribute("data-action"), fid = fab.getAttribute("data-id");
        if (kind === "play-pl") playPlaylist(fid);
        else if (kind === "play-album") playAlbum(fid);
        return;
      }
      var el = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!el) return;
      var a = el.getAttribute("data-action");
      var id2 = el.getAttribute("data-id");
      if (a === "play-track") {
        var ctx = (el.getAttribute("data-context") || "").split(",").filter(Boolean);
        if (currentId === id2 && engine.isPlaying()) engine.pause();
        else if (currentId === id2 && !engine.isPlaying()) engine.play();
        else playTrack(id2, ctx.length ? ctx : null);
      } else if (a === "toggle-like") { toggleLike(id2); }
      else if (a === "play-full") {
        var pctx = (el.getAttribute("data-context") || "").split(",").filter(Boolean);
        if ($("#modalRoot").innerHTML) closeModal();
        playFull(id2, pctx.length ? pctx : null);
      }
      else if (a === "player-artist") { if (currentId) modalArtistsMenu(currentId); else toast("Сначала включите любой трек"); }
      else if (a === "artists-menu") { modalArtistsMenu(id2); }
      else if (a === "go-artist") { closeModal(); if (currentRoute().id !== id2 || currentRoute().name !== "artist") location.hash = "#/artist/" + id2; else render(true); }
      else if (a === "add-to-pl") { modalAddToPlaylist(id2); }
      else if (a === "do-add-to-pl") {
        var pl = playlistById(el.getAttribute("data-pl")), tr = el.getAttribute("data-track");
        if (pl && pl.auto) { toast("Автоплейлист менять нельзя — создайте свой"); return; }
        if (pl && tr && pl.trackIds.indexOf(tr) === -1) {
          pl.trackIds.push(tr); pl.updated = "Обновлено только что"; saveStore(); refreshSide();
          toast("Добавлено в «" + pl.title + "»"); modalAddToPlaylist(tr);
          if (currentRoute().name === "playlist" && currentRoute().id === pl.id) render(true);
        }
      } else if (a === "play-ids") {
        var ids = (el.getAttribute("data-ids") || "").split(",").filter(Boolean);
        if (ids.length) setQueueAndPlay(ids, 0);
      } else if (a === "shuffle-ids") {
        var ids2 = (el.getAttribute("data-ids") || "").split(",").filter(Boolean);
        if (ids2.length) { setQueueAndPlay(ids2, Math.floor(Math.random() * ids2.length)); store.shuffle = true; saveStore(); paintPlayState(); }
      } else if (a === "play-pop") { setQueueAndPlay(DB.CHART.slice(), 0); }
      else if (a === "stop-all") {
        try { AE().pause(); } catch (e) {}
        if (ytMode) { try { ytEng.stop(); } catch (e) {} }
        else { try { engine.seek(0); } catch (e) {} }
        paintProgress(0, activeDur());
        paintPlayState();
        toast("Остановлено");
      }
      else if (a === "shuffle-all") {
        var all = TRACKS.map(function (t) { return t.id; });
        store.shuffle = true; saveStore();
        setQueueAndPlay(all, Math.floor(Math.random() * all.length)); paintPlayState();
      } else if (a === "play-pl") { playPlaylist(id2); }
      else if (a === "play-album") { playAlbum(id2); }
      else if (a === "create-pl") { modalCreatePlaylist(); }
      else if (a === "do-create-pl") {
        var name = ($("#plName") || {}).value || "";
        var desc = ($("#plDesc") || {}).value || "";
        name = (name.trim() || "Новый плейлист").slice(0, 60);
        var np = { id: "u" + Date.now(), title: name, description: desc.slice(0, 120) || "Собрано вручную", pal: Math.floor(Math.random() * 8), seed: 1000 + Math.floor(Math.random() * 9000), editorial: false, updated: "Создан только что", trackIds: currentId ? [currentId] : [] };
        store.playlists.push(np); saveStore(); refreshSide(); closeModal(); toast("Плейлист «" + np.title + "» создан");
        location.hash = "#/playlist/" + np.id;
      } else if (a === "rename-pl") { modalRenamePlaylist(id2); }
      else if (a === "do-rename-pl") {
        var p2 = playlistById(id2);
        var nv = (($("#plName") || {}).value || "").trim();
        if (p2 && canEditPlaylist(p2) && nv) { p2.title = nv.slice(0, 60); saveStore(); refreshSide(); closeModal(); render(true); toast("Переименовано"); }
      } else if (a === "delete-pl") { modalDeletePlaylist(id2); }
      else if (a === "do-delete-pl") {
        var p3 = playlistById(id2);
        if (p3 && !canEditPlaylist(p3)) { closeModal(); return; }
        store.playlists = store.playlists.filter(function (p) { return p.id !== id2; });
        saveStore(); refreshSide(); closeModal(); toast("Плейлист удалён");
        if (currentRoute().name === "playlist" && currentRoute().id === id2) location.hash = "#/library";
        else render(true);
      } else if (a === "remove-from-pl") {
        var pp = playlistById(el.getAttribute("data-pl")), tt = el.getAttribute("data-track");
        if (pp && canEditPlaylist(pp)) { pp.trackIds = pp.trackIds.filter(function (x) { return x !== tt; }); saveStore(); render(true); toast("Трек убран из плейлиста"); }
      } else if (a === "save-album") {
        var ai = el.getAttribute("data-id");
        var ix = store.likedAlbums.indexOf(ai);
        if (ix === -1) { store.likedAlbums.push(ai); toast("Альбом сохранён в библиотеку"); }
        else { store.likedAlbums.splice(ix, 1); toast("Альбом убран из библиотеки"); }
        saveStore(); render(true);
      } else if (a === "expand") { expandedLists[el.getAttribute("data-key")] = true; render(true); }
      else if (a === "search-filter") { searchFilter = el.getAttribute("data-f"); render(true); }
      else if (a === "clear-search") { var s = $("#topSearch"); if (s) s.value = ""; location.hash = "#/search"; render(true); }
      else if (a === "clear-history") { store.history = []; saveStore(); render(true); toast("История очищена"); }
      else if (a === "queue-jump") { playAt(parseInt(el.getAttribute("data-i"), 10) || 0); }
      else if (a === "queue-remove") {
        var ri = parseInt(el.getAttribute("data-i"), 10) || 0;
        queue.splice(ri, 1);
        if (ri < queueIndex) queueIndex--;
        renderQueue();
      } else if (a === "delete-file") {
        localTracks = localTracks.filter(function (x) { return x.id !== id2; });
        store.playlists.forEach(function (p) { p.trackIds = p.trackIds.filter(function (x) { return x !== id2; }); });
        store.likes = store.likes.filter(function (x) { return x !== id2; });
        if (currentId === id2) { engine.pause(); currentId = null; updatePlayerChrome(); }
        IDB.del(id2).then(function () { saveStore(); refreshSide(); render(true); toast("Файл удалён"); });
      } else if (a === "retry") { render(false); }
      else if (a === "close-modal") { closeModal(); }
      else if (a === "go-profile") { location.hash = "#/profile"; }
      else if (a === "save-profile") {
        var nm = (($("#pfName") || {}).value || "").trim().slice(0, 30);
        if (!nm) { toast("Введите имя"); var inp = $("#pfName"); if (inp) inp.focus(); return; }
        store.profile.name = nm;
        store.profile.fresh = false;
        saveStore(); renderProfileSlots(); render(true);
        toast("Профиль сохранён");
      }       else if (a === "pick-variant") {
        store.profile.variant = parseInt(el.getAttribute("data-v"), 10) || 0;
        saveStore(); renderProfileSlots(); render(true);
      } else if (a === "avatar-clear") {
        store.profile.avatar = null;
        saveStore(); renderProfileSlots(); render(true);
        toast("Фото убрано");
      } else if (a === "month-nav") {
        statsOffset = Math.max(-2, Math.min(0, statsOffset + (parseInt(el.getAttribute("data-d"), 10) || 0)));
        render(true);
      } else if (a === "reset-demo") {
        store.playlists = JSON.parse(JSON.stringify(DB.PLAYLISTS));
        ensureThisPlaylists();
        store.likes = []; store.likedAlbums = []; store.history = []; store.stats = {};
        saveStore(); refreshSide(); render(true); toast("Демо-данные сброшены");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeQueue(); return; }
      if (e.key === "Tab") { // ловушка фокуса внутри модалки
        var mroot = $("#modalRoot");
        if (!mroot || !mroot.innerHTML) return;
        var items = Array.prototype.slice.call(mroot.querySelectorAll("button, input, select, a[href]")).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.code === "Space") { e.preventDefault(); AE().toggle(); }
      else if (e.key === "n" || e.key === "N" || e.key === "т" || e.key === "Т") { nextTrack(false); }
      else if (e.key === "p" || e.key === "P" || e.key === "з" || e.key === "З") { prevTrack(); }
      else if (e.key === "m" || e.key === "M" || e.key === "ь" || e.key === "Ь") { toggleMute(); }
      else if (e.key === "/") { e.preventDefault(); var ss = $("#topSearch"); if (ss) ss.focus(); }
    });

    window.addEventListener("hashchange", function () { render(false); });

    var deb = null;
    document.addEventListener("input", function (e) {
      if (e.target && e.target.id === "topSearch") {
        var val = e.target.value || "";
        clearTimeout(deb);
        deb = setTimeout(function () {
          if (currentRoute().name !== "search") location.hash = "#/search?q=" + encodeURIComponent(val);
          else { history.replaceState(null, "", "#/search?q=" + encodeURIComponent(val)); render(true); }
        }, 220);
      }
    });
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "searchForm") {
        e.preventDefault();
        location.hash = "#/search?q=" + encodeURIComponent(($("#topSearch") || {}).value || "");
      }
    });
    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "filePick") { importFiles(e.target.files); e.target.value = ""; }
      if (e.target && e.target.id === "avatarPick" && e.target.files && e.target.files[0]) { importAvatar(e.target.files[0]); e.target.value = ""; }
    });

    $("#btnPlay").addEventListener("click", function () {
      engine.unlock();
      if (!currentId) { setQueueAndPlay(DB.CHART.slice(), 0); return; }
      AE().toggle();
    });
    $("#btnNext").addEventListener("click", function () { engine.unlock(); nextTrack(false); });
    $("#btnPrev").addEventListener("click", function () { engine.unlock(); prevTrack(); });
    $("#btnShuffle").addEventListener("click", function () {
      store.shuffle = !store.shuffle; saveStore(); paintPlayState();
      toast(store.shuffle ? "Случайный порядок включён" : "Случайный порядок выключен");
    });
    $("#btnRepeat").addEventListener("click", function () {
      store.repeat = store.repeat === "off" ? "all" : store.repeat === "all" ? "one" : "off";
      saveStore(); paintPlayState();
    });
    $("#pLike").addEventListener("click", function () { if (currentId) toggleLike(currentId); else toast("Сначала включите любой трек"); });
    $("#pAdd").addEventListener("click", function () { if (currentId) modalAddToPlaylist(currentId); else toast("Сначала включите любой трек"); });

    var seek = $("#seek");
    seek.addEventListener("pointerdown", function () { seeking = true; });
    seek.addEventListener("pointerup", function () { seeking = false; });
    seek.addEventListener("input", function () {
      var t = currentTrack();
      if (!t) return;
      var d = activeDur() || 30;
      AE().seek(((parseInt(seek.value, 10) || 0) / 1000) * d);
      paintProgress(AE().position(), d);
    });
    seek.addEventListener("change", function () { seeking = false; });

    var vol = $("#vol");
    vol.addEventListener("input", function () {
      var v = parseInt(vol.value, 10);
      store.volume = v / 100;
      if (v > 0 && store.muted) store.muted = false;
      engine.setVolume(store.volume); engine.setMuted(store.muted);
      ytEng.setVolume(store.volume); ytEng.setMuted(store.muted);
      saveStore(); paintPlayState();
    });
    $("#btnMute").addEventListener("click", toggleMute);
    $("#btnQueue").addEventListener("click", function () {
      if ($("#queueDrawer").classList.contains("open")) closeQueue(); else openQueue();
    });
    $("#queueClose").addEventListener("click", closeQueue);
    $("#scrim").addEventListener("click", closeQueue);

    setInterval(function () {
      var t = currentTrack();
      if (t && AE().isPlaying()) {
        var mk = monthKey(Date.now());
        if (!statAcc[mk]) statAcc[mk] = {};
        statAcc[mk][t.artistId] = (statAcc[mk][t.artistId] || 0) + 1;
        paintProgress(AE().position(), activeDur());
      }
    }, 1000);
    setInterval(flushStats, 15000);
    document.addEventListener("visibilitychange", function () { if (document.hidden) flushStats(); });
    window.addEventListener("beforeunload", flushStats);
  }

  function toggleLike(id) {
    var i = store.likes.indexOf(id);
    if (i === -1) { store.likes.push(id); toast("Добавлено в «Мне нравится»"); }
    else { store.likes.splice(i, 1); toast("Убрано из «Мне нравится»"); }
    saveStore(); syncLikeButtons(id); refreshSide(); updatePlayerLike();
    var r = currentRoute().name;
    if (r === "liked" || r === "library") render(true);
  }
  function toggleMute() {
    store.muted = !store.muted;
    engine.setMuted(store.muted);
    ytEng.setMuted(store.muted);
    saveStore(); paintPlayState();
  }
  function playPlaylist(id) {
    var p = playlistById(id);
    if (!p || !p.trackIds.length) { toast("В плейлисте нет треков"); return; }
    setQueueAndPlay(p.trackIds.slice(), 0);
  }
  function playAlbum(id) {
    var al = albumById(id);
    if (!al) return;
    var ids = al.trackIds.filter(function (x) { return !!trackById(x); });
    if (ids.length) setQueueAndPlay(ids, 0);
  }

  function init() {
    try { console.log("%cPulse — собрано Detroll для портфолио", "font-weight:bold"); } catch (e) {}
    loadStore();
    engine.setVolume(store.volume);
    engine.setMuted(store.muted);
    ytEng.setVolume(store.volume);
    ytEng.setMuted(store.muted);
    $("#vol").value = String(Math.round(store.volume * 100));
    refreshSide();
    renderProfileSlots();
    bindEvents();
    updatePlayerChrome();
    renderQueue();
    loadLocalFiles().then(function () {
      if (currentRoute().name === "files" || currentRoute().name === "library") render(true);
      if (!location.hash) location.hash = "#/home";
      render(false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
