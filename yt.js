/* Pulse — полные версии через официальный YouTube IFrame Player API.
 * Ничего не скачивается: звук идёт с серверов YouTube по их правилам.
 * Интерфейс совпадает с аудио-движком, плеер переключает источник сам. */
(function () {
  "use strict";

  var apiLoading = false;
  var apiReady = false;
  var readyQueue = [];

  function loadApi() {
    if (apiReady || apiLoading) return;
    apiLoading = true;
    try {
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = function () { apiLoading = false; flushReady(false); };
      document.head.appendChild(s);
      setTimeout(function () { if (!apiReady) flushReady(false); }, 15000);
    } catch (e) { apiLoading = false; flushReady(false); }
  }
  function flushReady(ok) {
    var q = readyQueue;
    readyQueue = [];
    q.forEach(function (fn) { try { fn(ok); } catch (e) {} });
  }
  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    flushReady(true);
  };

  function createEngine(hooks) {
    var player = null;
    var playerReady = false;
    var pending = null; // {id, autoplay}
    var currentId = null;
    var volume = 0.8, muted = false;
    var wantPlay = false;

    function ensurePlayer(cb) {
      if (playerReady && player) { cb(true); return; }
      loadApi();
      if (apiReady) { buildPlayer(cb); return; }
      readyQueue.push(function (ok) {
        if (ok) buildPlayer(cb);
        else cb(false);
      });
    }

    function buildPlayer(cb) {
      if (playerReady && player) { cb(true); return; }
      try {
        player = new window.YT.Player("ytPlayer", {
          width: "4",
          height: "4",
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: function () {
              playerReady = true;
              try { player.setVolume(Math.round(volume * 100)); } catch (e) {}
              try { muted ? player.mute() : player.unMute(); } catch (e) {}
              if (pending && pending.autoplay && wantPlay) {
                var id = pending.id;
                pending = null;
                try { player.loadVideoById(id); } catch (e) {}
              } else if (pending) {
                var id2 = pending.id;
                pending = null;
                try { player.cueVideoById(id2); } catch (e) {}
              }
              cb(true);
            },
            onStateChange: function (e) {
              var YT = window.YT;
              if (!YT) return;
              if (e.data === YT.PlayerState.ENDED) {
                if (hooks && hooks.onEnded) hooks.onEnded();
              } else if (e.data === YT.PlayerState.PLAYING) {
                if (hooks && hooks.onPlay) hooks.onPlay();
              } else if (e.data === YT.PlayerState.PAUSED) {
                if (hooks && hooks.onPause) hooks.onPause();
              }
            },
            onError: function () {
              if (hooks && hooks.onError) hooks.onError();
            }
          }
        });
      } catch (e) { cb(false); }
    }

    function load(videoId, autoplay) {
      currentId = videoId;
      wantPlay = !!autoplay;
      ensurePlayer(function (ok) {
        if (!ok) {
          if (hooks && hooks.onError) hooks.onError();
          return;
        }
        if (!playerReady || !player) { pending = { id: videoId, autoplay: wantPlay }; return; }
        try {
          if (wantPlay) player.loadVideoById(videoId);
          else player.cueVideoById(videoId);
        } catch (e) {
          if (hooks && hooks.onError) hooks.onError();
        }
      });
    }

    function stop() {
      wantPlay = false;
      pending = null;
      if (playerReady && player) { try { player.stopVideo(); } catch (e) {} }
    }

    return {
      load: load,
      stop: stop,
      play: function () {
        wantPlay = true;
        if (pending && pending.id) { pending.autoplay = true; }
        if (playerReady && player) { try { player.playVideo(); } catch (e) {} }
        else if (currentId) load(currentId, true);
      },
      pause: function () {
        wantPlay = false;
        if (pending) pending.autoplay = false;
        if (playerReady && player) { try { player.pauseVideo(); } catch (e) {} }
      },
      toggle: function () {
        if (this.isPlaying()) this.pause();
        else this.play();
      },
      seek: function (sec) {
        if (playerReady && player) { try { player.seekTo(sec, true); } catch (e) {} }
      },
      setVolume: function (v) {
        volume = Math.max(0, Math.min(1, v));
        if (playerReady && player) { try { player.setVolume(Math.round(volume * 100)); } catch (e) {} }
      },
      setMuted: function (m) {
        muted = !!m;
        if (playerReady && player) { try { muted ? player.mute() : player.unMute(); } catch (e) {} }
      },
      position: function () {
        if (playerReady && player) { try { return player.getCurrentTime() || 0; } catch (e) {} }
        return 0;
      },
      duration: function () {
        if (playerReady && player) { try { return player.getDuration() || 0; } catch (e) {} }
        return 0;
      },
      isPlaying: function () {
        if (playerReady && player && window.YT) {
          try { return player.getPlayerState() === window.YT.PlayerState.PLAYING; } catch (e) {}
        }
        return wantPlay && !!currentId;
      }
    };
  }

  window.PulseYT = { create: createEngine };
})();
