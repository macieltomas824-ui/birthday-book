/* ============================================================================
   MÚSICA  ·  js/music.js
   ============================================================================
   · mode "musicbox": melodía original generada con WebAudio (0 KB de audio).
   · mode "file": reproduce el MP3 indicado en config.js.
   · mode "off": oculta el botón.

   La música nunca suena sin un gesto de la persona. Si había quedado activada
   en una visita anterior, se reanuda con el primer toque o tecla.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});
  const music = (BB.music = {});
  const STORAGE_KEY = "bb.music.on";

  const EIGHTH = 0.38; // segundos por corchea (aprox. 79 ppm en 3/4)
  const BARS = [
    [72, 76, 79, 84, 79, 76],
    [69, 72, 76, 81, 76, 72],
    [65, 69, 72, 77, 72, 69],
    [67, 71, 74, 79, 74, 71],
    [72, 76, 79, 84, 79, 76],
    [69, 72, 76, 81, 76, 72],
    [65, 69, 72, 77, 72, 69],
    [67, 71, 74, 79, 74, 71]
  ];
  const NOTES = BARS.reduce((all, bar) => all.concat(bar), []);

  let mode = "off";
  let button = null;
  let playing = false;
  let storedOn = false;
  let autoArmed = false;

  // WebAudio
  let ctx = null;
  let master = null;
  let timer = 0;
  let nextTime = 0;
  let noteIndex = 0;

  // Archivo MP3
  let audio = null;
  let fileFailed = false;

  const cfg = () => (window.CONTENT && window.CONTENT.music) || {};
  const volume = () => BB.clamp(Number(cfg().volume) || 0.45, 0, 1);

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function updateUi() {
    if (!button) return;
    const ui = (window.CONTENT && window.CONTENT.ui) || {};
    button.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", playing ? "true" : "false");
    button.setAttribute("aria-label", playing ? ui.musicOn || "Silenciar música" : ui.musicOff || "Activar música");
    button.title = cfg().title || "Música";
  }

  function persist(value) {
    if (cfg().rememberState === false) {
      BB.store.remove(STORAGE_KEY);
      return;
    }
    BB.store.set(STORAGE_KEY, Boolean(value));
  }

  /* ------------------------------ WebAudio -------------------------------- */

  function ensureContext() {
    if (ctx) return true;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return false;

    try {
      ctx = new AudioCtor();
    } catch {
      return false;
    }

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 22;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.3;
    compressor.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(compressor);

    // Eco corto y suave, como el de una cajita de música en una habitación.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.29;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.2;
    const wet = ctx.createGain();
    wet.gain.value = 0.14;

    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(compressor);

    return true;
  }

  function note(midi, time, peak) {
    if (!ctx || !master) return;
    const frequency = midiToFreq(midi);

    const main = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    const envelope = ctx.createGain();

    main.type = "sine";
    main.frequency.value = frequency;
    shimmer.type = "triangle";
    shimmer.frequency.value = frequency * 2;

    shimmerGain.gain.value = 0.13;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 1.55);

    main.connect(envelope);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(envelope);
    envelope.connect(master);

    main.start(time);
    shimmer.start(time);
    main.stop(time + 1.6);
    shimmer.stop(time + 1.6);
  }

  function tick() {
    if (!playing || !ctx) return;
    const now = ctx.currentTime;

    while (nextTime < now + 1.2) {
      const midi = NOTES[noteIndex % NOTES.length];
      note(midi, nextTime, 0.2);
      if (noteIndex % 12 === 0) note(midi + 12, nextTime + 0.02, 0.055);
      nextTime += EIGHTH;
      noteIndex += 1;
    }

    timer = window.setTimeout(tick, 240);
  }

  function startBox() {
    if (!ensureContext()) {
      BB.toast("Este navegador no puede reproducir la cajita de música.", { tone: "error" });
      return Promise.resolve(false);
    }

    const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();

    return Promise.resolve(resume)
      .then(() => {
        playing = true;
        persist(true);
        updateUi();
        nextTime = ctx.currentTime + 0.08;
        noteIndex = 0;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, volume() * 0.55),
          ctx.currentTime + 0.6
        );
        tick();
        return true;
      })
      .catch(() => {
        BB.toast("No se pudo iniciar la música. Toca el botón otra vez.", { tone: "error" });
        return false;
      });
  }

  function stopBox() {
    playing = false;
    window.clearTimeout(timer);
    timer = 0;
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    }
  }

  /* ------------------------------- Archivo -------------------------------- */

  function ensureAudio() {
    if (audio) return true;
    const src = String(cfg().src || "").trim();
    if (!src) return false;

    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = volume();
    audio.addEventListener("error", () => {
      fileFailed = true;
      playing = false;
      updateUi();
      BB.toast("No se encontró el archivo de música. Revisa music.src en config.js.", { tone: "error" });
    });
    return true;
  }

  function startFile() {
    if (!ensureAudio()) {
      BB.toast("Falta la ruta del archivo de música en config.js.", { tone: "error" });
      return Promise.resolve(false);
    }
    if (fileFailed) {
      BB.toast("El archivo de música no está disponible.", { tone: "error" });
      return Promise.resolve(false);
    }

    audio.volume = volume();
    return audio
      .play()
      .then(() => {
        playing = true;
        persist(true);
        updateUi();
        return true;
      })
      .catch(() => {
        BB.toast("No se pudo reproducir el archivo. Revisa que exista en assets/music/.", { tone: "error" });
        return false;
      });
  }

  function stopFile() {
    if (!audio) return;
    audio.pause();
    playing = false;
  }

  /* -------------------------------- Control ------------------------------- */

  function play() {
    if (mode === "off") return Promise.resolve(false);
    const action = mode === "file" ? startFile : startBox;
    return Promise.resolve(action()).then((ok) => {
      if (ok) {
        BB.announce("Música activada.");
        updateUi();
      }
      return ok;
    });
  }

  function pause() {
    if (mode === "file") stopFile();
    else stopBox();
    persist(false);
    updateUi();
    BB.announce("Música silenciada.");
  }

  function toggle() {
    if (playing) pause();
    else play();
  }

  function disarmAuto() {
    if (!autoArmed) return;
    autoArmed = false;
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
  }

  function onFirstGesture(event) {
    if (event.target && event.target.closest && event.target.closest("#music-btn")) {
      disarmAuto();
      return;
    }
    disarmAuto();
    if (storedOn) play();
  }

  function armAuto() {
    if (autoArmed) return;
    autoArmed = true;
    document.addEventListener("pointerdown", onFirstGesture, true);
    document.addEventListener("keydown", onFirstGesture, true);
  }

  music.init = function () {
    const settings = cfg();
    mode = ["musicbox", "file"].includes(settings.mode) ? settings.mode : "off";
    button = BB.$("#music-btn");

    if (!button || mode === "off") {
      if (button) button.hidden = true;
      return;
    }

    button.hidden = false;
    updateUi();
    button.addEventListener("click", toggle);

    storedOn = cfg().rememberState !== false && BB.store.get(STORAGE_KEY, false) === true;

    if (storedOn) {
      armAuto();
    }

    // Si el MP3 falla al cargar, no mostramos un botón que no hace nada.
    if (mode === "file" && !String(settings.src || "").trim()) {
      button.hidden = true;
    }
  };

  music.isPlaying = () => playing;
  music.toggle = toggle;
  music.pause = function () {
    if (playing) pause();
  };
})();
