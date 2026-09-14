/* Pulse — генеративные обложки и аватарки (canvas, без сети).
 * Плоские дуотоновые палитры + геометрия + зерно. Детерминировано по seed. */
(function () {
  "use strict";

  var PALETTES = [
    { bg: "#EDE4D3", fg: "#191713", acc: "#D8491F" }, // бумага / чернила / красный
    { bg: "#131311", fg: "#F2EFE4", acc: "#FFCE2E" }, // чёрный / кость / жёлтый
    { bg: "#123B2C", fg: "#DCE9CF", acc: "#E8762B" }, // хвоя / мята / оранж
    { bg: "#1C2A4A", fg: "#D7E2EE", acc: "#E4572E" }, // navy / лёд / коралл
    { bg: "#E7D9BC", fg: "#3A2415", acc: "#1E1E1E" }, // песок / коричневый / чёрный
    { bg: "#EFE9DC", fg: "#5A4A1F", acc: "#2E5FE4" }, // лён / олива / синий
    { bg: "#222224", fg: "#E8E8E8", acc: "#2E9E6B" }, // графит / белый / зелёный
    { bg: "#D8D2C4", fg: "#23202E", acc: "#7A3FF2" }  // серый / чернила / фиолет
  ];

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var cache = new Map();
  function get(key) { return cache.get(key); }
  function put(key, val) {
    cache.set(key, val);
    if (cache.size > 90) {
      var first = cache.keys().next().value;
      cache.delete(first);
    }
  }

  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/);
    var out = "";
    for (var i = 0; i < parts.length && out.length < 2; i++) {
      var ch = parts[i].replace(/^[^A-Za-zА-Яа-яЁё0-9]+/, "").charAt(0);
      if (ch) out += ch.toUpperCase();
    }
    return out || "?";
  }

  function draw(pal, seed, label, sub, size, round) {
    var cv = document.createElement("canvas");
    cv.width = size; cv.height = size;
    var g = cv.getContext("2d");
    var P = PALETTES[pal % PALETTES.length];
    var rnd = mulberry32(seed * 2654435761 % 4294967296 || seed);
    var S = size, u = S / 100;

    g.fillStyle = P.bg;
    g.fillRect(0, 0, S, S);

    var comp = Math.abs(seed) % 5;
    g.fillStyle = P.fg;
    g.strokeStyle = P.fg;
    var i, x, y, r;

    if (comp === 0) {
      // солнце + горизонт
      r = S * (0.28 + rnd() * 0.14);
      x = S * (0.3 + rnd() * 0.4); y = S * (0.3 + rnd() * 0.2);
      g.fillStyle = P.acc;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = P.fg;
      var hy = y + r * 0.35;
      g.fillRect(0, hy, S, S - hy);
      g.fillStyle = P.bg;
      for (i = 0; i < 3; i++) g.fillRect(0, hy + 6 * u + i * 7 * u, S, 2.2 * u);
    } else if (comp === 1) {
      // полосы
      var n = 4 + Math.floor(rnd() * 4), px = 0;
      for (i = 0; i < n; i++) {
        var w = S * (0.06 + rnd() * 0.2);
        g.fillStyle = i % 3 === 2 ? P.acc : P.fg;
        g.fillRect(px, 0, w * (0.4 + rnd()), S);
        px += w + S * 0.03 * rnd();
        if (px > S) break;
      }
      g.fillStyle = P.bg;
      g.beginPath(); g.arc(S * (0.2 + rnd() * 0.6), S * (0.25 + rnd() * 0.5), S * 0.11, 0, Math.PI * 2); g.fill();
    } else if (comp === 2) {
      // сетка точек
      var step = S / 9;
      for (y = 0; y < 9; y++) for (x = 0; x < 9; x++) {
        var hot = rnd() < 0.16;
        g.fillStyle = hot ? P.acc : P.fg;
        g.globalAlpha = hot ? 1 : 0.55 + rnd() * 0.3;
        g.beginPath(); g.arc(step * (x + 0.5), step * (y + 0.5), u * (1.6 + rnd() * 2.4), 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      g.fillStyle = P.acc;
      g.fillRect(0, S * 0.78, S, S * 0.22);
    } else if (comp === 3) {
      // диагональ + круг
      g.fillStyle = P.fg;
      g.save();
      g.translate(S / 2, S / 2); g.rotate(-0.5 - rnd() * 0.3);
      g.fillRect(-S, -S * 0.16, S * 2, S * 0.32);
      g.restore();
      g.fillStyle = P.acc;
      g.beginPath(); g.arc(S * (0.68 + rnd() * 0.12), S * (0.24 + rnd() * 0.15), S * 0.13, 0, Math.PI * 2); g.fill();
      g.strokeStyle = P.fg; g.lineWidth = Math.max(2, u * 2);
      g.beginPath(); g.arc(S * 0.3, S * 0.72, S * 0.17, 0, Math.PI * 2); g.stroke();
    } else {
      // кольца
      x = S * (0.35 + rnd() * 0.3); y = S * (0.35 + rnd() * 0.3);
      for (i = 5; i >= 1; i--) {
        g.fillStyle = i % 2 ? P.fg : P.acc;
        g.beginPath(); g.arc(x, y, (S * 0.42 * i) / 5, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = P.bg;
      g.beginPath(); g.arc(x, y, S * 0.07, 0, Math.PI * 2); g.fill();
    }

    // зерно
    g.fillStyle = P.fg;
    for (i = 0; i < Math.floor(S * 2.2); i++) {
      g.globalAlpha = 0.05 + rnd() * 0.06;
      g.fillRect(rnd() * S, rnd() * S, 1.2, 1.2);
    }
    g.globalAlpha = 1;

    // подпись: инициалы + каталожный номер
    var labelShort = label || "";
    g.fillStyle = comp === 2 ? P.bg : P.fg;
    if (comp === 0) g.fillStyle = P.bg;
    g.font = "800 " + Math.floor(S * 0.21) + "px Arial, sans-serif";
    g.textBaseline = "alphabetic";
    g.fillText(labelShort, S * 0.07, S * 0.93);
    g.font = "700 " + Math.floor(S * 0.055) + "px Arial, sans-serif";
    g.globalAlpha = 0.75;
    g.fillText(sub || "", S * 0.07, S * 0.1);
    g.globalAlpha = 1;

    if (round) {
      var out = document.createElement("canvas");
      out.width = size; out.height = size;
      var og = out.getContext("2d");
      og.beginPath(); og.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      og.clip();
      og.drawImage(cv, 0, 0);
      return out.toDataURL("image/jpeg", 0.85);
    }
    return cv.toDataURL("image/jpeg", 0.85);
  }

  function cover(entity, size) {
    size = size || 320;
    var key = "c:" + entity.pal + ":" + entity.seed + ":" + size;
    var hit = get(key);
    if (hit) return hit;
    var url = "";
    try {
      var label = initials(entity.short || entity.title || entity.name);
      var sub = "PLS-" + String(Math.abs(entity.seed) % 900 + 100);
      url = draw(entity.pal || 0, entity.seed || 7, label, sub, size, false);
    } catch (e) { url = ""; }
    put(key, url);
    return url;
  }

  // Аватарки профиля: 6 авторских тем (палитра и композиция зафиксированы,
  // seed влияет только на зерно и мелкие смещения — иконки узнаваемы).
  var AVATARS = [
    { bg: "#241533", bg2: "#E8762B", fg: "#F5EBD7", acc: "#FFCE2E" }, // закат
    { bg: "#EDE4D3", bg2: "#EDE4D3", fg: "#191713", acc: "#D8491F" }, // баухаус
    { bg: "#101014", bg2: "#1A1A22", fg: "#F2EFE4", acc: "#2EE6A8" }, // диагональ
    { bg: "#0F2E23", bg2: "#0F2E23", fg: "#DCE9CF", acc: "#E8762B" }, // кольца
    { bg: "#1C2A4A", bg2: "#1C2A4A", fg: "#D7E2EE", acc: "#FF5A3C" }, // точки
    { bg: "#0D1B2A", bg2: "#0D1B2A", fg: "#F3F0E6", acc: "#7FD4FF" }  // волны
  ];

  function avatar(name, seed, variant, size) {
    size = size || 160;
    var key = "a:" + name + ":" + seed + ":" + variant + ":" + size;
    var hit = get(key);
    if (hit) return hit;
    var url = "";
    try {
      var v = ((variant % 6) + 6) % 6;
      var P = AVATARS[v];
      var cv = document.createElement("canvas");
      cv.width = size; cv.height = size;
      var g = cv.getContext("2d");
      var rnd = mulberry32((seed * 2654435761 + v * 97) % 4294967296 || (v + 7));
      var S = size, u = S / 100, i, x, y;
      var label = initials(name);

      if (v === 0) { // закат: градиент, солнце, горизонт
        var grad = g.createLinearGradient(0, 0, 0, S);
        grad.addColorStop(0, P.bg); grad.addColorStop(0.72, "#7A2E4D"); grad.addColorStop(1, P.bg2);
        g.fillStyle = grad; g.fillRect(0, 0, S, S);
        var sx = S * (0.5 + (rnd() - 0.5) * 0.1), sy = S * 0.44, sr = S * 0.26;
        g.fillStyle = P.acc;
        g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
        g.fillStyle = P.bg;
        g.fillRect(0, sy + sr * 0.3, S, S);
        g.fillStyle = "rgba(245,235,215,0.85)";
        for (i = 0; i < 2; i++) g.fillRect(0, sy + sr * 0.3 + (8 + i * 8) * u, S, 2 * u);
      } else if (v === 1) { // баухаус: полосы + круг
        g.fillStyle = P.bg; g.fillRect(0, 0, S, S);
        var bars = [P.fg, P.acc, P.fg, "#1E5AA8", P.fg];
        var bx = 0;
        for (i = 0; i < bars.length; i++) {
          var bw = S * (0.1 + rnd() * 0.12);
          g.fillStyle = bars[i];
          g.fillRect(bx, 0, bw, S);
          bx += bw + S * 0.045;
          if (bx > S) break;
        }
        g.fillStyle = P.acc;
        g.beginPath(); g.arc(S * 0.68, S * 0.62, S * 0.17, 0, Math.PI * 2); g.fill();
        g.fillStyle = P.bg;
        g.beginPath(); g.arc(S * 0.68, S * 0.62, S * 0.07, 0, Math.PI * 2); g.fill();
      } else if (v === 2) { // диагональ: луч, точка, кольцо
        g.fillStyle = P.bg; g.fillRect(0, 0, S, S);
        g.fillStyle = P.bg2;
        g.fillRect(0, 0, S, S * 0.35);
        g.save();
        g.translate(S / 2, S / 2); g.rotate(-0.55);
        var beam = g.createLinearGradient(0, -S * 0.2, 0, S * 0.2);
        beam.addColorStop(0, P.fg); beam.addColorStop(1, "#9A9AA5");
        g.fillStyle = beam;
        g.fillRect(-S, -S * 0.13, S * 2, S * 0.26);
        g.restore();
        g.fillStyle = P.acc;
        g.beginPath(); g.arc(S * 0.72, S * 0.3, S * 0.11, 0, Math.PI * 2); g.fill();
        g.strokeStyle = P.fg; g.lineWidth = Math.max(2, u * 2.4);
        g.beginPath(); g.arc(S * 0.3, S * 0.7, S * 0.16, 0, Math.PI * 2); g.stroke();
      } else if (v === 3) { // кольца на хвое
        g.fillStyle = P.bg; g.fillRect(0, 0, S, S);
        x = S * 0.5; y = S * 0.44;
        var cols = [P.fg, P.acc, P.fg, P.acc, P.fg];
        for (i = 0; i < cols.length; i++) {
          g.fillStyle = cols[i];
          g.beginPath(); g.arc(x, y, (S * 0.4 * (cols.length - i)) / cols.length, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = P.bg;
        g.beginPath(); g.arc(x, y, S * 0.07, 0, Math.PI * 2); g.fill();
        g.fillStyle = P.fg;
        g.fillRect(0, S * 0.82, S, S * 0.18);
      } else if (v === 4) { // точки + плашка
        g.fillStyle = P.bg; g.fillRect(0, 0, S, S);
        var step = S / 8;
        for (y = 0; y < 6; y++) for (x = 0; x < 8; x++) {
          var hot = rnd() < 0.14;
          g.fillStyle = hot ? P.acc : P.fg;
          g.globalAlpha = hot ? 1 : 0.5 + rnd() * 0.35;
          g.beginPath(); g.arc(step * (x + 0.5), step * (y + 0.55), u * (1.7 + rnd() * 2.6), 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
        g.fillStyle = P.acc;
        g.fillRect(0, S * 0.8, S, S * 0.2);
      } else { // волны + луна
        g.fillStyle = P.bg; g.fillRect(0, 0, S, S);
        g.fillStyle = P.fg;
        g.beginPath(); g.arc(S * 0.72, S * 0.26, S * 0.14, 0, Math.PI * 2); g.fill();
        var waves = ["#1B3A5C", "#2E5FE4", P.acc];
        for (i = 0; i < 3; i++) {
          g.fillStyle = waves[i];
          g.globalAlpha = 0.85;
          g.beginPath();
          g.moveTo(0, S * (0.55 + i * 0.13));
          for (x = 0; x <= S; x += S / 24) g.lineTo(x, S * (0.55 + i * 0.13) + Math.sin(x / S * 6.28 + i * 2 + rnd() * 0.4) * S * 0.035);
          g.lineTo(S, S); g.lineTo(0, S);
          g.closePath(); g.fill();
        }
        g.globalAlpha = 1;
      }

      // зерно
      g.fillStyle = "#FFFFFF";
      var grains = Math.floor(S * 1.6);
      for (i = 0; i < grains; i++) {
        g.globalAlpha = 0.04 + rnd() * 0.05;
        g.fillRect(rnd() * S, rnd() * S, 1.2, 1.2);
      }
      g.globalAlpha = 1;

      // подпись: инициалы + марка
      var ink = (v === 1) ? P.fg : (v === 3 ? P.bg : P.fg);
      if (v === 0) ink = P.fg;
      if (v === 4) ink = P.bg;
      if (v === 5) ink = P.bg;
      g.fillStyle = ink;
      g.font = "800 " + Math.floor(S * 0.24) + "px Arial, sans-serif";
      g.textBaseline = "alphabetic";
      g.fillText(label, S * 0.07, S * 0.94);
      g.font = "700 " + Math.floor(S * 0.075) + "px Arial, sans-serif";
      g.globalAlpha = 0.8;
      g.fillText("PLS", S * 0.07, S * 0.13);
      g.globalAlpha = 1;

      url = cv.toDataURL("image/jpeg", 0.86);
    } catch (e) { url = ""; }
    put(key, url);
    return url;
  }

  function artistAvatar(artist, size) {
    size = size || 320;
    var key = "r:" + artist.id + ":" + size;
    var hit = get(key);
    if (hit) return hit;
    var url = "";
    try {
      url = draw(artist.pal || 0, (artist.seed || 7) + 5, initials(artist.name), artist.genre || "", size, true);
    } catch (e) { url = ""; }
    put(key, url);
    return url;
  }

  window.PulseArt = {
    PALETTES: PALETTES,
    cover: cover,
    avatar: avatar,
    artistAvatar: artistAvatar,
    initials: initials
  };
})();
