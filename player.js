/* Pulse: плеер на настоящем аудио (превью iTunes, ~30 сек).
 * Прогресс, перемотка, громкость, очередь: всё честно, через <audio>. */
(function () {
  "use strict";

  function createEngine(hooks) {
    var audio = new Audio();
    audio.preload = "auto";

    var state = {
      track: null,
      playing: false,
      volume: 0.8,
      muted: false
    };
    var errorStreak = 0;

    function emitTick() {
      if (hooks && typeof hooks.onTick === "function") {
        hooks.onTick(audio.currentTime || 0, audio.duration || 0);
      }
    }

    audio.addEventListener("timeupdate", emitTick);
    audio.addEventListener("loadedmetadata", function () {
      if (hooks && typeof hooks.onMeta === "function") hooks.onMeta(audio.duration || 0);
      emitTick();
    });
    audio.addEventListener("play", function () {
      state.playing = true;
      if (hooks && typeof hooks.onPlay === "function") hooks.onPlay(state.track);
    });
    audio.addEventListener("pause", function () {
      state.playing = false;
      if (hooks && typeof hooks.onPause === "function") hooks.onPause(state.track);
    });
    audio.addEventListener("ended", function () {
      state.playing = false;
      errorStreak = 0;
      if (hooks && typeof hooks.onEnded === "function") hooks.onEnded();
    });
    audio.addEventListener("error", function () {
      if (!state.track) return;
      errorStreak++;
      state.playing = false;
      if (hooks && typeof hooks.onError === "function") hooks.onError(state.track, errorStreak);
    });

    function load(track, autoplay) {
      state.track = track;
      errorStreak = 0;
      if (audio.src !== track.preview) {
        try { audio.src = track.preview; } catch (e) {}
      } else {
        try { audio.currentTime = 0; } catch (e) {}
      }
      if (hooks && typeof hooks.onTrack === "function") hooks.onTrack(track);
      if (autoplay) play();
      else emitTick();
    }

    function play() {
      if (!state.track) return;
      var pr = null;
      try { pr = audio.play(); } catch (e) { pr = null; }
      if (pr && typeof pr.catch === "function") {
        pr.then(function () { errorStreak = 0; }).catch(function () {
          state.playing = false;
          if (hooks && typeof hooks.onBlocked === "function") hooks.onBlocked(state.track);
          if (hooks && typeof hooks.onPause === "function") hooks.onPause(state.track);
        });
      }
    }

    function pause() {
      try { audio.pause(); } catch (e) {}
      state.playing = false;
    }

    function toggle() {
      if (state.playing) pause();
      else play();
    }

    function seek(sec) {
      if (!state.track) return;
      var d = audio.duration || 30;
      var t = Math.max(0, Math.min(d - 0.1, sec));
      try { audio.currentTime = t; } catch (e) {}
      emitTick();
    }

    function setVolume(v) {
      state.volume = Math.max(0, Math.min(1, v));
      try { audio.volume = state.muted ? 0 : state.volume; } catch (e) {}
    }
    function setMuted(m) {
      state.muted = !!m;
      try { audio.muted = state.muted; } catch (e) {}
    }

    return {
      state: state,
      load: load,
      play: play,
      pause: pause,
      toggle: toggle,
      seek: seek,
      setVolume: setVolume,
      setMuted: setMuted,
      position: function () { return audio.currentTime || 0; },
      duration: function () { return audio.duration || 0; },
      isPlaying: function () { return state.playing && !audio.paused; },
      unlock: function () {}
    };
  }

  window.PulseEngine = { create: createEngine };
})();
